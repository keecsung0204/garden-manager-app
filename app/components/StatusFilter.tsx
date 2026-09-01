"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Status = {
  id: number;
  name: string;
};

type StatusFilterProps = {
  statuses: Status[];
  selectedStatusId?: string;
};

export default function StatusFilter({
  statuses,
  selectedStatusId = "",
}: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const statusId = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (statusId) {
      params.set("statusId", statusId);
      document.cookie = `plantStatusId=${statusId}; path=/; max-age=31536000`;
    } else {
      params.delete("statusId");
      document.cookie = "plantStatusId=; path=/; max-age=0";
    }

    const queryString = params.toString();

    router.push(queryString ? `/plants?${queryString}` : "/plants");
  }

  return (
    <select
      name="statusId"
      value={selectedStatusId}
      onChange={handleChange}
    >
      <option value="">All</option>

      {statuses.map((status) => (
        <option key={status.id} value={status.id}>
          {status.name}
        </option>
      ))}
    </select>
  );
}
