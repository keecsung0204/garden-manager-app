"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText?: string;
};

export default function SubmitButton({
  children,
  pendingText = "Saving...",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}