"use client";

import { useRouter } from "next/navigation";

export default function ClearPlantFilters() {
  const router = useRouter();

  function handleClear() {
    localStorage.removeItem("plantListFilters");
    router.push("/plants");
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      className="link-button secondary"
    >
      Clear Filters
    </button>
  );
}
