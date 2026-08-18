"use client";

import { useState } from "react";

type SpeciesItem = {
  id: number;
  commonName: string;
  scientificName: string;
  cultivar: string | null;
};

type SpeciesPasteHelperProps = {
  speciesList: SpeciesItem[];
};

export default function SpeciesPasteHelper({
  speciesList,
}: SpeciesPasteHelperProps) {
  const [inputText, setInputText] = useState("");
  const [message, setMessage] = useState("");

  function normalize(value: string | null | undefined) {
    return (value || "").trim().toLowerCase();
  }

  function normalizeCultivar(value: string | null | undefined) {
  const normalized = normalize(value);

  if (
    normalized === "unknown" ||
    normalized === "none" ||
    normalized === "-"
  ) {
    return "";
  }

  return normalized;
}

  function checkAndFill() {
    let text = inputText.trim();

    if (!text) {
      setMessage("Species 내용을 붙여 넣어 주세요.");
      return;
    }

    // [Species] 표식이 함께 복사된 경우 제거
    text = text.replace(/^\[Species\]\s*/i, "").trim();

    const parts = text.split("|").map((part) => part.trim());

    if (parts.length !== 3) {
      setMessage(
        "형식이 맞지 않습니다. Common Name | Scientific Name | Cultivar 형식인지 확인해 주세요."
      );
      return;
    }

    const commonName = parts[0];
    const scientificName = parts[1];

    const cultivar =
      normalize(parts[2]) === "unknown" ||
      normalize(parts[2]) === "none" ||
      parts[2] === "-"
        ? ""
        : parts[2];

    if (!commonName || !scientificName) {
      setMessage("Common Name과 Scientific Name은 필요합니다.");
      return;
    }

    const commonNameInput = document.getElementById(
      "speciesCommonName"
    ) as HTMLInputElement | null;

    const scientificNameInput = document.getElementById(
      "speciesScientificName"
    ) as HTMLInputElement | null;

    const cultivarInput = document.getElementById(
      "speciesCultivar"
    ) as HTMLInputElement | null;

    if (commonNameInput) {
      commonNameInput.value = commonName;
    }

    if (scientificNameInput) {
      scientificNameInput.value = scientificName;
    }

    if (cultivarInput) {
      cultivarInput.value = cultivar;
    }

    const sameScientificName = speciesList.filter(
      (species) =>
        normalize(species.scientificName) ===
        normalize(scientificName)
    );

    const exactMatch = sameScientificName.find(
      (species) =>
        normalizeCultivar(species.cultivar) ===
        normalizeCultivar(cultivar)
      );

    if (exactMatch) {
      setMessage(
        `이미 등록된 Species입니다: ${exactMatch.commonName} | ${exactMatch.scientificName} | ${exactMatch.cultivar || "-"}`
      );
      return;
    }

    if (sameScientificName.length > 0) {
      const existing = sameScientificName
        .map(
          (species) =>
            `${species.commonName} | ${species.scientificName} | ${species.cultivar || "-"}`
        )
        .join(" / ");

      setMessage(
        `같은 Scientific Name이 이미 있습니다. Cultivar를 확인하세요: ${existing}`
      );
      return;
    }

    setMessage("기존 Species가 없습니다. 새로 추가할 수 있습니다.");
  }

  return (
    <div className="species-paste-helper">
      <div className="form-row">
        <label htmlFor="speciesPaste">
          AI Species 붙여넣기
        </label>

        <textarea
          id="speciesPaste"
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`[Species]Indian Hawthorn | Rhaphiolepis indica | Unknown`}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="link-button secondary"
          onClick={checkAndFill}
        >
          Check & Fill
        </button>
      </div>

      {message && (
        <div className="species-check-message">
          {message}
        </div>
      )}
    </div>
  );
}