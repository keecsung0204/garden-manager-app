"use client";

import { useState } from "react";

type SaveAIAdviceProps = {
  noteId: number;
  plantId: number;
};

export default function SaveAIAdvice({
  noteId,
  plantId,
}: SaveAIAdviceProps) {
  const [saving, setSaving] = useState(false);

  async function saveSummary(formData: FormData) {
    setSaving(true);

    formData.set("noteId", String(noteId));

    const response = await fetch("/api/save-ai-advice", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("AI Summary saved");
      window.location.href = `/plants/${plantId}`;
    } else {
      alert("Failed to save AI Summary");
      setSaving(false);
    }
  }

  return (
    <section className="detail-card ai-check-card">
      <h2>AI 상담 요약 저장</h2>

      <form action={saveSummary}>
        <div className="form-row">
          <label htmlFor="aiQuestionSummary">문의 요약</label>
          <textarea
            id="aiQuestionSummary"
            name="aiQuestionSummary"
            rows={5}
            required
            placeholder="ChatGPT가 요약한 문의 내용 200~300자를 붙여 넣으세요."
          />
        </div>

        <div className="form-row">
          <label htmlFor="aiAnswerSummary">답변 요약</label>
          <textarea
            id="aiAnswerSummary"
            name="aiAnswerSummary"
            rows={5}
            required
            placeholder="ChatGPT가 요약한 답변 200~300자를 붙여 넣으세요."
          />
        </div>

        <button
          type="submit"
          className="ai-save-button"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save AI Summary"}
        </button>
      </form>
    </section>
  );
}