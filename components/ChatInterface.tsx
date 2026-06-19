"use client";
import AuthModal from "./AuthModal";
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Sun, Moon, ChevronDown, X, Plus } from "lucide-react";
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

const FILE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pdf: { label: "PDF", color: "#f87171", bg: "rgba(248,113,113,0.2)" },
  txt: { label: "TXT", color: "#60a5fa", bg: "rgba(96,165,250,0.2)" },
  csv: { label: "CSV", color: "#34d399", bg: "rgba(52,211,153,0.2)" },
  docx: { label: "DOCX", color: "#818cf8", bg: "rgba(129,140,248,0.2)" },
  xlsx: { label: "XLSX", color: "#6ee7b7", bg: "rgba(110,231,183,0.2)" },
  xls: { label: "XLS", color: "#6ee7b7", bg: "rgba(110,231,183,0.2)" },
};

function getCurrentTime() {
  return new Date().toLocaleTimeString("es-MX", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });
}

function createNewChat(): ChatData {
  const now = new Date();
  const currentTime = getCurrentTime();
  
  return {
    id: now.getTime().toString(),
    title: "Nuevo chat",
    createdAt: currentTime,
    messages: [{
      role: "model",
      content: `👋 ¡Hola! Soy PersonaCore Assistant.

Puedo ayudarte con:
• 📄 Subir documentos (PDF, TXT, DOCX, XLSX, CSV)
• ❓ Responder preguntas sobre su contenido
• 💡 Resumir información y extraer datos clave

Para empezar: Sube un archivo o escríbeme directamente.`,
      timestamp: currentTime,
    }],
    pdfText: null,
    pdfName: null,
  };
}

const getInitialChats = (): ChatData[] => {
  return [createNewChat()];
};

const getInitialActiveChatId = (): string => {
  return "";
};

