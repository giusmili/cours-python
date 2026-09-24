"use client";

import { useEffect, useRef } from "react";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import {
  HighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { basicSetup, EditorView } from "codemirror";

type CodeEditorProps = {
  value: string;
  fileName: string;
  onChange: (value: string) => void;
};

const syntaxColors = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword],
    color: "var(--accent-2)",
  },
  {
    tag: [tags.string, tags.special(tags.string)],
    color: "var(--accent)",
  },
  {
    tag: [tags.number, tags.bool, tags.atom],
    color: "var(--warning)",
  },
  {
    tag: [tags.comment, tags.meta],
    color: "var(--muted)",
    fontStyle: "italic",
  },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.tagName,
      tags.attributeName,
      tags.propertyName,
    ],
    color: "var(--text-soft)",
  },
  {
    tag: [
      tags.definition(tags.variableName),
      tags.function(tags.variableName),
      tags.labelName,
    ],
    color: "var(--accent-2)",
  },
  {
    tag: tags.invalid,
    color: "var(--danger)",
    textDecoration: "underline",
  },
]);

const editorChrome = EditorView.theme(
  {
    "&": {
      height: "100%",
      minHeight: "330px",
      backgroundColor: "var(--code-bg)",
      color: "var(--text)",
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "var(--font-mono)",
      fontSize: "0.94rem",
      lineHeight: "1.66",
    },
    ".cm-content": {
      minHeight: "330px",
      padding: "21px 0",
      caretColor: "var(--accent)",
    },
    ".cm-line": {
      padding: "0 21px 0 10px",
    },
    ".cm-gutters": {
      minHeight: "330px",
      padding: "21px 0",
      border: "0",
      backgroundColor: "var(--code-bg)",
      color: "var(--muted)",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      minWidth: "3ch",
      padding: "0 12px 0 14px",
      textAlign: "right",
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "var(--text-soft)",
    },
    ".cm-foldGutter": {
      display: "none",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--accent)",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(138, 169, 232, 0.22) !important",
    },
    "&.cm-focused": {
      outline: "none",
      boxShadow: "inset 0 0 0 1px rgba(124, 217, 168, 0.24)",
    },
  },
  { dark: true },
);

function languageForFile(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "py":
      return python();
    case "css":
      return css();
    case "js":
    case "mjs":
    case "cjs":
      return javascript();
    case "html":
    case "htm":
    default:
      return html();
  }
}

export default function CodeEditor({
  value,
  fileName,
  onChange,
}: CodeEditorProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const applyingExternalValue = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) {
      return;
    }

    const view = new EditorView({
      doc: value,
      parent,
      extensions: [
        basicSetup,
        languageForFile(fileName),
        syntaxHighlighting(syntaxColors),
        EditorState.tabSize.of(2),
        indentUnit.of("  "),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          "aria-label": fileName,
          autocapitalize: "off",
          autocomplete: "off",
          spellcheck: "false",
        }),
        editorChrome,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !applyingExternalValue.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = view;

    return () => {
      viewRef.current = null;
      view.destroy();
    };
  }, [fileName]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    const current = view.state.doc.toString();
    if (current === value) {
      return;
    }

    applyingExternalValue.current = true;
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    });
    applyingExternalValue.current = false;
  }, [value]);

  return <div className="code-editor" ref={parentRef} />;
}
