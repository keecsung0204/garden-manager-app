"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
};

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleCopy() {
    setFailed(false);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopyText(text);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      try {
        fallbackCopyText(text);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1500);
      } catch {
        setFailed(true);

        setTimeout(() => {
          setFailed(false);
        }, 2000);
      }
    }
  }

  function fallbackCopyText(value: string) {
    const textarea = document.createElement("textarea");

    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const successful = document.execCommand("copy");

    document.body.removeChild(textarea);

    if (!successful) {
      throw new Error("Copy failed");
    }
  }

  return (
    <button type="button" className="copy-button" onClick={handleCopy}>
      <span className="copy-icon">⧉</span>
      <span>{failed ? "복사 실패" : copied ? "Copied" : "Copy"}</span>
    </button>
  );
}