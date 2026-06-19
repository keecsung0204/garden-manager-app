import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";


async function createPlant(formData: FormData) {
    "use server";

    const plantCode = formData.get("plantCode")?.toString().trim();
    const plantName = formData.get("plantName")?.toString().trim();
    const areaId = formData.get("areaId")?.toString();
    const categoryId = formData.get("categoryId")?.toString();
    const identifyStatus = formData.get("identifyStatus")?.toString();
    const statusId = formData.get("statusId")?.toString();
    const scientificName = formData.get("scientificName")?.toString().trim();

    if (!plantCode || !plantName) {
        return;
    }

    const newPlant = await prisma.plant.create({
        data: {
            plantCode,
            plantName,
            areaId: areaId ? Number(areaId) : null,
            categoryId: categoryId ? Number(categoryId) : null,
            identifyStatus: (identifyStatus || "Unknown") as
                | "Unknown"
                | "Tentative"
                | "Confirmed",
            statusId: statusId ? Number(statusId) : null,
            scientificName: scientificName || null,
        },
    });

    redirect(`/plants/${newPlant.id}`);
}

export default async function NewPlantPage() {
    const areas = await prisma.area.findMany({
        orderBy: {
            areaCode: "asc",
        },
    });

    const categories = await prisma.plantCategory.findMany({
        orderBy: {
            categoryCode: "asc",
        },
    });

    const statuses = await prisma.plantStatus.findMany({
        orderBy: {
            displayOrder: "asc",
        },
    });

    const plantCount = await prisma.plant.count();
    const nextPlantCode = `P${String(plantCount + 1).padStart(3, "0")}`;

    return (
        <main style={{ padding: "20px", maxWidth: "900px" }}>
            <h1>Add New Plant</h1>
            <div className="page-actions">
                <Link className="link-button secondary" href="/">
                    ← Back to Home
                </Link>
            </div>
            <section style={{ marginBottom: "40px" }}>
                <h2>Plant Information</h2>

                <form action={createPlant}>
                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            Plant Code:
                            <br />
                            <input name="plantCode" defaultValue={nextPlantCode} />
                        </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            Plant Name:
                            <br />
                            <input name="plantName" required />
                        </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            Area:
                            <br />
                            <select name="areaId" required defaultValue="">
                                <option value="">장소 선택</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.id}>
                                        {area.areaCode} - {area.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            Category:
                            <br />
                            <select name="categoryId" required defaultValue="">
                                <option value="">분류 선택</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.categoryCode} - {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            Identify Status:
                            <br />
                            <select name="identifyStatus" defaultValue="Unknown">
                                <option value="Unknown">Unknown</option>
                                <option value="Tentative">Tentative</option>
                                <option value="Confirmed">Confirmed</option>
                            </select>
                        </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            Plant Status:
                            <br />
                            <select name="statusId" required defaultValue="">
                                <option value="">상태 선택</option>
                                {statuses.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.statusCode} - {status.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label>
                            Scientific Name:
                            <br />
                            <input name="scientificName" />
                        </label>
                    </div>

                    <button type="submit">Save Plant</button>
                </form>
            </section>
        </main>
    );
}
