"use client";
import { useState, useRef, useEffect } from "react";
import type { ChatMessage, Language, TraceStep } from "@/lib/types";
import { askTutor } from "@/lib/api";

interface Props {
  code: string;
  lang: Language;
  currentStep: TraceStep | null;
  onClose?: () => void;
}

export default function TutorChat({ code, lang, currentStep, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "tutor",
      content: "Hi! I'm your CodeCanvas tutor. Ask me anything about the code — like 'why does the loop stop at n-1?' or 'what is a stack?'",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "student",
      content: q,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await askTutor({
        code,
        lang,
        stepNum: currentStep?.stepNum ?? 0,
        stepDescription: currentStep?.description ?? "not started",
        question: q,
      });

      const tutorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: res.answer,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, tutorMsg]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: "Sorry, I couldn't connect to the AI backend. Make sure the FastAPI server is running at localhost:8000.",
        timestamp: new Date(),
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const QUICK_QUESTIONS = [
    "What does this code do?",
    "Why use n-1 in the loop?",
    "What is the time complexity?",
    "Explain this step to me",
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--bg-secondary)",
      borderTop: "1px solid var(--border)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        flexShrink: 0,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--primary-glow)",
          border: "1px solid var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: "bold",
          color: "var(--primary-light)",
        }}>
          AI
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>AI Tutor</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Live</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 16,
                cursor: "pointer",
                padding: "2px 4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              title="Close chat"
              aria-label="Close chat"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Message area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "student" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: msg.role === "student" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "student"
                ? "linear-gradient(135deg, var(--primary-dark), var(--primary))"
                : "var(--card)",
              border: msg.role === "student"
                ? "none"
                : "1px solid var(--border)",
              color: msg.role === "student" ? "white" : "var(--text-secondary)",
              fontSize: 13,
              lineHeight: 1.6,
              boxShadow: msg.role === "student" ? "0 2px 10px var(--primary-glow)" : "none",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "10px 14px",
              borderRadius: "14px 14px 14px 4px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              display: "flex",
              gap: 4,
              alignItems: "center",
            }}>
              {[0, 0.15, 0.3].map((delay, i) => (
                <div key={i} style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  animation: `bounce 0.8s ${delay}s ease-in-out infinite alternate`,
                }} />
              ))}
              <style>{`
                @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
              `}</style>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length === 1 && (
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--text-muted)",
                fontSize: 11,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{
        display: "flex",
        gap: 8,
        padding: "10px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--card)",
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          id="tutor-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything about this code..."
          className="input"
          style={{ flex: 1, fontSize: 13, padding: "8px 12px" }}
          disabled={isLoading}
        />
        <button
          id="tutor-chat-send"
          onClick={send}
          disabled={isLoading || !input.trim()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: input.trim() && !isLoading ? "var(--primary)" : "var(--border)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

