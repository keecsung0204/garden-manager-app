"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PlantFilterRestore() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.toString()) return;

    const savedFilters = localStorage.getItem("plantListFilters");

    if (savedFilters) {
      router.replace(`/plants?${savedFilters}`);
    }
  }, [router, searchParams]);

  return null;
}
