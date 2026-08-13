import prisma from "@/lib/prisma";

export async function getPlantFormOptions() {
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

  const species = await prisma.plantSpecies.findMany({
    orderBy: [
      { commonName: "asc" },
      { scientificName: "asc" },
    ],
  });

  return {
    areas,
    categories,
    statuses,
    species,
  };
}