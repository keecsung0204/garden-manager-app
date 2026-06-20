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
        <main className="edit-page">
            <h1>Add New Plant</h1>
            <div className="page-actions">
                <Link className="link-button secondary" href="/">
                    ← Back to Home
                </Link>
            </div>
            <section className="detail-card">
                <h2>Plant Information</h2>

                <form className="form-grid" action={createPlant}>

                    <div className="form-row">
                        <label htmlFor="plantCode">Plant Code</label>
                        <input id="plantCode" name="plantCode" defaultValue={nextPlantCode} />
                    </div>

                    <div className="form-row">
                        <label htmlFor="plantName">Plant Name</label>
                        <input id="plantName" name="plantName" required />
                    </div>

                    <div className="form-row">
                        <label htmlFor="areaId">Area</label>
                        <select id="areaId" name="areaId" required defaultValue="">
                            <option value="">장소 선택</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.areaCode} - {area.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="categoryId">Category</label>
                        <select id="CategoryId" name="categoryId" required defaultValue="">
                            <option value="">분류 선택</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.categoryCode} - {category.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="form-row">
                        <label htmlFor="identifyStatus">Identify Status</label>
                        <select id="identifyStatus" name="identifyStatus" defaultValue="Unknown">
                            <option value="Unknown">Unknown</option>
                            <option value="Tentative">Tentative</option>
                            <option value="Confirmed">Confirmed</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="statusId">Plant Status</label>
                        <select id="statusId" name="statusId" required defaultValue="">
                            <option value="">상태 선택</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.statusCode} - {status.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="scientificName">Scientific Name</label>
                        <input id="scientificName" name="scientificName" />
                    </div>


                    <button type="submit">Save Plant</button>
                </form>
            </section>
        </main>
    );
}
