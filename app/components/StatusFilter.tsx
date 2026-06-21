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
        } else {
            params.delete("statusId");
        }

        const queryString = params.toString();

        router.push(queryString ? `/?${queryString}` : "/");
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