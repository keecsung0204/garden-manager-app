import prisma from "@/lib/prisma";
import Link from "next/link";
import StatusFilter from "@/app/components/StatusFilter";
import AreaFilter from "@/app/components/AreaFilter";
import CategoryFilter from "@/app/components/CategoryFilter";
import { getGardenPhotoUrl } from "@/lib/photoStorage";
import { cookies } from "next/headers";
import ClearPlantFilters from "@/app/components/ClearPlantFilters";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    statusId?: string;
    areaId?: string;
    categoryId?: string;
  };

}) {

  const cookieStore = cookies();

  const savedStatusId = cookieStore.get("plantStatusId")?.value;
  const savedAreaId = cookieStore.get("plantAreaId")?.value;
  const savedCategoryId = cookieStore.get("plantCategoryId")?.value;

  const selectedStatusId = searchParams?.statusId
    ? Number(searchParams.statusId)
    : savedStatusId
    ? Number(savedStatusId)
    : undefined;

  const selectedAreaId = searchParams?.areaId
    ? Number(searchParams.areaId)
    : savedAreaId
    ? Number(savedAreaId)
    : undefined;

  const selectedCategoryId = searchParams?.categoryId
    ? Number(searchParams.categoryId)
    : savedCategoryId
    ? Number(savedCategoryId)
    : undefined;

  const statuses = await prisma.plantStatus.findMany({
    orderBy: {
      displayOrder: "asc",
    },
  });
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

  const plants = await prisma.plant.findMany({
    where: {
      ...(selectedStatusId ? { statusId: selectedStatusId } : {}),
      ...(selectedAreaId ? { areaId: selectedAreaId } : {}),
      ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
    },
    include: {
      area: true,
      category: true,
      status: true,
      species: true,
      photos: {
        orderBy: [
          { isCover: "desc" },
          { createdAt: "desc" },
        ],
        take: 1,
      },
    },
    orderBy: {
      plantCode: "asc",
    },
  });
  const plantsWithPhotoUrls = await Promise.all(
    plants.map(async (plant) => ({
      ...plant,
      coverPhotoUrl: plant.photos[0]
        ? await getGardenPhotoUrl(
            plant.photos[0].thumbnailPath || plant.photos[0].filePath
          )
        : null,
    }))
  );

  return (
    <main style={{ padding: "20px", maxWidth: "900px" }}>

      <section className="detail-card">
        <div className="plants-heading-row">
          <h2>Plants ({plantsWithPhotoUrls.length})</h2>

          <ClearPlantFilters />

          <span>Area</span>
          <AreaFilter
            areas={areas}
            selectedAreaId={selectedAreaId?.toString() || ""}
          />

          <span>Category</span>
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId?.toString() || ""}
          />

          <span>Status</span>
          <StatusFilter
            statuses={statuses}
            selectedStatusId={selectedStatusId?.toString() || ""}
          />
        </div>

        <table className="plant-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Plant Code</th>
              <th>Plant Name</th>
              <th>Area</th>
              <th>Category</th>
              <th>Identify Status</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>          
          </thead>
          <tbody>
            {plantsWithPhotoUrls.length === 0 ? (
              <tr>
                <td colSpan={8}>해당 조건의 Plant가 없습니다.</td>
              </tr>
            ) : (
              plantsWithPhotoUrls.map((plant) => (
                <tr key={plant.id}>
                  <td>
                    {plant.photos[0] ? (
                      <Link href={`/plants/${plant.id}`}>
                        <img
                          className="home-plant-photo"
                          src={plant.coverPhotoUrl || plant.photos[0].filePath}
                          alt={plant.plantName}
                        />
                      </Link>
                    ) : (
                      <span className="home-no-photo">-</span>
                    )}
                  </td>
                  <td>{plant.plantCode}</td>
                  <td>
                    <Link className="plant-name-link" href={`/plants/${plant.id}`}>
                      {plant.plantName}
                    </Link>

                    {plant.species && (
                      <div className="plant-species-small">
                        {plant.species.commonName}
                        {plant.species.scientificName
                          ? ` · ${plant.species.scientificName}`
                          : ""}
                      </div>
                    )}
                  </td>
                  <td>
                    {plant.area
                      ? `${plant.area.areaCode} - ${plant.area.name}`
                      : "-"}
                  </td>
                  <td>
                    {plant.category
                      ? `${plant.category.categoryCode} - ${plant.category.name}`
                      : "-"}
                  </td>
                  <td>{plant.identifyStatus}</td>
                  <td>
                    <span
                      className={`status-pill status-${plant.status?.name?.toLowerCase() || "none"
                        }`}
                    >
                      {plant.status?.name || "-"}
                    </span>
                  </td>
                  <td className="action-links">

                    <Link
                      className="link-button secondary"
                      href={`/plants/${plant.id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>

      </section>
    </main>
  );
}
