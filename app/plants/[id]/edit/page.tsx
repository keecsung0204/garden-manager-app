import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function EditPlantPage({
  params,
}: {
  params: { id: string };
}) {
  const plantId = Number(params.id);

  const areas = await prisma.area.findMany({
    orderBy: {
      areaCode: "asc",
    },
  });

  const plant = await prisma.plant.findUnique({
    where: {
      id: plantId,
    },
    include: {
      area: true,
      category: true,
      status: true,
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

  return (
    <main className="edit-page">
      <h1>Edit Plant</h1>

      <section className="detail-card">
        <div className="detail-row">
          <span className="detail-label">Code</span>
          <span>{plant.plantCode}</span>
        </div>

        <div className="detail-row">
          <label className="detail-label" htmlFor="plantName">
            Plant Name
          </label>
          <input
            id="plantName"
            name="plantName"
            defaultValue={plant.plantName}
            required
          />
        </div>

        <div className="detail-row">
          <label className="detail-label" htmlFor="areaId">
            Area
          </label>

          <select
            id="areaId"
            name="areaId"
            defaultValue={plant.areaId || ""}
          >
            <option value="">장소 선택</option>

            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.areaCode} - {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-row">
          <span className="detail-label">Category</span>
          <span>
            {plant.category
              ? `${plant.category.categoryCode} - ${plant.category.name}`
              : "-"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span>{plant.status?.name || "-"}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Identify Status</span>
          <span>{plant.identifyStatus}</span>
        </div>
      </section>

      <Link className="back-link" href="/">
        ← Back to Home
      </Link>
    </main>
  );

}