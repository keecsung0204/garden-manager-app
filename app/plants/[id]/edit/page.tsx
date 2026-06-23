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
  const { areas, categories, statuses } = await getPlantFormOptions();

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
    const identifyStatus = formData.get("identifyStatus") as
      | "Unknown"
      | "Tentative"
      | "Confirmed";
    const scientificName = formData.get("scientificName") as string;
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
        identifyStatus,
        scientificName: scientificName || null,
      },
    });

    revalidatePath("/");
    revalidatePath(`/plants/${plant.id}/edit`);

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
        defaultValues={{
          plantCode: plant.plantCode,
          plantName: plant.plantName,
          areaId: plant.areaId,
          categoryId: plant.categoryId,
          identifyStatus: plant.identifyStatus,
          statusId: plant.statusId,
          scientificName: plant.scientificName,
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