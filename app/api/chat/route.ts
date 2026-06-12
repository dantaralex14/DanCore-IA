import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message, history, pdfText } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const systemPrompt = pdfText
      ? `Eres DanCore Assistant. El usuario ha subido un documento PDF con el siguiente contenido:\n\n${pdfText}\n\nResponde las preguntas del usuario basándote en este documento. Si la respuesta no está en el documento, indícalo claramente.`
      : "Eres DanCore Assistant, un asistente de IA útil y amigable. Responde siempre en el idioma que use el usuario.";

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sin respuesta";
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Error Groq:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}