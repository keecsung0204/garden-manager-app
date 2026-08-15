import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const noteId = Number(formData.get("noteId"));
    const aiQuestionSummary = String(
      formData.get("aiQuestionSummary") || ""
    ).trim();
    const aiAnswerSummary = String(
      formData.get("aiAnswerSummary") || ""
    ).trim();

    if (!noteId || !aiQuestionSummary || !aiAnswerSummary) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    await prisma.plantNote.update({
      where: {
        id: noteId,
      },
      data: {
        aiQuestionSummary,
        aiAnswerSummary,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Save AI Summary error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}