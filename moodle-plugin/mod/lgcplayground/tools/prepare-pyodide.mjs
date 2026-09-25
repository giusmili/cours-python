import {copyFile, mkdir} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(here, '..');
const repoRoot = join(pluginRoot, '..', '..', '..');
const source = join(repoRoot, 'terrain-de-jeu', 'node_modules', 'pyodide');
const destination = join(pluginRoot, 'pyodide');
const assets = [
    'pyodide.js',
    'pyodide.mjs',
    'pyodide.asm.mjs',
    'pyodide.asm.wasm',
    'pyodide-lock.json',
    'python_stdlib.zip',
];

await mkdir(destination, {recursive: true});
for (const asset of assets) {
    await copyFile(join(source, asset), join(destination, asset));
}
console.log(`Prepared Pyodide ${assets.length} core assets in ${destination}`);
