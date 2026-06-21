import prisma from "@/lib/prisma";
import Link from "next/link";
import StatusFilter from "@/app/components/StatusFilter";
import AreaFilter from "@/app/components/AreaFilter";

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    statusId?: string;
    areaId?: string;
  };

}) {

  const selectedStatusId = searchParams?.statusId
    ? Number(searchParams.statusId)
    : undefined;
  const selectedAreaId = searchParams?.areaId
    ? Number(searchParams.areaId)
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

  const plants = await prisma.plant.findMany({
    where: {
      ...(selectedStatusId ? { statusId: selectedStatusId } : {}),
      ...(selectedAreaId ? { areaId: selectedAreaId } : {}),
    },
    include: {
      area: true,
      category: true,
      status: true,
    },
    orderBy: {
      plantCode: "asc",
    },
  });

  return (
    <main style={{ padding: "20px", maxWidth: "900px" }}>
      <h1>Garden Manager</h1>
      <div className="home-actions">
        <Link className="link-button" href="/plants/new">
          Add New Plant
        </Link>
      </div>

      <section>
        <h2>Plants ({plants.length})</h2>

        <table className="plant-table">
          <thead>
            <tr>
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
              <th>
                <AreaFilter
                  areas={areas}
                  selectedAreaId={searchParams?.areaId || ""}
                />
              </th>
              <th></th>
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
                <td colSpan={7}>해당 조건의 Plant가 없습니다.</td>
              </tr>
            ) : (
              plants.map((plant) => (
                <tr key={plant.id}>
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
