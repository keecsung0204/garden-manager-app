"use client";

import { useRouter } from "next/navigation";

export default function ClearPlantFilters() {
  const router = useRouter();

  function handleClear() {
    document.cookie = "plantAreaId=; path=/; max-age=0";
    document.cookie = "plantCategoryId=; path=/; max-age=0";
    document.cookie = "plantStatusId=; path=/; max-age=0";

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
