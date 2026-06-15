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
            id="areaId" name="areaId" defaultValue={plant.areaId || ""}>
            <option value="">장소 선택</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}> {area.areaCode} - {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-row">
          <label className="detail-label" htmlFor="categoryId">
            Category
          </label>

          <select
            id="categoryId" name="categoryId" defaultValue={plant.categoryId || ""}>
            <option value=""> 분류 선택</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}> {category.categoryCode} - {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-row">
          <label className="detail-label" htmlFor="statusId">
            Plant Status:
          </label>

          <select
            id="statusId" name="statusId" defaultValue={plant.statusId || ""}>
            <option value=""> 상태 선택</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}> {status.statusCode} - {status.name}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-row">
          <label className="detail-label" htmlFor="identifyStatus">
            Identify Status
          </label>
          <select
            id="identifyStatus"
            name="identifyStatus"
            defaultValue={plant.identifyStatus}
          >
            <option value="Unknown">Unknown</option>
            <option value="Tentative">Tentative</option>
            <option value="Confirmed">Confirmed</option>
          </select>

        </div>

        <div className="detail-row">
          <label className="detail-label" htmlFor="scientificName">
            Scientific Name
          </label>
          <input
            id="scientificName"
            name="scientificName"
            defaultValue={plant.scientificName || ""}
          />
        </div>

      </section>

      <Link className="back-link" href="/">
        ← Back to Home
      </Link>
    </main>
  );

}