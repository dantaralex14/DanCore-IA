import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/csv": "csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "El archivo supera el límite de 10MB" }, { status: 400 });
    }

    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json({ error: "Formato no soportado. Usa PDF, TXT, DOCX o XLSX" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";
    let pages = 1;

    if (fileType === "pdf") {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
      pages = parsed.numpages;

    } else if (fileType === "txt" || fileType === "csv") {
  text = buffer.toString("utf-8");

    } else if (fileType === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;

    } else if (fileType === "xlsx" || fileType === "xls") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const allSheets: string[] = [];
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        allSheets.push(`=== Hoja: ${sheetName} ===\n${csv}`);
      });
      text = allSheets.join("\n\n");
    }

    const finalText = text.replace(/\s+/g, " ").trim().slice(0, 15000);

    if (!finalText) {
      return NextResponse.json({ error: "No se pudo extraer texto del archivo" }, { status: 400 });
    }

    return NextResponse.json({
      text: finalText,
      filename: file.name,
      pages,
      type: fileType,
    });

  } catch (error) {
    console.error("Error procesando archivo:", error);
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
  }
}