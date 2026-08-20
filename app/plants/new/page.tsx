import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import PlantForm from "@/app/components/PlantForm";
import { getPlantFormOptions } from "@/lib/getPlantFormOptions";

export const dynamic = "force-dynamic";

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
    const chatgptUrl = formData.get("chatgptUrl")?.toString().trim();
    const waterNeedLevel = formData.get("waterNeedLevel")?.toString();
    const sunNeedLevel = formData.get("sunNeedLevel")?.toString();
    const moistureCheckDepthCm = formData.get("moistureCheckDepthCm")?.toString();
    const moistureTrigger = formData.get("moistureTrigger")?.toString();
    const wateringGuide = formData.get("wateringGuide")?.toString().trim();

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
            chatgptUrl: chatgptUrl || null,
            waterNeedLevel: waterNeedLevel ? Number(waterNeedLevel) : null,
            sunNeedLevel: sunNeedLevel ? Number(sunNeedLevel) : null,
            moistureCheckDepthCm: moistureCheckDepthCm
                ? Number(moistureCheckDepthCm)
                : null,
            moistureTrigger: moistureTrigger ? Number(moistureTrigger) : null,
            wateringGuide: wateringGuide || null,
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
