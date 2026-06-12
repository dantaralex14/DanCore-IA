"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hola, soy DanCore Assistant. ¿En qué puedo ayudarte hoy? Puedes subir un archivo y hacerme preguntas sobre él.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handlePDF(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.text) {
  setPdfText(data.text);
  setPdfName(data.filename);
  setMessages([
    {
      role: "model",
      content: `✅ Archivo cargado: **${data.filename}**. Ahora puedes hacerme preguntas sobre su contenido.`,
    },
  ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "❌ Error al procesar el archivo." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "❌ Error de conexión al subir el archivo." },
      ]);
    } finally {
      setUploading(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, pdfText }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: "Error al obtener respuesta." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Error de conexión." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            DanCore Assistant
          </h2>
          <p className="text-sm text-zinc-400">
            {pdfName ? `📄 ${pdfName}` : "Asistente IA con contexto personalizado."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pdfName && (
            <button
              onClick={() => { setPdfText(null); setPdfName(null); }}
              className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:text-red-400"
            >
              Quitar Archivo
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : "📎 Archivo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.docx,.xlsx,.xls,.csv"
            onChange={handlePDF}
            className="hidden"
          />
        </div>
      </div>

      {/* MENSAJES */}
      <div className="mb-4 h-96 overflow-y-auto rounded-xl border border-zinc-800 bg-black p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl p-3 text-sm max-w-[85%] whitespace-pre-wrap ${
              msg.role === "user"
                ? "ml-auto bg-white text-black"
                : "bg-zinc-900 text-zinc-200"
            }`}
          >
            {msg.role === "model" ? (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
      strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
      ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
      li: ({ children }) => <li className="mb-1">{children}</li>,
      code: ({ children }) => <code className="bg-zinc-800 px-1 rounded text-sm font-mono">{children}</code>,
      h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
      h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>,
    }}
  >
    {msg.content}
  </ReactMarkdown>
) : (
  msg.content
)}
          </div>
        ))}
        {loading && (
          <div className="rounded-xl bg-zinc-900 p-3 text-sm text-zinc-400 animate-pulse">
            Pensando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={pdfText ? "Pregunta sobre el archivo..." : "Escribe una pregunta..."}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </section>
  );
}