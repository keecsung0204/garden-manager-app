import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PlantForm from "@/app/components/PlantForm";
import { getPlantFormOptions } from "@/lib/getPlantFormOptions";

export default async function EditPlantPage({
  params,
}: {
  params: { id: string };
}) {
  const plantId = Number(params.id);
  const { areas, categories, statuses, species  } = await getPlantFormOptions();

  const plant = await prisma.plant.findUnique({
    where: {
      id: plantId,
    },
    include: {
      area: true,
      category: true,
      status: true,
      notes: {
        orderBy: {
          noteDate: "desc",
        },
        include: {
          noteTypeRef: true,
        },
      },
    },
  });

  if (!plant) {
    return (
      <main style={{ padding: "20px" }}>
        <h1>Plant Not Found</h1>
        <Link href="/">Back to Home</Link>
      </main>
    );
  }
  async function updatePlant(formData: FormData) {
    "use server";

    const plantName = formData.get("plantName") as string;
    const areaId = formData.get("areaId") as string;
    const categoryId = formData.get("categoryId") as string;
    const statusId = formData.get("statusId") as string;
    const speciesId = formData.get("speciesId") as string;
    const identifyStatus = formData.get("identifyStatus") as
      | "Unknown"
      | "Tentative"
      | "Confirmed";
    const scientificName = formData.get("scientificName") as string;
    const chatgptUrl = formData.get("chatgptUrl") as string;
    const waterNeedLevel = formData.get("waterNeedLevel") as string;
    const sunNeedLevel = formData.get("sunNeedLevel") as string;
    const moistureCheckDepthCm = formData.get("moistureCheckDepthCm") as string;
    const moistureTrigger = formData.get("moistureTrigger") as string;
    const wateringGuide = formData.get("wateringGuide") as string;
    const currentPlantId = Number(params.id);

    await prisma.plant.update({
      where: {
        id: currentPlantId,
      },
      data: {
        plantName,
        areaId: areaId ? Number(areaId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        statusId: statusId ? Number(statusId) : null,
        speciesId: speciesId ? Number(speciesId) : null,
        identifyStatus,
        scientificName: scientificName || null,
        chatgptUrl: chatgptUrl || null,
        waterNeedLevel: waterNeedLevel ? Number(waterNeedLevel) : null,
        sunNeedLevel: sunNeedLevel ? Number(sunNeedLevel) : null,
        moistureCheckDepthCm: moistureCheckDepthCm
          ? Number(moistureCheckDepthCm)
          : null,
        moistureTrigger: moistureTrigger ? Number(moistureTrigger) : null,
        wateringGuide: wateringGuide?.trim() || null,
      },
    });

    revalidatePath("/");
    revalidatePath(`/plants/${currentPlantId}/edit`);

    redirect(`/plants/${currentPlantId}`);
  }

  return (
    <main className="edit-page">
      <h1>Edit Plant</h1>

      <PlantForm
        action={updatePlant}
        areas={areas}
        categories={categories}
        statuses={statuses}
        species={species}
        defaultValues={{
          plantCode: plant.plantCode,
          plantName: plant.plantName,
          areaId: plant.areaId,
          categoryId: plant.categoryId,
          identifyStatus: plant.identifyStatus,
          statusId: plant.statusId,
          speciesId: plant.speciesId,
          scientificName: plant.scientificName,
          chatgptUrl: plant.chatgptUrl,
          waterNeedLevel: plant.waterNeedLevel,
          sunNeedLevel: plant.sunNeedLevel,
          moistureCheckDepthCm: plant.moistureCheckDepthCm,
          moistureTrigger: plant.moistureTrigger,
          wateringGuide: plant.wateringGuide,
        }}
        submitLabel="Save Plant"
      />

      <div className="page-actions">
        <Link className="link-button secondary" href={`/plants/${plant.id}`}>
          ← Back to Detail
        </Link>
      </div>
    </main>
  );

}