// ============================================================
// ESTILOS INLINE
// ============================================================
const styles = {
  container: (dark: boolean) => ({
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: dark ? "#18181b" : "#fafafa",
    color: dark ? "#ffffff" : "#18181b",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  }),
  mainContent: {
    display: "flex",
    flex: 1,
    flexDirection: "column" as const,
    overflow: "hidden",
    position: "relative" as const,
  },
  header: (dark: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: `1px solid ${dark ? "#27272a" : "#e4e4e7"}`,
    backgroundColor: dark ? "rgba(24,24,27,0.8)" : "rgba(255,255,255,0.8)",
    backdropFilter: "blur(8px)",
  }),
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },
  newChatBtn: (dark: boolean) => ({
    padding: "6px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: dark ? "#a1a1aa" : "#52525b",
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  chatTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0,
  },
  chatTitleH1: (dark: boolean) => ({
    fontWeight: 600,
    fontSize: "1rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    margin: 0,
    color: dark ? "#ffffff" : "#18181b",
  }),
  fileBadge: (color: string, bg: string) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 500,
    border: `1px solid ${color}`,
    flexShrink: 0,
    color: color,
    background: bg,
  }),
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  themeToggle: (dark: boolean) => ({
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: dark ? "#a1a1aa" : "#52525b",
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  userInfoSpan: (dark: boolean) => ({
    fontSize: "0.875rem",
    color: dark ? "#a1a1aa" : "#52525b",
  }),
  logoutBtn: (dark: boolean) => ({
    padding: "4px 8px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    fontSize: "0.75rem",
    cursor: "pointer",
    color: dark ? "#a1a1aa" : "#52525b",
    transition: "color 0.2s",
  }),
  loginBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  messagesArea: (dark: boolean, dragging: boolean) => ({
    flex: 1,
    overflowY: "auto" as const,
    padding: "24px 20px",
    transition: "all 0.2s",
    background: dragging 
      ? "rgba(99,102,241,0.05)" 
      : dark 
        ? "radial-gradient(ellipse at top, rgba(99,102,241,0.05) 0%, transparent 60%)"
        : "radial-gradient(ellipse at top, rgba(99,102,241,0.03) 0%, transparent 60%)",
    border: dragging ? "2px dashed #6366f1" : "none",
    position: "relative" as const,
  }),
  suggestions: {
    marginLeft: "48px",
    marginTop: "8px",
  },
  suggestionsLabel: (dark: boolean) => ({
    fontSize: "0.75rem",
    marginBottom: "8px",
    color: dark ? "#71717a" : "#a1a1aa",
  }),
  suggestionsButtons: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
  },
  suggestionBtn: (dark: boolean) => ({
    padding: "6px 16px",
    borderRadius: "9999px",
    border: `1px solid ${dark ? "#3f3f46" : "#e4e4e7"}`,
    fontSize: "0.875rem",
    background: dark ? "rgba(63,63,70,0.5)" : "#fafafa",
    color: dark ? "#d4d4d8" : "#3f3f46",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  loadingMessage: {
    display: "flex",
    gap: "12px",
    animation: "fadeIn 0.3s ease-in-out",
  },
  avatarAI: {
    display: "flex",
    height: "32px",
    width: "32px",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "white",
    background: "linear-gradient(to bottom right, #7c3aed, #4f46e5)",
  },
  loadingDots: (dark: boolean) => ({
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "16px 16px 4px 16px",
    height: "48px",
    background: dark ? "rgba(39,39,42,0.8)" : "rgba(255,255,255,0.8)",
    border: `1px solid ${dark ? "rgba(63,63,70,0.5)" : "#e4e4e7"}`,
  }),
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "9999px",
    background: "#818cf8",
    animation: "bounce 1.4s infinite both",
  },
  scrollBtn: {
    position: "absolute" as const,
    bottom: "100px",
    right: "32px",
    borderRadius: "9999px",
    background: "#6366f1",
    padding: "8px",
    color: "white",
    border: "none",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputArea: (dark: boolean) => ({
    borderTop: `1px solid ${dark ? "#27272a" : "#e4e4e7"}`,
    padding: "12px 20px",
    background: dark ? "rgba(24,24,27,0.8)" : "rgba(255,255,255,0.8)",
    backdropFilter: "blur(8px)",
  }),
  fileBadgeContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    marginBottom: "8px",
    borderRadius: "8px",
    background: "rgba(99,102,241,0.05)",
    border: "1px solid rgba(99,102,241,0.2)",
  },
  fileName: (dark: boolean) => ({
    fontSize: "0.875rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    flex: 1,
    color: dark ? "#d4d4d8" : "#3f3f46",
  }),
  removeFile: {
    background: "transparent",
    border: "none",
    color: "#71717a",
    cursor: "pointer",
    padding: "4px",
    transition: "color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: (dark: boolean) => ({
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    borderRadius: "16px",
    border: `1px solid ${dark ? "#3f3f46" : "#e4e4e7"}`,
    padding: "8px 12px",
    background: dark ? "rgba(39,39,42,0.5)" : "#ffffff",
  }),
  attachBtn: (dark: boolean) => ({
    padding: "6px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: dark ? "#a1a1aa" : "#a1a1aa",
    transition: "all 0.2s",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  textarea: (dark: boolean) => ({
    flex: 1,
    resize: "none" as const,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "0.875rem",
    color: dark ? "#ffffff" : "#18181b",
    padding: 0,
    minHeight: "24px",
    maxHeight: "120px",
    fontFamily: "inherit",
  }),
  inputActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  charCounter: (dark: boolean) => ({
    fontSize: "0.75rem",
    color: dark ? "#71717a" : "#a1a1aa",
  }),
  sendBtn: (active: boolean) => ({
    padding: "8px",
    borderRadius: "12px",
    border: "none",
    background: active ? "#6366f1" : "#52525b",
    color: "white",
    cursor: active ? "pointer" : "not-allowed",
    opacity: active ? 1 : 0.4,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  footerNote: (dark: boolean) => ({
    marginTop: "6px",
    textAlign: "center" as const,
    fontSize: "0.75rem",
    color: dark ? "#52525b" : "#a1a1aa",
  }),
  loading: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    color: "#a1a1aa",
  },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ChatInterface() {
  const [darkMode, setDarkMode] = useState(true);
  const [chats, setChats] = useState<ChatData[]>(getInitialChats);
  const [activeChatId, setActiveChatId] = useState<string>(getInitialActiveChatId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [auth, setAuth] = useState<{ token: string | null; username: string | null }>({
    token: null,
    username: null
  });
  
  const API_BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  useEffect(() => {
    setIsMounted(true);
    
    const savedChats = localStorage.getItem("personacore-chats");
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        if (parsed.length > 0 && parsed[0]?.id) {
          setActiveChatId(parsed[0].id);
        }
      } catch (e) {
        console.error("Error parsing saved chats:", e);
      }
    }

    const token = localStorage.getItem("dancore-token");
    const username = localStorage.getItem("dancore-username");
    if (token && username) {
      setAuth({ token, username });
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("personacore-chats", JSON.stringify(chats));
    }
  }, [chats, isMounted]);

  useEffect(() => {
    if (auth.token) {
      loadChatsFromBackend(auth.token);
    }
  }, [auth.token]);

  useEffect(() => {
    if (isMounted) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages, loading, isMounted]);

  function handleScroll() {
    const el = chatBoxRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }

  function updateActiveChat(updates: Partial<ChatData>) {
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, ...updates } : c))
    );

    if (auth.token && updates.title && /^\d+$/.test(activeChatId)) {
      fetch(`${API_BACKEND}/api/chats/${activeChatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ title: updates.title }),
      }).catch((err) => console.error("Error actualizando titulo:", err));
    }
  }

  async function newChat() {
    if (auth.token) {
      try {
        const res = await fetch(`${API_BACKEND}/api/chats/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify({ title: "Nuevo chat" }),
        });
        const data = await res.json();
        const chat: ChatData = {
          id: data.id.toString(),
          title: data.title,
          createdAt: getCurrentTime(),
          messages: [createNewChat().messages[0]],
          pdfText: null,
          pdfName: null,
        };
        setChats((prev) => [chat, ...prev]);
        setActiveChatId(chat.id);
        setFileType(null);
        return;
      } catch (err) {
        console.error("Error creando chat:", err);
      }
    }
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

  async function loadChatsFromBackend(authToken: string) {
    try {
      const res = await fetch(`${API_BACKEND}/api/chats/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const loadedChats: ChatData[] = await Promise.all(
          data.map(async (c: { id: number; title: string; created_at: string }) => {
            const msgRes = await fetch(`${API_BACKEND}/api/chats/${c.id}/messages`, {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            const msgData = await msgRes.json();
            const messages: Message[] = msgData.map((m: { role: string; content: string; created_at: string }) => ({
              role: m.role === "assistant" ? "model" : "user",
              content: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
            }));
            return {
              id: c.id.toString(),
              title: c.title,
              createdAt: new Date(c.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
              messages: messages.length > 0 ? messages : [createNewChat().messages[0]],
              pdfText: null,
              pdfName: null,
            };
          })
        );
        setChats(loadedChats);
        setActiveChatId(loadedChats[0].id);
      } else {
        const fresh = createNewChat();
        setChats([fresh]);
        setActiveChatId(fresh.id);
      }
    } catch (err) {
      console.error("Error cargando chats:", err);
    }
  }

  async function handleAuthSuccess(token: string, username: string) {
    setAuth({ token, username });
    localStorage.setItem("dancore-token", token);
    localStorage.setItem("dancore-username", username);
    setShowAuth(false);

    const currentChat = chats.find((c) => c.id === activeChatId);
    const hasRealContent = currentChat && currentChat.messages.length > 1;

    if (hasRealContent) {
      try {
        const res = await fetch(`${API_BACKEND}/api/chats/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: currentChat.title }),
        });
        const data = await res.json();
        const newChatId = data.id.toString();

        for (const msg of currentChat.messages) {
          await fetch(`${API_BACKEND}/api/chats/${newChatId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ role: msg.role === "model" ? "assistant" : "user", content: msg.content }),
          });
        }
      } catch (err) {
        console.error("Error migrando chat:", err);
      }
    }

    loadChatsFromBackend(token);
  }

  function logout() {
    setAuth({ token: null, username: null });
    localStorage.removeItem("dancore-token");
    localStorage.removeItem("dancore-username");
    const fresh = createNewChat();
    setChats([fresh]);
    setActiveChatId(fresh.id);
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileRef.current) {
        fileRef.current.files = dataTransfer.files;
        fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      if (data.text) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "file";
        setFileType(ext);
        const now = new Date();
        const welcomeMsg: Message = {
          role: "model",
          content: `✅ Archivo cargado: **${data.filename}**. Ahora puedes hacerme preguntas sobre su contenido.`,
          timestamp: getCurrentTime(),
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
    } catch (error) {
      console.error("Error uploading file:", error);
      addMessage("model", `❌ Error al subir el archivo: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addMessage(role: "user" | "model", content: string) {
    const msg: Message = {
      role,
      content,
      timestamp: getCurrentTime(),
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, msg] } : c
      )
    );

    if (auth.token && /^\d+$/.test(activeChatId)) {
      fetch(`${API_BACKEND}/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ role: role === "model" ? "assistant" : "user", content }),
      }).catch((err) => console.error("Error guardando mensaje:", err));
    }

    return msg;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    addMessage("user", text);
    setInput("");
    setLoading(true);

    if (activeChat.messages.length <= 1) {
      updateActiveChat({ title: text.slice(0, 30) });
    }

    try {
      const history = activeChat.messages.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.content,
      }));

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          history,
          pdfText: activeChat.pdfText,
          username: auth.username,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data.reply) {
        throw new Error("Respuesta inválida del servidor");
      }
      
      addMessage("model", data.reply);
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage("model", `❌ Error al enviar mensaje: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  }

  const badge = fileType ? FILE_BADGES[fileType] : null;

  const handleQuickSuggestion = (text: string) => {
    setInput(text);
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  };

  if (!isMounted) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  return (
    <div style={styles.container(darkMode)}>
      <Sidebar
        chats={chats.map((c): Chat => ({ id: c.id, title: c.title, createdAt: c.createdAt }))}
        activeChatId={activeChatId}
        onNewChat={newChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        darkMode={darkMode}
      />

      <div style={styles.mainContent}>
        {/* HEADER */}
        <header style={styles.header(darkMode)}>
          <div style={styles.headerLeft}>
            <button 
              style={styles.newChatBtn(darkMode)}
              onClick={newChat}
              title="Nuevo chat"
              onMouseEnter={(e) => {
                if (darkMode) e.currentTarget.style.background = "#27272a";
                else e.currentTarget.style.background = "#f4f4f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Plus size={18} />
            </button>
            <div style={styles.chatTitle}>
              <h1 style={styles.chatTitleH1(darkMode)}>
                {activeChat?.title || "Nuevo chat"}
              </h1>
              {badge && activeChat?.pdfName && (
                <span style={styles.fileBadge(badge.color, badge.bg)}>
                  {badge.label}
                </span>
              )}
            </div>
          </div>
          <div style={styles.headerRight}>
            <button 
              style={styles.themeToggle(darkMode)}
              onClick={() => setDarkMode(!darkMode)}
              onMouseEnter={(e) => {
                if (darkMode) e.currentTarget.style.background = "#27272a";
                else e.currentTarget.style.background = "#f4f4f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {auth.token ? (
              <div style={styles.userInfo}>
                <span style={styles.userInfoSpan(darkMode)}>{auth.username}</span>
                <button 
                  style={styles.logoutBtn(darkMode)}
                  onClick={logout}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = darkMode ? "#a1a1aa" : "#52525b";
                  }}
                >
                  Salir
                </button>
              </div>
            ) : (
              <button 
                style={styles.loginBtn}
                onClick={() => setShowAuth(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#6366f1";
                }}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        {/* MESSAGES AREA */}
        <div
          ref={chatBoxRef}
          onScroll={handleScroll}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={styles.messagesArea(darkMode, isDragging)}
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
          
          {/* SUGGESTIONS */}
          {activeChat?.messages.length === 1 && 
           activeChat.messages[0].role === "model" && 
           !activeChat.pdfName && (
            <div style={styles.suggestions}>
              <p style={styles.suggestionsLabel(darkMode)}>💡 Prueba preguntando:</p>
              <div style={styles.suggestionsButtons}>
                <button 
                  style={styles.suggestionBtn(darkMode)}
                  onClick={() => handleQuickSuggestion("¿Qué puedes hacer?")}
                  onMouseEnter={(e) => {
                    if (darkMode) e.currentTarget.style.background = "#3f3f46";
                    else e.currentTarget.style.background = "#f4f4f5";
                  }}
                  onMouseLeave={(e) => {
                    if (darkMode) e.currentTarget.style.background = "rgba(63,63,70,0.5)";
                    else e.currentTarget.style.background = "#fafafa";
                  }}
                >
                  🚀 ¿Qué puedes hacer?
                </button>
                <button 
                  style={styles.suggestionBtn(darkMode)}
                  onClick={() => handleQuickSuggestion("¿Cómo subo un documento?")}
                  onMouseEnter={(e) => {
                    if (darkMode) e.currentTarget.style.background = "#3f3f46";
                    else e.currentTarget.style.background = "#f4f4f5";
                  }}
                  onMouseLeave={(e) => {
                    if (darkMode) e.currentTarget.style.background = "rgba(63,63,70,0.5)";
                    else e.currentTarget.style.background = "#fafafa";
                  }}
                >
                  📄 ¿Cómo subo un documento?
                </button>
                <button 
                  style={styles.suggestionBtn(darkMode)}
                  onClick={() => handleQuickSuggestion("Cuéntame sobre ti")}
                  onMouseEnter={(e) => {
                    if (darkMode) e.currentTarget.style.background = "#3f3f46";
                    else e.currentTarget.style.background = "#f4f4f5";
                  }}
                  onMouseLeave={(e) => {
                    if (darkMode) e.currentTarget.style.background = "rgba(63,63,70,0.5)";
                    else e.currentTarget.style.background = "#fafafa";
                  }}
                >
                  💡 Cuéntame sobre ti
                </button>
              </div>
            </div>
          )}
          
          {/* LOADING INDICATOR */}
          {loading && (
            <div style={styles.loadingMessage}>
              <div style={styles.avatarAI}>AI</div>
              <div style={styles.loadingDots(darkMode)}>
                <span style={{...styles.loadingDot, animationDelay: "0s"}}></span>
                <span style={{...styles.loadingDot, animationDelay: "0.15s"}}></span>
                <span style={{...styles.loadingDot, animationDelay: "0.3s"}}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* SCROLL BUTTON */}
        {showScrollBtn && (
          <button
            style={styles.scrollBtn}
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#6366f1";
            }}
          >
            <ChevronDown size={18} />
          </button>
        )}

        {/* INPUT AREA */}
        <div style={styles.inputArea(darkMode)}>
          {/* FILE BADGE */}
          {activeChat?.pdfName && (
            <div style={styles.fileBadgeContainer}>
              <span style={styles.fileBadge(badge!.color, badge!.bg)}>
                {badge!.label}
              </span>
              <span style={styles.fileName(darkMode)}>
                📄 {activeChat.pdfName}
              </span>
              <button
                style={styles.removeFile}
                onClick={() => { updateActiveChat({ pdfText: null, pdfName: null }); setFileType(null); }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#71717a";
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div style={styles.inputWrapper(darkMode)}>
            <button
              style={styles.attachBtn(darkMode)}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              onMouseEnter={(e) => {
                if (darkMode) e.currentTarget.style.background = "#3f3f46";
                else e.currentTarget.style.background = "#f4f4f5";
                e.currentTarget.style.color = darkMode ? "#ffffff" : "#3f3f46";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = darkMode ? "#a1a1aa" : "#a1a1aa";
              }}
            >
              {uploading ? (
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #818cf8",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
              ) : (
                <Paperclip size={20} />
              )}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.docx,.xlsx,.xls,.csv" onChange={handleFile} style={{ display: "none" }} />
            <textarea
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 2000) setInput(val);
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={activeChat?.pdfName ? "Pregunta sobre el documento..." : "Escribe tu mensaje..."}
              rows={1}
              style={styles.textarea(darkMode)}
              disabled={loading}
            />
            <div style={styles.inputActions}>
              <span style={styles.charCounter(darkMode)}>{input.length}/2000</span>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={styles.sendBtn(!loading && !!input.trim())}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.background = "#4f46e5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.background = "#6366f1";
                  }
                }}
              >
                {loading ? (
                  <div style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
          <p style={styles.footerNote(darkMode)}>
            PersonaCore AI puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>

      {showAuth && (
        <AuthModal
          darkMode={darkMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* ANIMACIONES GLOBALES (inline) */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-bubble {
          animation: fadeIn 0.3s ease-in-out;
        }
        textarea::-webkit-scrollbar {
          width: 4px;
        }
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        textarea::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
        }
      `}</style>
    </div>
  );
}