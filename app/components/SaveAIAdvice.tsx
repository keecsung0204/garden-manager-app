"use client";

import { useState } from "react";

type SaveAIAdviceProps = {
  plantId: number;
  mode: "identify" | "diagnose";
  questionText: string;
};

export default function SaveAIAdvice({
  plantId,
  mode,
  questionText,
}: SaveAIAdviceProps) {
  const [saving, setSaving] = useState(false);

  async function saveAdvice(formData: FormData) {
    setSaving(true);

    formData.set("plantId", String(plantId));
    formData.set("mode", mode);
    formData.set("questionText", questionText);

    const response = await fetch("/api/save-ai-advice", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("AI Advice saved");
      window.location.href = `/plants/${plantId}`;
    } else {
      alert("Failed to save AI Advice");
      setSaving(false);
    }
  }

  return (
    <section className="detail-card ai-check-card">
      <h2>AI Advice 저장</h2>

      <form action={saveAdvice}>
        <textarea
          name="content"
          rows={10}
          required
          placeholder="ChatGPT 답변을 여기에 붙여 넣으세요."
          style={{ width: "100%" }}
        />

        <button
            type="submit"
            className="ai-save-button"
            disabled={saving}
        >
          {saving ? "Saving..." : "Save AI Advice"}
        </button>
      </form>
    </section>
  );
}