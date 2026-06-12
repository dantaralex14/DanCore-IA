"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Sun, Moon, ChevronDown, X } from "lucide-react";
import Sidebar, { Chat } from "./Sidebar";
import MessageBubble from "./MessageBubble";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface ChatData {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  pdfText: string | null;
  pdfName: string | null;
}

const FILE_BADGES: Record<string, { label: string; color: string }> = {
  pdf: { label: "PDF", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  txt: { label: "TXT", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  csv: { label: "CSV", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  docx: { label: "DOCX", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  xlsx: { label: "XLSX", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  xls: { label: "XLS", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

function createNewChat(): ChatData {
  return {
    id: Date.now().toString(),
    title: "Nuevo chat",
    createdAt: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    messages: [{
      role: "model",
      content: "Hola, soy PersonaCore Assistant. ¿En qué puedo ayudarte hoy? Puedes subir un documento y hacerme preguntas sobre él.",
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }],
    pdfText: null,
    pdfName: null,
  };
}

export default function ChatInterface() {
  const [darkMode, setDarkMode] = useState(true);
  const [chats, setChats] = useState<ChatData[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("personacore-chats");
      return saved ? JSON.parse(saved) : [createNewChat()];
    }
    return [createNewChat()];
  });
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("personacore-chats");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[0]?.id || "";
      }
    }
    return chats[0]?.id || "";
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("personacore-chats", JSON.stringify(chats));
  }, [chats]);

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  // Detectar scroll para mostrar botón
  function handleScroll() {
    const el = chatBoxRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }

  function updateActiveChat(updates: Partial<ChatData>) {
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, ...updates } : c))
    );
  }

  function newChat() {
    const chat = createNewChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
    setFileType(null);
  }

  function selectChat(id: string) {
    setActiveChatId(id);
    const chat = chats.find((c) => c.id === id);
    setFileType(chat?.pdfName ? "pdf" : null);
  }

  function deleteChat(id: string) {
    const remaining = chats.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewChat();
      setChats([fresh]);
      setActiveChatId(fresh.id);
    } else {
      setChats(remaining);
      if (activeChatId === id) setActiveChatId(remaining[0].id);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "file";
        setFileType(ext);
        const welcomeMsg: Message = {
          role: "model",
          content: `✅ Archivo cargado: **${data.filename}**. Ahora puedes hacerme preguntas sobre su contenido.`,
          timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        };
        updateActiveChat({
          pdfText: data.text,
          pdfName: data.filename,
          messages: [welcomeMsg],
          title: data.filename.split(".")[0].slice(0, 25),
        });
      } else {
        addMessage("model", `❌ Error: ${data.error || "No se pudo procesar el archivo"}`);
      }
    } catch {
      addMessage("model", "❌ Error de conexión al subir el archivo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addMessage(role: "user" | "model", content: string) {
    const msg: Message = {
      role,
      content,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, msg] } : c
      )
    );
    return msg;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    addMessage("user", text);
    setInput("");
    setLoading(true);

    // Actualizar título del chat con el primer mensaje
    if (activeChat.messages.length <= 1) {
      updateActiveChat({ title: text.slice(0, 30) });
    }

    try {
      const history = activeChat.messages.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          pdfText: activeChat.pdfText,
        }),
      });

      const data = await res.json();
      addMessage("model", data.reply || "Error al obtener respuesta.");
    } catch {
      addMessage("model", "Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  const badge = fileType ? FILE_BADGES[fileType] : null;

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "bg-zinc-900" : "bg-zinc-50"}`}>
      {/* SIDEBAR */}
      <Sidebar
        chats={chats.map((c): Chat => ({ id: c.id, title: c.title, createdAt: c.createdAt }))}
        activeChatId={activeChatId}
        onNewChat={newChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        darkMode={darkMode}
      />

      {/* MAIN */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className={`flex items-center justify-between border-b px-6 py-4 ${
          darkMode ? "border-zinc-800 bg-zinc-950/80 backdrop-blur-sm" : "border-zinc-200 bg-white/80 backdrop-blur-sm"
        }`}>
          <div className="flex items-center gap-3">
            <h1 className={`font-semibold ${darkMode ? "text-white" : "text-zinc-900"}`}>
              {activeChat?.title || "Nuevo chat"}
            </h1>
            {badge && activeChat?.pdfName && (
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.color}`}>
                  {badge.label}
                </span>
                <span className={`text-xs truncate max-w-[200px] ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
                  {activeChat.pdfName}
                </span>
                <button
                  onClick={() => { updateActiveChat({ pdfText: null, pdfName: null }); setFileType(null); }}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-lg p-2 transition-colors ${
              darkMode ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* MENSAJES */}
        <div
          ref={chatBoxRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          style={{
            background: darkMode
              ? "radial-gradient(ellipse at top, rgba(99,102,241,0.05) 0%, transparent 60%)"
              : "radial-gradient(ellipse at top, rgba(99,102,241,0.03) 0%, transparent 60%)",
          }}
        >
          {activeChat?.messages.map((msg, i) => (
            <MessageBubble
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              darkMode={darkMode}
            />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
                AI
              </div>
              <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${darkMode ? "bg-zinc-800/80 border border-zinc-700/50" : "bg-white/80 border border-zinc-200"}`}>
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* SCROLL TO BOTTOM */}
        {showScrollBtn && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-24 right-8 rounded-full bg-indigo-600 p-2 text-white shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <ChevronDown size={18} />
          </button>
        )}

        {/* INPUT */}
        <div className={`border-t px-6 py-4 ${darkMode ? "border-zinc-800 bg-zinc-950/80 backdrop-blur-sm" : "border-zinc-200 bg-white/80 backdrop-blur-sm"}`}>
          <div className={`flex items-end gap-3 rounded-2xl border px-4 py-3 ${
            darkMode ? "border-zinc-700 bg-zinc-800/50" : "border-zinc-200 bg-white"
          }`}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`flex-shrink-0 rounded-lg p-1.5 transition-colors ${
                darkMode ? "text-zinc-400 hover:bg-zinc-700 hover:text-white" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              } disabled:opacity-50`}
              title="Adjuntar archivo"
            >
              {uploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              ) : (
                <Paperclip size={20} />
              )}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.docx,.xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={activeChat?.pdfName ? "Pregunta sobre el documento..." : "Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"}
              rows={1}
              className={`flex-1 resize-none bg-transparent text-sm outline-none ${
                darkMode ? "text-white placeholder:text-zinc-500" : "text-zinc-900 placeholder:text-zinc-400"
              }`}
              style={{ maxHeight: "120px" }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 rounded-xl bg-indigo-600 p-2 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
          <p className={`mt-2 text-center text-xs ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
            PersonaCore AI puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>
    </div>
  );
}