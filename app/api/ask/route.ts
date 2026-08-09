import { gemini } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const question = body.question;

    if (!question) {
      return NextResponse.json(
        {
          error: "Question is required",
        },
        {
          status: 400,
        },
      );
    }

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: question,
    });

    return NextResponse.json({
      answer: response.text,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    return NextResponse.json(
      {
        error: "Failed to communicate with Gemini",
      },
      {
        status: 500,
      },
    );
  }
}
