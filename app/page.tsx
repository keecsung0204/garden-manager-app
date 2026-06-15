import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function getNextPlantCode() {
  const lastPlant = await prisma.plant.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  if (!lastPlant) {
    return "P001";
  }

  const lastNumber = Number(lastPlant.plantCode.replace("P", ""));
  const nextNumber = Number.isNaN(lastNumber) ? lastPlant.id + 1 : lastNumber + 1;

  return `P${String(nextNumber).padStart(3, "0")}`;
}

export default async function Home() {
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

  const nextPlantCode = await getNextPlantCode();

  async function createPlant(formData: FormData) {
    "use server";

    const plantCode = formData.get("plantCode")?.toString().trim();
    const plantName = formData.get("plantName")?.toString().trim();
    const areaId = formData.get("areaId")?.toString();
    const categoryId = formData.get("categoryId")?.toString();
    const identifyStatus = formData.get("identifyStatus")?.toString();
    const statusId = formData.get("statusId")?.toString();
    const scientificName = formData.get("scientificName")?.toString().trim();

    if (!plantCode || !plantName) {
      return;
    }

    await prisma.plant.create({
      data: {
        plantCode,
        plantName,
        areaId: areaId ? Number(areaId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        identifyStatus: (identifyStatus || "Unknown") as "Unknown" | "Tentative" | "Confirmed",
        statusId: statusId ? Number(statusId) : null,
        scientificName: scientificName || null,
      },
    });

    revalidatePath("/");
  }

  return (
    <main style={{ padding: "20px", maxWidth: "900px" }}>
      <h1>Garden Manager</h1>

      <section style={{ marginBottom: "40px" }}>
        <h2>Add Plant</h2>

        <form action={createPlant}>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Plant Code:
              <br />
              <input name="plantCode" defaultValue={nextPlantCode} />
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              Plant Name:
              <br />
              <input name="plantName" required />
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              Area:
              <br />
              <select name="areaId" required defaultValue="">
                <option value="">장소 선택</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.areaCode} - {area.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              Category:
              <br />
              <select name="categoryId" required defaultValue="">
                <option value="">분류 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryCode} - {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              Identify Status:
              <br />
              <select name="identifyStatus" defaultValue="Unknown">
                <option value="Unknown">Unknown</option>
                <option value="Tentative">Tentative</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              Plant Status:
              <br />
              <select name="statusId" required defaultValue="">
                <option value="">상태 선택</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.statusCode} - {status.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>
              Scientific Name:
              <br />
              <input name="scientificName" />
            </label>
          </div>

          <button type="submit">Save Plant</button>
        </form>
      </section>

      {/* <section>
        <h2>Plants</h2>

        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Plant Name</th>
              <th>Area</th>
              <th>Category</th>
              <th>Identify</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant.id}>
                <td>{plant.plantCode}</td>
                <td>{plant.plantName}</td>
                <td>{plant.area?.name}</td>
                <td>{plant.category?.name}</td>
                <td>{plant.identifyStatus}</td>
                <td>{plant.status?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section> */}
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
                  <td>{plant.plantName}</td>
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
                      className={`status-pill status-${
                        plant.status?.name?.toLowerCase() || "none"
                      }`}
                    >
                      {plant.status?.name || "-"}
                    </span>
                  </td>
                  <td>{plant.scientificName || "-"}</td>
                  <td>
                    <Link href={`/plants/${plant.id}/edit`}>Edit</Link>
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