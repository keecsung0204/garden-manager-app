"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Area = {
  id: number;
  areaCode: string;
  name: string;
};

type AreaFilterProps = {
  areas: Area[];
  selectedAreaId?: string;
};

export default function AreaFilter({
  areas,
  selectedAreaId = "",
}: AreaFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const areaId = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (areaId) {
      params.set("areaId", areaId);
      document.cookie = `plantAreaId=${areaId}; path=/; max-age=31536000`;
    } else {
      params.delete("areaId");
      document.cookie = "plantAreaId=; path=/; max-age=0";
    }

    const queryString = params.toString();

    router.push(queryString ? `/plants?${queryString}` : "/plants");
  }

  return (
    <select name="areaId" value={selectedAreaId} onChange={handleChange}>
      <option value="">All</option>
      {areas.map((area) => (
        <option key={area.id} value={area.id}>
          {area.areaCode} - {area.name}
        </option>
      ))}
    </select>
  );
}