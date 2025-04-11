import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { SupportedLanguage } from "@/lib/supported-languages";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  height?: string;
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "300px",
  onMount,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      const model = monaco.editor.createModel(
        value,
        language.monacoLanguage
      );

      const editor = monaco.editor.create(editorRef.current, {
        model,
        theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        renderLineHighlight: "all",
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
        readOnly,
      });

      monacoEditorRef.current = editor;

      if (onChange) {
        editor.onDidChangeModelContent(() => {
          onChange(editor.getValue());
        });
      }

      if (onMount) {
        onMount(editor);
      }

      // Sync with theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            const isDark = document.documentElement.classList.contains("dark");
            monaco.editor.setTheme(isDark ? "vs-dark" : "vs-light");
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        editor.dispose();
        model.dispose();
        observer.disconnect();
      };
    }
  }, [value, language.monacoLanguage, readOnly, onChange, onMount]);

  // Update language when it changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language.monacoLanguage);
      }
    }
  }, [language.monacoLanguage]);

  return <div ref={editorRef} style={{ width: "100%", height }} />;
}
