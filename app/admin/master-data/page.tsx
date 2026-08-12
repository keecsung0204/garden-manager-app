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

async function addCategory(formData: FormData) {
  "use server";

  const categoryCode = String(formData.get("categoryCode") || "").trim();
  const name = String(formData.get("name") || "").trim();

  if (!categoryCode || !name) {
    return;
  }

  await prisma.plantCategory.create({
    data: {
      categoryCode,
      name,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data");
}

async function updateCategory(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const categoryCode = String(formData.get("categoryCode") || "").trim();
  const name = String(formData.get("name") || "").trim();

  if (!id || !categoryCode || !name) {
    return;
  }

  await prisma.plantCategory.update({
    where: { id },
    data: {
      categoryCode,
      name,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data");
}

async function addPlantStatus(formData: FormData) {
  "use server";

  const statusCode = String(formData.get("statusCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const displayOrder = Number(formData.get("displayOrder") || 0);

  if (!statusCode || !name) {
    return;
  }

  await prisma.plantStatus.create({
    data: {
      statusCode,
      name,
      description: description || null,
      displayOrder,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data");
}

async function updatePlantStatus(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const statusCode = String(formData.get("statusCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const displayOrder = Number(formData.get("displayOrder") || 0);

  if (!id || !statusCode || !name) {
    return;
  }

  await prisma.plantStatus.update({
    where: { id },
    data: {
      statusCode,
      name,
      description: description || null,
      displayOrder,
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
  editCategory?: string;
  editStatus?: string;
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

    const editCategoryId = Number(searchParams?.editCategory || 0);
    const editingCategory = editCategoryId
    ? categories.find((category) => category.id === editCategoryId)
    : null;

    const editStatusId = Number(searchParams?.editStatus || 0);
    const editingStatus = editStatusId
    ? statuses.find((status) => status.id === editStatusId)
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

        <form
            action={editingCategory ? updateCategory : addCategory}
            className="master-data-form"
        >
            {editingCategory && (
            <input type="hidden" name="id" value={editingCategory.id} />
            )}

            <div className="form-row">
            <label htmlFor="categoryCode">Category Code</label>
            <input
                id="categoryCode"
                name="categoryCode"
                type="text"
                required
                defaultValue={editingCategory?.categoryCode || ""}
            />
            </div>

            <div className="form-row">
            <label htmlFor="categoryName">Category Name</label>
            <input
                id="categoryName"
                name="name"
                type="text"
                required
                defaultValue={editingCategory?.name || ""}
            />
            </div>

            <div className="form-actions">
            <button type="submit" className="link-button">
                {editingCategory ? "Save Category" : "Add Category"}
            </button>

            {editingCategory && (
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
            {categories.map((category) => (
                <tr key={category.id}>
                <td>{category.categoryCode}</td>
                <td>{category.name}</td>
                <td>
                    <Link
                    href={`/admin/master-data?editCategory=${category.id}`}
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
        <h2>Plant Status</h2>

        <form
          action={editingStatus ? updatePlantStatus : addPlantStatus}
          className="master-data-form"
        >
          {editingStatus && (
            <input type="hidden" name="id" value={editingStatus.id} />
          )}

          <div className="form-row">
            <label htmlFor="statusCode">Status Code</label>
            <input
              id="statusCode"
              name="statusCode"
              type="text"
              required
              defaultValue={editingStatus?.statusCode || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="statusName">Status Name</label>
            <input
              id="statusName"
              name="name"
              type="text"
              required
              defaultValue={editingStatus?.name || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="statusDescription">Description</label>
            <input
              id="statusDescription"
              name="description"
              type="text"
              defaultValue={editingStatus?.description || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="displayOrder">Display Order</label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              defaultValue={editingStatus?.displayOrder ?? 0}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="link-button">
              {editingStatus ? "Save Status" : "Add Status"}
            </button>

            {editingStatus && (
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
              <th>Description</th>
              <th>Order</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {statuses.map((status) => (
              <tr key={status.id}>
                <td>{status.statusCode}</td>
                <td>{status.name}</td>
                <td>{status.description || "-"}</td>
                <td>{status.displayOrder}</td>
                <td>
                  <Link
                    href={`/admin/master-data?editStatus=${status.id}`}
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
    </main>
  );
}