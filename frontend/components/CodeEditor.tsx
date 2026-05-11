"use client";
import { useRef, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type { Language, SampleCode } from "@/lib/types";
import { getSamplesByLang, getDefaultSample } from "@/lib/sampleCodes";

interface Props {
  code: string;
  language: Language;
  currentLine?: number;
  onChange: (code: string) => void;
  onLanguageChange: (lang: Language) => void;
  onVisualize: () => void;
  isLoading?: boolean;
}

const LANGUAGES: { id: Language; label: string; monacoId: string; ext: string }[] = [
  { id: "c",      label: "C",      monacoId: "c",    ext: ".c"   },
  { id: "cpp",    label: "C++",    monacoId: "cpp",  ext: ".cpp" },
  { id: "python", label: "Python", monacoId: "python",ext: ".py" },
  { id: "sql",    label: "SQL",    monacoId: "sql",  ext: ".sql" },
];

export default function CodeEditor({
  code,
  language,
  currentLine,
  onChange,
  onLanguageChange,
  onVisualize,
  isLoading = false,
}: Props) {
  const { theme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const [showSamples, setShowSamples] = useState(false);
  const decorationsRef = useRef<string[]>([]);

  const samples = getSamplesByLang(language);

  // Highlight current line
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !currentLine) {
      if (editor) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: "monaco-current-line",
          glyphMarginClassName: "monaco-glyph",
        },
      },
    ]);

    editor.revealLineInCenter(currentLine);
  }, [currentLine]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define LPU dark theme
    monaco.editor.defineTheme("lpu-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword",   foreground: "C586C0", fontStyle: "bold" },
        { token: "string",    foreground: "CE9178" },
        { token: "comment",   foreground: "6A9955", fontStyle: "italic" },
        { token: "number",    foreground: "B5CEA8" },
        { token: "type",      foreground: "4EC9B0" },
        { token: "function",  foreground: "DCDCAA" },
        { token: "variable",  foreground: "9CDCFE" },
        { token: "delimiter", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background":           "#0D1117",
        "editor.foreground":           "#E6EDF3",
        "editorLineNumber.foreground": "#4D5566",
        "editorLineNumber.activeForeground": "#1D9E75",
        "editor.lineHighlightBackground": "#1C2128",
        "editorCursor.foreground":     "#1D9E75",
        "editor.selectionBackground":  "#264F78",
        "editor.inactiveSelectionBackground": "#1E3A5F",
      },
    });

    // Define LPU light theme
    monaco.editor.defineTheme("lpu-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "keyword",   foreground: "0000FF", fontStyle: "bold" },
        { token: "string",    foreground: "A31515" },
        { token: "comment",   foreground: "008000", fontStyle: "italic" },
        { token: "number",    foreground: "098658" },
        { token: "type",      foreground: "267F99" },
        { token: "function",  foreground: "795E26" },
        { token: "variable",  foreground: "001080" },
      ],
      colors: {
        "editor.background":           "#FFFFFF",
        "editor.foreground":           "#333333",
        "editorLineNumber.foreground": "#94A3B8",
        "editorLineNumber.activeForeground": "#16A34A",
        "editor.lineHighlightBackground": "#F8FAFC",
        "editorCursor.foreground":     "#16A34A",
        "editor.selectionBackground":  "#ADD6FF",
        "editor.inactiveSelectionBackground": "#E5EBEF",
      },
    });
    
    monaco.editor.setTheme(theme === "light" ? "lpu-light" : "lpu-dark");
  };

  // Update theme dynamically
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === "light" ? "lpu-light" : "lpu-dark");
    }
  }, [theme]);

  const loadSample = (sample: SampleCode) => {
    onChange(sample.code);
    setShowSamples(false);
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
    }}>
      {/* Language tabs */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "8px 12px 0",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            id={`lang-tab-${lang.id}`}
            onClick={() => {
              onLanguageChange(lang.id);
              const sample = getDefaultSample(lang.id);
              if (sample) onChange(sample.code);
            }}
            style={{
              padding: "7px 16px",
              border: "none",
              borderRadius: "8px 8px 0 0",
              background: language === lang.id ? "#0D1117" : "transparent",
              color: language === lang.id ? "var(--primary-light)" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: language === lang.id ? 700 : 500,
              cursor: "pointer",
              borderBottom: language === lang.id ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.2s",
              fontFamily: "var(--font-mono)",
            }}
          >
            {lang.label}
          </button>
        ))}

        {/* Sample picker */}
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <button
            id="sample-picker-btn"
            onClick={() => setShowSamples((v) => !v)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--text-muted)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            📋 Samples ▾
          </button>

          {showSamples && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              zIndex: 50,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              minWidth: 220,
            }}>
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadSample(s)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    padding: "10px 14px",
                    border: "none",
                    borderBottom: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--card-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{s.title}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.topic}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          height="100%"
          language={LANGUAGES.find((l) => l.id === language)?.monacoId || "c"}
          value={code}
          onChange={(v) => onChange(v ?? "")}
          onMount={handleMount}
          options={{
            fontSize: 13,
            lineHeight: 22,
            fontFamily: "JetBrains Mono, Fira Code, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
            padding: { top: 12, bottom: 12 },
            wordWrap: "on",
            lineNumbers: "on",
            glyphMargin: true,
            folding: true,
            renderLineHighlight: "all",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
          }}
        />
      </div>

      {/* Visualize button */}
      <div style={{
        padding: "10px 12px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <button
          id="visualize-btn"
          onClick={onVisualize}
          disabled={isLoading || !code.trim()}
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: 15,
            borderRadius: 10,
            opacity: isLoading || !code.trim() ? 0.6 : 1,
            cursor: isLoading || !code.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? (
            <>
              <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span>
              Analyzing...
            </>
          ) : (
            <>⚡ Visualize</>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Click outside handler for sample picker */}
      {showSamples && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
          onClick={() => setShowSamples(false)}
        />
      )}
    </div>
  );
}
