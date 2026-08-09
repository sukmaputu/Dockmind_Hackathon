import { createPartFromUri } from "@google/genai";
import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // ==========================================
    // 1. Get form data
    // ==========================================

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const question = formData.get("question") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "PDF file is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!question?.trim()) {
      return NextResponse.json(
        {
          error: "Question is required",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // 2. Validate PDF
    // ==========================================

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "Only PDF files are allowed",
        },
        {
          status: 400,
        },
      );
    }

    // 10 MB limit
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "PDF must be smaller than 10MB",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================
    // 3. Convert browser File → Blob
    // ==========================================

    const arrayBuffer = await file.arrayBuffer();

    const blob = new Blob([arrayBuffer], {
      type: "application/pdf",
    });

    // ==========================================
    // 4. Upload PDF to Gemini Files API
    // ==========================================

    console.log("Uploading PDF to Gemini...");

    const uploadedFile = await gemini.files.upload({
      file: blob,
      config: {
        displayName: file.name,
        mimeType: "application/pdf",
      },
    });

    console.log("Uploaded file:", uploadedFile.name);

    // ==========================================
    // 5. Wait until Gemini finishes processing
    // ==========================================

    let processedFile = await gemini.files.get({
      name: uploadedFile.name!,
    });

    while (processedFile.state === "PROCESSING") {
      console.log("PDF is still processing...");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      processedFile = await gemini.files.get({
        name: uploadedFile.name!,
      });
    }

    console.log("PDF state:", processedFile.state);

    if (processedFile.state === "FAILED") {
      return NextResponse.json(
        {
          error: "Gemini failed to process the PDF",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================
    // 6. Make sure URI exists
    // ==========================================

    if (!processedFile.uri || !processedFile.mimeType) {
      return NextResponse.json(
        {
          error: "Gemini did not return a valid file URI",
        },
        {
          status: 500,
        },
      );
    }

    // ==========================================
    // 7. Ask Gemini about the document
    // ==========================================

    console.log("Asking Gemini about the PDF...");

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        createPartFromUri(processedFile.uri, processedFile.mimeType),
        `
You are DocMind, an AI document assistant.

Answer the user's question based only on the provided PDF.

Rules:
- Do not invent information.
- Use information from the document.
- If the answer cannot be found in the document, say that the information could not be found.
- Give a clear and concise answer.

User question:
${question}
        `,
      ],
    });

    // ==========================================
    // 8. Return answer
    // ==========================================

    return NextResponse.json({
      answer: response.text,
    });
  } catch (error) {
    console.error("Document analysis error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze document",
      },
      {
        status: 500,
      },
    );
  }
}
