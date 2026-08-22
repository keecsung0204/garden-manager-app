"use client";

import { useState } from "react";

export default function CareGuidePasteHelper() {
    const [text, setText] = useState("");
    const [message, setMessage] = useState("");

    function setFieldValue(id: string, value: string) {
        const element = document.getElementById(
            id
        ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

        if (!element) return;

        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function extractValue(source: string, label: string) {
        const regex = new RegExp(
            `${label}\\s*:\\s*(.*)`,
            "i"
        );

        return source.match(regex)?.[1]?.trim() || "";
    }

    function handleImport() {
        const careGuideMatch = text.match(
            /\[Care Guide\]([\s\S]*?)(?=\[문의 요약\]|\[답변 요약\]|\[요약 끝\]|$)/i
        );

        if (!careGuideMatch) {
            setMessage("[Care Guide] 부분을 찾지 못했습니다.");
            return;
        }

        const careGuide = careGuideMatch[1];

        const waterNeed = extractValue(careGuide, "Water Need Level");
        const sunNeed = extractValue(careGuide, "Sun Need Level");
        const depth = extractValue(careGuide, "Moisture Check Depth \\(cm\\)");
        const trigger = extractValue(careGuide, "Moisture Trigger");
        const wateringGuide = extractValue(careGuide, "Watering Guide");

        const waterLevel = waterNeed.match(/[1-5]/)?.[0] || "";
        const sunLevel = sunNeed.match(/[1-5]/)?.[0] || "";
        const depthValue = depth.match(/\d+/)?.[0] || "";

        const triggerValue =
            /^unknown$/i.test(trigger)
                ? ""
                : trigger.match(/\d+/)?.[0] || "";

        setFieldValue("waterNeedLevel", waterLevel);
        setFieldValue("sunNeedLevel", sunLevel);
        setFieldValue("moistureCheckDepthCm", depthValue);
        setFieldValue("moistureTrigger", triggerValue);
        setFieldValue("wateringGuide", wateringGuide);

        setMessage("Care Guide 값을 입력란에 가져왔습니다.");
    }

    return (
        <div className="care-guide-paste-helper">
            <label htmlFor="careGuidePaste">
                ChatGPT Care Guide 붙여넣기
            </label>

            <textarea
                id="careGuidePaste"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="ChatGPT 전체 답변을 여기에 붙여넣으세요."
            />

            <button
                type="button"
                className="link-button secondary"
                onClick={handleImport}
            >
                Care Guide 가져오기
            </button>

            {message && <div>{message}</div>}
        </div>
    );
}