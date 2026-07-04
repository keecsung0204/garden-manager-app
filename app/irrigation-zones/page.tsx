import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";

export default async function IrrigationZonesPage({
    searchParams,
}: {
    searchParams?: {
        error?: string;
    };
}) {
    const zones = await prisma.irrigationZone.findMany({
        include: {
            areas: {
                orderBy: {
                    areaCode: "asc",
                },
            },
            plantIrrigations: true,
        },
        orderBy: {
            zoneCode: "asc",
        },
    });

    async function createIrrigationZone(formData: FormData) {
        "use server";

        const zoneCode = String(formData.get("zoneCode") || "").trim();
        const name = String(formData.get("name") || "").trim();
        const externalSystem = String(formData.get("externalSystem") || "").trim();
        const externalZoneNoText = String(formData.get("externalZoneNo") || "");
        const frequencyDaysText = String(formData.get("frequencyDays") || "");
        const runMinutesText = String(formData.get("runMinutes") || "");
        const notes = String(formData.get("notes") || "").trim();

        if (!zoneCode || !name) {
            return;
        }

        const existingZone = await prisma.irrigationZone.findUnique({
            where: {
                zoneCode,
            },
        });

        if (existingZone) {
            redirect("/irrigation-zones?error=duplicate-zone-code");
        }
        const externalZoneNo = externalZoneNoText
            ? Number(externalZoneNoText)
            : null;

        const frequencyDays = frequencyDaysText
            ? Number(frequencyDaysText)
            : null;

        const runMinutes = runMinutesText
            ? Number(runMinutesText)
            : null;

        await prisma.irrigationZone.create({
            data: {
                zoneCode,
                name,
                externalSystem: externalSystem || null,
                externalZoneNo,
                frequencyDays,
                runMinutes,
                notes: notes || null,
            },
        });

        revalidatePath("/irrigation-zones");
        redirect("/irrigation-zones");
    }

    return (
        <main style={{ padding: "20px", maxWidth: "900px" }}>
            <h1>Irrigation Zones</h1>

            <div className="page-actions">
                <Link className="link-button secondary" href="/">
                    ← Back to Home
                </Link>
            </div>
            {searchParams?.error === "duplicate-zone-code" && (
                <div className="form-error">
                    이미 사용 중인 Zone Code입니다. 다른 Zone Code를 입력해 주세요.
                </div>
            )}
            <section className="detail-card">
                <h2>Add Irrigation Zone</h2>

                <form action={createIrrigationZone} className="add-note-form">
                    <div className="form-row">
                        <label htmlFor="zoneCode">Zone Code</label>
                        <input
                            id="zoneCode"
                            name="zoneCode"
                            type="text"
                            placeholder="예: IZ001"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="name">Zone Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="예: b-hyve Zone 1 - Front Lawn"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="externalSystem">External System</label>
                        <select
                            id="externalSystem"
                            name="externalSystem"
                            defaultValue="B_HYVE"
                        >
                            <option value="">연결 시스템 없음</option>
                            <option value="B_HYVE">B_HYVE</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="externalZoneNo">b-hyve Zone No</label>
                        <input
                            id="externalZoneNo"
                            name="externalZoneNo"
                            type="number"
                            min="1"
                            placeholder="예: 1"
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="frequencyDays">Frequency Days</label>
                        <input
                            id="frequencyDays"
                            name="frequencyDays"
                            type="number"
                            min="1"
                            placeholder="예: 3"
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="runMinutes">Run Minutes</label>
                        <input
                            id="runMinutes"
                            name="runMinutes"
                            type="number"
                            min="1"
                            placeholder="예: 20"
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            placeholder="예: b-hyve 앱 기준 Zone 1. 여름에는 20분."
                        />
                    </div>

                    <div className="form-actions">
                        <SubmitButton pendingText="Saving Zone...">
                            Save Irrigation Zone
                        </SubmitButton>
                    </div>
                </form>
            </section>

            <section className="detail-card">
                <h2>Irrigation Zone List ({zones.length})</h2>

                <table className="plant-table">
                    <thead>
                        <tr>
                            <th>Zone Code</th>
                            <th>Name</th>
                            <th>System</th>
                            <th>Zone No</th>
                            <th>Frequency</th>
                            <th>Run Minutes</th>
                            <th>Areas</th>
                            <th>Plants</th>
                            <th>Notes</th>
                        </tr>
                    </thead>

                    <tbody>
                        {zones.length === 0 ? (
                            <tr>
                                <td colSpan={9}>아직 Irrigation Zone이 없습니다.</td>
                            </tr>
                        ) : (
                            zones.map((zone) => (
                                <tr key={zone.id}>
                                    <td>{zone.zoneCode}</td>
                                    <td>{zone.name}</td>
                                    <td>{zone.externalSystem || "-"}</td>
                                    <td>{zone.externalZoneNo || "-"}</td>
                                    <td>
                                        {zone.frequencyDays
                                            ? `${zone.frequencyDays}일마다`
                                            : "-"}
                                    </td>
                                    <td>
                                        {zone.runMinutes
                                            ? `${zone.runMinutes}분`
                                            : "-"}
                                    </td>
                                    <td>
                                        {zone.areas.length === 0 ? (
                                            "-"
                                        ) : (
                                            <div className="area-list-cell">
                                                {zone.areas.map((area) => (
                                                    <div key={area.id}>
                                                        {area.areaCode} - {area.name}
                                                        {area.irrigationMethod
                                                            ? ` (${area.irrigationMethod})`
                                                            : ""}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>{zone.plantIrrigations.length}</td>
                                    <td>{zone.notes || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </main>
    );
}