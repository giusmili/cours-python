#!/usr/bin/env python3
"""Build a deterministic Moodle plugin ZIP for mod_lgcplayground.

The runtime Pyodide assets are generated before this script runs. The resulting
archive is self-contained and can be installed on Moodle STAGING without a
Node/npm build on the target host.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

REPOSITORY = "giusmili/cours-python"
COMPONENT = "mod_lgcplayground"
PLUGIN_DIRNAME = "lgcplayground"
PYODIDE_ASSETS = (
    "pyodide.js",
    "pyodide.mjs",
    "pyodide.asm.mjs",
    "pyodide.asm.wasm",
    "pyodide-lock.json",
    "python_stdlib.zip",
)
EXCLUDED_TOP_LEVEL = {".gitignore", "tests", "tools"}
MAX_ARCHIVE_BYTES = 100 * 1024 * 1024
ZIP_TIMESTAMP = (2026, 1, 1, 0, 0, 0)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def repo_root(plugin_root: Path) -> Path:
    return plugin_root.parents[2]


def resolve_commit(root: Path, requested: str | None) -> str:
    if requested:
        value = requested.strip().lower()
    else:
        value = (
            os.environ.get("GITHUB_SHA", "").strip().lower()
            or subprocess.check_output(
                ["git", "-C", str(root), "rev-parse", "HEAD"],
                text=True,
            ).strip().lower()
        )
    if not re.fullmatch(r"[a-f0-9]{40}", value):
        raise SystemExit("commit must be a 40-character lowercase SHA-1")
    return value


def plugin_metadata(version_php: Path) -> tuple[int, str]:
    text = version_php.read_text(encoding="utf-8")
    component = re.search(r"\$plugin->component\s*=\s*'([^']+)'\s*;", text)
    version = re.search(r"\$plugin->version\s*=\s*(\d+)\s*;", text)
    release = re.search(r"\$plugin->release\s*=\s*'([^']+)'\s*;", text)
    if not component or component.group(1) != COMPONENT:
        raise SystemExit(f"unexpected Moodle component in {version_php}")
    if not version:
        raise SystemExit(f"unable to parse plugin version from {version_php}")
    if not release:
        raise SystemExit(f"unable to parse plugin release from {version_php}")
    return int(version.group(1)), release.group(1)


def iter_runtime_files(plugin_root: Path) -> list[Path]:
    files: list[Path] = []
    for path in sorted(plugin_root.rglob("*")):
        relative = path.relative_to(plugin_root)
        if relative.parts and relative.parts[0] in EXCLUDED_TOP_LEVEL:
            continue
        if path.is_symlink():
            raise SystemExit(f"symlink refused in plugin package: {relative}")
        if path.is_file():
            files.append(path)
        elif path.exists() and not path.is_dir():
            raise SystemExit(f"non-regular filesystem entry refused: {relative}")
    return files


def write_zip(plugin_root: Path, files: list[Path], destination: Path) -> list[dict[str, object]]:
    manifest_files: list[dict[str, object]] = []
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for source in files:
            relative = source.relative_to(plugin_root).as_posix()
            archive_name = f"{PLUGIN_DIRNAME}/{relative}"
            data = source.read_bytes()
            info = zipfile.ZipInfo(archive_name, ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
            manifest_files.append(
                {
                    "path": relative,
                    "size": len(data),
                    "sha256": hashlib.sha256(data).hexdigest(),
                }
            )
    return manifest_files


def verify_archive(path: Path, expected_files: list[dict[str, object]]) -> None:
    if not path.is_file() or path.stat().st_size <= 0:
        raise SystemExit("plugin archive was not created")
    if path.stat().st_size > MAX_ARCHIVE_BYTES:
        raise SystemExit("plugin archive exceeds 100 MiB")

    expected_names = {f"{PLUGIN_DIRNAME}/{entry['path']}" for entry in expected_files}
    with zipfile.ZipFile(path) as archive:
        infos = archive.infolist()
        actual_names = {info.filename for info in infos if not info.is_dir()}
        if actual_names != expected_names:
            raise SystemExit("archive file set differs from manifest")
        if not all(name.startswith(f"{PLUGIN_DIRNAME}/") for name in actual_names):
            raise SystemExit("archive contains a file outside the lgcplayground root")
        for info in infos:
            parts = Path(info.filename).parts
            if info.filename.startswith("/") or ".." in parts:
                raise SystemExit(f"unsafe archive member: {info.filename}")


def write_promoter_release(
    plugin_root: Path,
    files: list[Path],
    destination: Path,
    commit: str,
    version: int,
    release: str,
) -> dict[str, object]:
    if destination.exists():
        shutil.rmtree(destination)

    plugin_destination = destination / "plugin"
    plugin_destination.mkdir(parents=True)
    manifest_files: list[dict[str, str]] = []

    for source in files:
        relative = source.relative_to(plugin_root)
        target = plugin_destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        manifest_files.append(
            {
                "path": f"plugin/{relative.as_posix()}",
                "sha256": sha256_file(target),
            }
        )

    manifest: dict[str, object] = {
        "schema_version": 1,
        "repository": REPOSITORY,
        "commit": commit,
        "extension": {
            "component": COMPONENT,
            "type": "mod",
            "version": version,
            "release": release,
        },
        "files": manifest_files,
    }
    (destination / "manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="dist/playground-staging")
    parser.add_argument("--commit")
    args = parser.parse_args()

    plugin_root = Path(__file__).resolve().parent.parent
    root = repo_root(plugin_root)
    output_dir = (root / args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    required = [
        plugin_root / "version.php",
        plugin_root / "view.php",
        plugin_root / "pyodide-worker.mjs",
        *(plugin_root / "pyodide" / asset for asset in PYODIDE_ASSETS),
    ]
    missing = [str(path.relative_to(root)) for path in required if not path.is_file() or path.stat().st_size == 0]
    if missing:
        raise SystemExit("missing required runtime files:\n- " + "\n- ".join(missing))

    commit = resolve_commit(root, args.commit)
    version, release = plugin_metadata(plugin_root / "version.php")
    files = iter_runtime_files(plugin_root)
    short = commit[:12]
    archive_path = output_dir / f"{PLUGIN_DIRNAME}-{short}.zip"
    manifest_path = output_dir / f"{PLUGIN_DIRNAME}-{short}.manifest.json"
    promoter_dir = output_dir / f"{PLUGIN_DIRNAME}-promoter-{short}"
    sums_path = output_dir / "SHA256SUMS"

    manifest_files = write_zip(plugin_root, files, archive_path)
    verify_archive(archive_path, manifest_files)
    promoter_manifest = write_promoter_release(
        plugin_root,
        files,
        promoter_dir,
        commit,
        version,
        release,
    )

    package = {
        "schema_version": 1,
        "repository": REPOSITORY,
        "commit": commit,
        "component": COMPONENT,
        "plugin_version": version,
        "archive": archive_path.name,
        "archive_size": archive_path.stat().st_size,
        "archive_sha256": sha256_file(archive_path),
        "files": manifest_files,
    }
    manifest_path.write_text(
        json.dumps(package, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    sums_path.write_text(
        f"{sha256_file(archive_path)}  {archive_path.name}\n"
        f"{sha256_file(manifest_path)}  {manifest_path.name}\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "archive": str(archive_path.relative_to(root)),
                "manifest": str(manifest_path.relative_to(root)),
                "promoter_release": str(promoter_dir.relative_to(root)),
                "sha256": package["archive_sha256"],
                "size": package["archive_size"],
                "files": len(manifest_files),
                "commit": commit,
                "plugin_version": version,
                "plugin_release": release,
                "promoter_files": len(promoter_manifest["files"]),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
