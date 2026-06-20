"use client";

import { useRouter } from "next/navigation";

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

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const statusId = event.target.value;

    if (statusId) {
      router.push(`/?statusId=${statusId}`);
    } else {
      router.push("/");
    }
  }

  return (
    <select name="statusId" value={selectedStatusId} onChange={handleChange}>
      <option value="">All Status</option>
      {statuses.map((status) => (
        <option key={status.id} value={status.id}>
          {status.name}
        </option>
      ))}
    </select>
  );
}