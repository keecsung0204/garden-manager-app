import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function addArea(formData: FormData) {
  "use server";

  const areaCode = String(formData.get("areaCode") || "").trim();
  const name = String(formData.get("name") || "").trim();

  if (!areaCode || !name) {
    return;
  }

  await prisma.area.create({
    data: {
      areaCode,
      name,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data");
}

async function updateArea(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const areaCode = String(formData.get("areaCode") || "").trim();
  const name = String(formData.get("name") || "").trim();

  if (!id || !areaCode || !name) {
    return;
  }

  await prisma.area.update({
    where: { id },
    data: {
      areaCode,
      name,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data");
}

export default async function MasterDataPage({
  searchParams,
}: {
  searchParams?: {
    editArea?: string;
  };
}) {
  const [areas, categories, statuses] = await Promise.all([
    prisma.area.findMany({
      orderBy: { areaCode: "asc" },
    }),
    prisma.plantCategory.findMany({
      orderBy: { categoryCode: "asc" },
    }),
    prisma.plantStatus.findMany({
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  const editAreaId = Number(searchParams?.editArea || 0);
  const editingArea = editAreaId
    ? areas.find((area) => area.id === editAreaId)
    : null;

  return (
    <main style={{ padding: "20px", maxWidth: "900px" }}>
      <h1>Manage Data</h1>

      <div className="page-actions">
        <Link href="/" className="link-button secondary">
          ← Back to Home
        </Link>

        <Link href="/irrigation-zones" className="link-button">
          Irrigation Zones
        </Link>
      </div>

      <section className="detail-card">
        <h2>Areas</h2>

        <form
          action={editingArea ? updateArea : addArea}
          className="master-data-form"
        >
          {editingArea && (
            <input type="hidden" name="id" value={editingArea.id} />
          )}

          <div className="form-row">
            <label htmlFor="areaCode">Area Code</label>
            <input
              id="areaCode"
              name="areaCode"
              type="text"
              required
              defaultValue={editingArea?.areaCode || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="areaName">Area Name</label>
            <input
              id="areaName"
              name="name"
              type="text"
              required
              defaultValue={editingArea?.name || ""}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="link-button">
              {editingArea ? "Save Area" : "Add Area"}
            </button>

            {editingArea && (
              <Link
                href="/admin/master-data"
                className="link-button secondary"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {areas.map((area) => (
              <tr key={area.id}>
                <td>{area.areaCode}</td>
                <td>{area.name}</td>
                <td>
                  <Link
                    href={`/admin/master-data?editArea=${area.id}`}
                    className="link-button secondary"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="detail-card">
        <h2>Categories</h2>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.categoryCode}</td>
                <td>{category.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="detail-card">
        <h2>Plant Status</h2>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {statuses.map((status) => (
              <tr key={status.id}>
                <td>{status.statusCode}</td>
                <td>{status.name}</td>
                <td>{status.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}