"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  darkMode: boolean;
  onClose: () => void;
  onSuccess: (token: string, username: string) => void;
}

export default function AuthModal({ darkMode, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al procesar la solicitud");
        return;
      }

      if (mode === "register") {
        setMode("login");
        setError("");
        setPassword("");
        setPassword2("");
        return;
      }

      onSuccess(data.token, data.username);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full max-w-sm rounded-2xl border p-8 shadow-2xl ${
        darkMode ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"
      }`}>
        <button onClick={onClose} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300">
          <X size={18} />
        </button>

        {/* LOGO */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl">
            D
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-zinc-900"}`}>
            DanCore AI
          </h2>
          <p className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}>
            {mode === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta"}
          </p>
        </div>

        {/* TABS */}
        <div className={`mb-6 flex rounded-xl p-1 ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : darkMode ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={`rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-500 ${
              darkMode ? "border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500" : "border-zinc-200 bg-zinc-50 text-zinc-900"
            }`}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-500 ${
              darkMode ? "border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500" : "border-zinc-200 bg-zinc-50 text-zinc-900"
            }`}
          />
          {mode === "register" && (
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className={`rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-500 ${
                darkMode ? "border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500" : "border-zinc-200 bg-zinc-50 text-zinc-900"
              }`}
            />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          {mode === "register" && !error && (
            <p className="text-xs text-zinc-500">Al registrarte, tus chats se guardarán en la nube.</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}