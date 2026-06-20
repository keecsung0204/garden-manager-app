import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {

  const plants = await prisma.plant.findMany({
    orderBy: {
      plantCode: "asc",
    },
    include: {
      area: true,
      category: true,
      status: true,
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

        {plants.length === 0 ? (
          <p>등록된 Plant가 없습니다.</p>
        ) : (
          <table className="plant-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Plant Name</th>
                <th>Area</th>
                <th>Category</th>
                <th>Identify</th>
                <th>Status</th>
                <th>Scientific Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((plant) => (
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
                  <td>{plant.scientificName || "-"}</td>
                  <td className="action-links">

                    <Link
                      className="link-button secondary"
                      href={`/plants/${plant.id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
