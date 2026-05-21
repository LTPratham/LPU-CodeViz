"use client";
import { useRef, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type { Language, SampleCode } from "@/lib/types";
import { getDefaultSample } from "@/lib/sampleCodes";

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
  { id: "java",   label: "Java",   monacoId: "java", ext: ".java"},
  { id: "html",   label: "HTML",   monacoId: "html", ext: ".html"},
];

const KEYWORDS: Record<string, string[]> = {
  c: ["int", "float", "char", "double", "void", "if", "else", "while", "for", "return", "struct", "switch", "case", "break", "continue", "sizeof", "typedef", "printf", "scanf", "malloc", "free", "NULL"],
  cpp: ["int", "float", "char", "double", "void", "if", "else", "while", "for", "return", "struct", "switch", "case", "break", "continue", "sizeof", "typedef", "class", "public", "private", "protected", "virtual", "override", "std", "cout", "cin", "vector", "string", "template", "typename", "new", "delete", "namespace", "using", "NULL", "nullptr"],
  python: ["def", "class", "if", "elif", "else", "while", "for", "in", "return", "import", "from", "as", "try", "except", "finally", "with", "lambda", "None", "True", "False", "print", "len", "range", "append", "self", "list", "dict", "set", "int", "str"],
  java: ["public", "private", "protected", "class", "interface", "extends", "implements", "new", "this", "super", "if", "else", "while", "for", "return", "void", "int", "double", "boolean", "char", "float", "String", "System", "out", "println", "import", "static", "final", "null"],
  sql: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "TABLE", "JOIN", "ON", "GROUP", "BY", "ORDER", "HAVING", "INDEX", "INTO", "VALUES", "AND", "OR", "NOT", "AS", "INNER", "LEFT", "RIGHT", "OUTER", "COUNT", "SUM", "AVG", "MIN", "MAX"],
  html: ["div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img", "button", "input", "form", "label", "select", "option", "textarea", "table", "tr", "td", "th", "thead", "tbody", "ul", "ol", "li", "style", "script", "link", "meta", "head", "body", "html", "class", "id", "href", "src", "onClick", "onChange"],
};

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
  const decorationsRef = useRef<string[]>([]);
  const disposablesRef = useRef<any[]>([]);

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

  // Clean up completion providers on unmount
  useEffect(() => {
    return () => {
      disposablesRef.current.forEach((d) => d.dispose());
    };
  }, []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register auto-suggestions combining snippets, keywords, and document words
    const registerAutocompletes = (lang: string, snippets: any[]) => {
      const disp = monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          // 1. Snippets
          const snippetItems = snippets.map((item) => ({
            ...item,
            range,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          }));

          // 2. Keywords
          const langKeywords = KEYWORDS[lang] || [];
          const keywordItems = langKeywords.map((kw) => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            detail: `${lang.toUpperCase()} Keyword`,
            range,
          }));

          // 3. Document-based words (what has been written above)
          const text = model.getValue();
          const wordRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
          const words = new Set<string>();
          let match;
          while ((match = wordRegex.exec(text)) !== null) {
            const w = match[0];
            if (w.length >= 3) {
              words.add(w);
            }
          }
          // Remove the word currently being typed
          const currentWord = word.word;
          words.delete(currentWord);
          // Remove keywords and snippets to avoid duplication
          langKeywords.forEach((kw) => words.delete(kw));
          snippets.forEach((snip) => words.delete(snip.label));

          const docWordItems = Array.from(words).map((w) => ({
            label: w,
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: w,
            detail: "Text in document",
            range,
          }));

          return {
            suggestions: [...snippetItems, ...keywordItems, ...docWordItems],
          };
        },
      });
      disposablesRef.current.push(disp);
    };

    // 1. C & C++ Snippets
    const cppSnippets = [
      {
        label: "struct_node",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Linked List Node Structure",
        insertText: "struct Node {\n    int data;\n    struct Node* next;\n};",
      },
      {
        label: "struct_tree_node",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Binary Tree Node Structure",
        insertText: "struct TreeNode {\n    int val;\n    struct TreeNode* left;\n    struct TreeNode* right;\n};",
      },
      {
        label: "for_i",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "For loop over i",
        insertText: "for (int i = 0; i < ${1:n}; i++) {\n    $0\n}",
      },
      {
        label: "swap_func",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Swap function helper",
        insertText: "void swap(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}",
      }
    ];
    registerAutocompletes("c", cppSnippets);
    registerAutocompletes("cpp", cppSnippets);

    // 2. Python Snippets
    const pythonSnippets = [
      {
        label: "class_node",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Linked List Node Class",
        insertText: "class Node:\n    def __init__(self, val=0):\n        self.val = val\n        self.next = None",
      },
      {
        label: "class_tree_node",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Binary Tree Node Class",
        insertText: "class TreeNode:\n    def __init__(self, val=0):\n        self.val = val\n        self.left = None\n        self.right = None",
      },
      {
        label: "def_bubble_sort",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Bubble Sort Algorithm",
        insertText: "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]",
      }
    ];
    registerAutocompletes("python", pythonSnippets);

    // 3. Java Snippets
    const javaSnippets = [
      {
        label: "class_node",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Linked List Node Class",
        insertText: "class Node {\n    int val;\n    Node next;\n    Node(int val) {\n        this.val = val;\n        this.next = null;\n    }\n}",
      },
      {
        label: "class_tree_node",
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: "Binary Tree Node Class",
        insertText: "class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode(int val) {\n        this.val = val;\n        this.left = null;\n        this.right = null;\n    }\n}",
      }
    ];
    registerAutocompletes("java", javaSnippets);

    // 4. SQL & HTML (register autocomplete for keywords and document-based words even without custom snippets)
    registerAutocompletes("sql", []);
    registerAutocompletes("html", []);

    // Define Canvas dark theme
    monaco.editor.defineTheme("canvas-dark", {
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

    // Define Canvas light theme
    monaco.editor.defineTheme("canvas-light", {
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
    
    monaco.editor.setTheme(theme === "light" ? "canvas-light" : "canvas-dark");
  };

  // Update theme dynamically
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === "light" ? "canvas-light" : "canvas-dark");
    }
  }, [theme]);


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
            quickSuggestions: { other: true, comments: true, strings: true },
            wordBasedSuggestions: "currentDocument",
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            suggestOnTriggerCharacters: true,
            snippetSuggestions: "inline",
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
          onClick={() => onVisualize()}
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
            <>Visualize</>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>


    </div>
  );
}

