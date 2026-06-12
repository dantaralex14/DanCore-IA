"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  darkMode: boolean;
}

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  darkMode,
}: SidebarProps) {
  return (
    <aside className={`flex h-screen w-64 flex-shrink-0 flex-col border-r ${
      darkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-zinc-100"
    }`}>
      {/* LOGO */}
      <div className={`flex items-center gap-2 px-4 py-5 border-b ${
        darkMode ? "border-zinc-800" : "border-zinc-200"
      }`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
          P
        </div>
        <span className={`font-bold text-lg ${darkMode ? "text-white" : "text-zinc-900"}`}>
          DanCore
        </span>
      </div>

      {/* NUEVO CHAT */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl border border-indigo-500 px-3 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        >
          <Plus size={16} />
          Nuevo chat
        </button>
      </div>

      {/* HISTORIAL */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className={`mb-2 px-2 text-xs font-semibold uppercase tracking-wider ${
          darkMode ? "text-zinc-500" : "text-zinc-400"
        }`}>
          Historial
        </p>
        {chats.length === 0 && (
          <p className={`px-2 text-sm ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
            No hay chats aún
          </p>
        )}
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group flex items-center justify-between rounded-lg px-3 py-2 mb-1 cursor-pointer transition-colors ${
              chat.id === activeChatId
                ? "bg-indigo-600/20 text-indigo-400"
                : darkMode
                ? "text-zinc-400 hover:bg-zinc-800"
                : "text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare size={14} className="flex-shrink-0" />
              <span className="truncate text-sm">{chat.title}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
              className="hidden group-hover:flex text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className={`border-t px-4 py-3 ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
        <p className={`text-xs ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>
          DanCore AI v1.0
        </p>
      </div>
    </aside>
  );
}