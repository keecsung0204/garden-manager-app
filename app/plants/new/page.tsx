import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import PlantForm from "@/app/components/PlantForm";
import { getPlantFormOptions } from "@/lib/getPlantFormOptions";


async function createPlant(formData: FormData) {
    "use server";
    const speciesId = formData.get("speciesId")?.toString();
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
            speciesId: speciesId ? Number(speciesId) : null,
            scientificName: scientificName || null,
        },
    });

    redirect(`/plants/${newPlant.id}`);
}

export default async function NewPlantPage() {

    const { areas, categories, statuses, species  } = await getPlantFormOptions();
    const lastPlant = await prisma.plant.findFirst({
        orderBy: {
            plantCode: "desc",
        },
        select: {
            plantCode: true,
        },
    });

    const lastNumber = lastPlant
        ? Number(lastPlant.plantCode.replace(/\D/g, ""))
        : 0;

    const nextPlantCode = `P${String(lastNumber + 1).padStart(3, "0")}`;

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
                    species={species}
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
