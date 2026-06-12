"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  role: "user" | "model";
  content: string;
  timestamp: string;
  darkMode: boolean;
}

export default function MessageBubble({ role, content, timestamp, darkMode }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* AVATAR */}
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        isUser
          ? "bg-indigo-600 text-white"
          : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
      }`}>
        {isUser ? "TÚ" : "AI"}
      </div>

      {/* BURBUJA */}
      <div className={`group relative max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-sm ${
          isUser
            ? "rounded-tr-sm bg-indigo-600 text-white"
            : darkMode
            ? "rounded-tl-sm border border-zinc-700/50 bg-zinc-800/80 text-zinc-100"
            : "rounded-tl-sm border border-zinc-200 bg-white/80 text-zinc-800"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ children }) => (
                  <code className={`rounded px-1 py-0.5 text-xs font-mono ${
                    darkMode ? "bg-zinc-700 text-indigo-300" : "bg-zinc-100 text-indigo-600"
                  }`}>{children}</code>
                ),
                h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {/* TIMESTAMP + COPIAR */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className={`text-xs ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
            {timestamp}
          </span>
          {!isUser && (
            <button
              onClick={copyText}
              className={`hidden group-hover:flex items-center gap-1 text-xs transition-colors ${
                darkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}