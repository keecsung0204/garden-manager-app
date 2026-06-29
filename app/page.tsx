import prisma from "@/lib/prisma";
import Link from "next/link";
import StatusFilter from "@/app/components/StatusFilter";
import AreaFilter from "@/app/components/AreaFilter";
import CategoryFilter from "@/app/components/CategoryFilter";

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    statusId?: string;
    areaId?: string;
    categoryId?: string;
  };

}) {

  const selectedStatusId = searchParams?.statusId
    ? Number(searchParams.statusId)
    : undefined;
  const selectedAreaId = searchParams?.areaId
    ? Number(searchParams.areaId)
    : undefined;
  const selectedCategoryId = searchParams?.categoryId
    ? Number(searchParams.categoryId)
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

  return (
    <main style={{ padding: "20px", maxWidth: "900px" }}>
      <h1>Garden Manager</h1>
      <div className="home-actions">
        <Link href="/plants/new" className="link-button">
          Add New Plant
        </Link>

        <Link href="/" className="link-button secondary">
          Clear Filters
        </Link>
      </div>

      <section className="detail-card">
        <h2>Plants ({plants.length})</h2>

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

            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th>
                <AreaFilter
                  areas={areas}
                  selectedAreaId={searchParams?.areaId || ""}
                />
              </th>
              <th>
                <CategoryFilter
                  categories={categories}
                  selectedCategoryId={searchParams?.categoryId || ""}
                />
              </th>
              <th></th>
              <th>
                <StatusFilter
                  statuses={statuses}
                  selectedStatusId={searchParams?.statusId || ""}
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 ? (
              <tr>
                <td colSpan={8}>해당 조건의 Plant가 없습니다.</td>
              </tr>
            ) : (
              plants.map((plant) => (
                <tr key={plant.id}>
                  <td>
                    {plant.photos[0] ? (
                      <Link href={`/plants/${plant.id}`}>
                        <img
                          className="home-plant-photo"
                          src={plant.photos[0].filePath}
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
