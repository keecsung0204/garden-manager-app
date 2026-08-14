import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const plantId = Number(formData.get("plantId"));
    const content = String(formData.get("content") || "").trim();

    if (!plantId || !content) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    // AI Advice Note Type 찾기 (NT04)
    const aiAdviceType = await prisma.noteType.findUnique({
      where: {
        typeCode: "NT04",
      },
    });

    if (!aiAdviceType) {
      return NextResponse.json(
        { error: "AI Advice Note Type not found" },
        { status: 500 }
      );
    }

    await prisma.plantNote.create({
      data: {
        plantId,
        noteTypeId: aiAdviceType.id,
        content,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Save AI Advice error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}