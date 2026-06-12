import ChatInterface from "@/components/ChatInterface"; 

export default function Home() {
  return (
    <main className="min-h-screen bg-black px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            DanCore AI
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Plataforma web para crear asistentes IA configurables con conocimiento general y contexto personalizado.
          </p>
        </div>

        <ChatInterface /> {/* ✅ Usas ChatInterface, no ChatBox */}
      </div>
    </main>
  );
}