import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import PlantForm from "@/app/components/PlantForm";
import { getPlantFormOptions } from "@/lib/getPlantFormOptions";


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

    const { areas, categories, statuses } = await getPlantFormOptions();
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
                <PlantForm
                    action={createPlant}
                    areas={areas}
                    categories={categories}
                    statuses={statuses}
                    defaultValues={{
                        plantCode: nextPlantCode,
                        identifyStatus: "Unknown",
                    }}
                    submitLabel="Save Plant"
                />

            </section>
        </main>
    );
}
