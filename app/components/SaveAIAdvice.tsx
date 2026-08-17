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
  const [fullAnswer, setFullAnswer] = useState("");
  const [questionSummary, setQuestionSummary] = useState("");
  const [answerSummary, setAnswerSummary] = useState("");

  function extractSummaries() {
    const questionMarker = "[문의 요약]";
    const answerMarker = "[답변 요약]";
    const endMarker = "[요약 끝]";

    const questionStart = fullAnswer.indexOf(questionMarker);
    const answerStart = fullAnswer.indexOf(answerMarker);

    if (
      questionStart === -1 ||
      answerStart === -1 ||
      answerStart <= questionStart
    ) {
      alert(
        "[문의 요약] 또는 [답변 요약]을 찾을 수 없습니다."
      );
      return;
    }

    const extractedQuestion = fullAnswer
      .slice(
        questionStart + questionMarker.length,
        answerStart
      )
      .trim();

    const endStart = fullAnswer.indexOf(
      endMarker,
      answerStart + answerMarker.length
    );

    const extractedAnswer = fullAnswer
      .slice(
        answerStart + answerMarker.length,
        endStart === -1 ? fullAnswer.length : endStart
      )
      .trim();

    setQuestionSummary(extractedQuestion);
    setAnswerSummary(extractedAnswer);
  }

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

      <div className="form-row">
        <label htmlFor="fullAiAnswer">
          ChatGPT 답변 전체
        </label>

        <textarea
          id="fullAiAnswer"
          rows={10}
          value={fullAnswer}
          onChange={(e) => setFullAnswer(e.target.value)}
          placeholder="ChatGPT 답변 전체를 한 번 붙여 넣으세요."
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="link-button"
          onClick={extractSummaries}
        >
          요약 가져오기
        </button>
      </div>

      <form action={saveSummary}>
        <div className="form-row">
          <label htmlFor="aiQuestionSummary">
            문의 요약
          </label>

          <textarea
            id="aiQuestionSummary"
            name="aiQuestionSummary"
            rows={5}
            required
            value={questionSummary}
            onChange={(e) =>
              setQuestionSummary(e.target.value)
            }
          />
        </div>

        <div className="form-row">
          <label htmlFor="aiAnswerSummary">
            답변 요약
          </label>

          <textarea
            id="aiAnswerSummary"
            name="aiAnswerSummary"
            rows={5}
            required
            value={answerSummary}
            onChange={(e) =>
              setAnswerSummary(e.target.value)
            }
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="ai-save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save AI Summary"}
          </button>

          <button
            type="button"
            className="link-button secondary"
            disabled={saving}
            onClick={() => {
              window.location.href = `/plants/${plantId}`;
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}