import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";

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
  redirect("/admin/master-data#areas");
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
  redirect("/admin/master-data#areas");
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
  redirect("/admin/master-data#categories");
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
  redirect("/admin/master-data#categories");
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
  redirect("/admin/master-data#plant-status");
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
  redirect("/admin/master-data#plant-status");
}

async function addNoteType(formData: FormData) {
  "use server";

  const typeCode = String(formData.get("typeCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const displayOrder = Number(formData.get("displayOrder") || 0);

  if (!typeCode || !name) {
    return;
  }

  await prisma.noteType.create({
    data: {
      typeCode,
      name,
      description: description || null,
      displayOrder,
      isActive: true,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data#note-types");
}

async function updateNoteType(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const typeCode = String(formData.get("typeCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const displayOrder = Number(formData.get("displayOrder") || 0);

  if (!id || !typeCode || !name) {
    return;
  }

  await prisma.noteType.update({
    where: { id },
    data: {
      typeCode,
      name,
      description: description || null,
      displayOrder,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data#note-types");
}

async function toggleNoteType(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const isActive = String(formData.get("isActive")) === "true";

  if (!id) {
    return;
  }

  await prisma.noteType.update({
    where: { id },
    data: {
      isActive: !isActive,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data#note-types");
}

async function addSpecies(formData: FormData) {
  "use server";

  const commonName = String(formData.get("commonName") || "").trim();
  const scientificName = String(formData.get("scientificName") || "").trim();
  const cultivar = String(formData.get("cultivar") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!commonName || !scientificName) {
    return;
  }

  const existingSpecies = await prisma.plantSpecies.findFirst({
    where: {
      commonName,
      scientificName,
      cultivar: cultivar || null,
    },
  });

    if (existingSpecies) {
      return;
    } 
  await prisma.plantSpecies.create({
    data: {
      commonName,
      scientificName,
      cultivar: cultivar || null,
      description: description || null,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data#species");
}

async function updateSpecies(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const commonName = String(formData.get("commonName") || "").trim();
  const scientificName = String(formData.get("scientificName") || "").trim();
  const cultivar = String(formData.get("cultivar") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!id || !commonName || !scientificName) {
    return;
  }

  await prisma.plantSpecies.update({
    where: { id },
    data: {
      commonName,
      scientificName,
      cultivar: cultivar || null,
      description: description || null,
    },
  });

  revalidatePath("/admin/master-data");
  redirect("/admin/master-data#species");
}

export default async function MasterDataPage({
  searchParams,
}: {
searchParams?: {
  editArea?: string;
  editCategory?: string;
  editStatus?: string;
  editNoteType?: string;
  editSpecies?: string;
};
}) {
  const [areas, categories, statuses, noteTypes, speciesList] = await Promise.all([
    prisma.area.findMany({
      orderBy: { areaCode: "asc" },
    }),
    prisma.plantCategory.findMany({
      orderBy: { categoryCode: "asc" },
    }),
    prisma.plantStatus.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.noteType.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.plantSpecies.findMany({
      orderBy: [
        { commonName: "asc" },
        { scientificName: "asc" },
      ],
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
    const editNoteTypeId = Number(searchParams?.editNoteType || 0);

    const editingNoteType = editNoteTypeId
    ? noteTypes.find((noteType) => noteType.id === editNoteTypeId)
    : null;

    const editSpeciesId = Number(searchParams?.editSpecies || 0);

    const editingSpecies = editSpeciesId
    ? speciesList.find((species) => species.id === editSpeciesId)
    : null;

  return (
    <main style={{ padding: "20px", maxWidth: "900px" }}>
      <h1>Manage Data</h1>

      <div className="page-actions">
        <Link href="/" className="link-button secondary">
          ← Back to Home
        </Link>
      </div>

      <div className="page-actions master-data-menu">
        <a href="#areas" className="link-button secondary">
          Areas
        </a>

        <a href="#categories" className="link-button secondary">
          Categories
        </a>

        <a href="#plant-status" className="link-button secondary">
          Plant Status
        </a>

        <a href="#note-types" className="link-button secondary">
          Note Types
        </a>

        <a href="#species" className="link-button secondary">
          Species
        </a>

        <Link href="/irrigation-zones" className="link-button secondary">
          Irrigation Zones
        </Link>
      </div> 

      <section id="areas" className="detail-card">

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
                href="/admin/master-data#areas"
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
                    href={`/admin/master-data?editArea=${area.id}#areas`}
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

      <section id="categories" className="detail-card">

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
                href="/admin/master-data#categories"
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
                    href={`/admin/master-data?editCategory=${category.id}#categories`}
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
      <section id="plant-status" className="detail-card">

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
                href="/admin/master-data#plant-status"
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
                    href={`/admin/master-data?editStatus=${status.id}#plant-status`}
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
      <section id="note-types" className="detail-card">

        <form
          action={editingNoteType ? updateNoteType : addNoteType}
          className="master-data-form"
        >
          {editingNoteType && (
            <input type="hidden" name="id" value={editingNoteType.id} />
          )}

          <div className="form-row">
            <label htmlFor="noteTypeCode">Type Code</label>
            <input
              id="noteTypeCode"
              name="typeCode"
              type="text"
              required
              defaultValue={editingNoteType?.typeCode || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="noteTypeName">Type Name</label>
            <input
              id="noteTypeName"
              name="name"
              type="text"
              required
              defaultValue={editingNoteType?.name || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="noteTypeDescription">Description</label>
            <input
              id="noteTypeDescription"
              name="description"
              type="text"
              defaultValue={editingNoteType?.description || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="noteTypeDisplayOrder">Display Order</label>
            <input
              id="noteTypeDisplayOrder"
              name="displayOrder"
              type="number"
              defaultValue={editingNoteType?.displayOrder ?? 0}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="link-button">
              {editingNoteType ? "Save Note Type" : "Add Note Type"}
            </button>

            {editingNoteType && (
              <Link
                href="/admin/master-data#note-types"
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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {noteTypes.map((noteType) => (
              <tr key={noteType.id}>
                <td>{noteType.typeCode}</td>
                <td>{noteType.name}</td>
                <td>{noteType.description || "-"}</td>
                <td>{noteType.displayOrder}</td>
                <td>{noteType.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <div className="form-actions">
                    <Link
                      href={`/admin/master-data?editNoteType=${noteType.id}#note-types`}
                      className="link-button secondary"
                    >
                      Edit
                    </Link>

                    <form action={toggleNoteType}>
                      <input type="hidden" name="id" value={noteType.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={String(noteType.isActive)}
                      />

                      <button type="submit" className="link-button secondary">
                        {noteType.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            </section>

      <section id="species" className="detail-card">
        <h2>Species</h2>

        <form
          action={editingSpecies ? updateSpecies : addSpecies}
          className="master-data-form"
        >
          {editingSpecies && (
            <input type="hidden" name="id" value={editingSpecies.id} />
          )}

          <div className="form-row">
            <label htmlFor="speciesCommonName">Common Name</label>
            <input
              id="speciesCommonName"
              name="commonName"
              type="text"
              required
              defaultValue={editingSpecies?.commonName || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="speciesScientificName">Scientific Name</label>
            <input
              id="speciesScientificName"
              name="scientificName"
              type="text"
              required
              defaultValue={editingSpecies?.scientificName || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="speciesCultivar">Cultivar</label>
            <input
              id="speciesCultivar"
              name="cultivar"
              type="text"
              defaultValue={editingSpecies?.cultivar || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="speciesDescription">Description</label>
            <input
              id="speciesDescription"
              name="description"
              type="text"
              defaultValue={editingSpecies?.description || ""}
            />
          </div>

          <div className="form-actions">
          <SubmitButton
            pendingText={editingSpecies ? "Saving Species..." : "Adding Species..."}
          >
            {editingSpecies ? "Save Species" : "Add Species"}
          </SubmitButton>
            {editingSpecies && (
              <Link
                href="/admin/master-data#species"
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
              <th>Common Name</th>
              <th>Scientific Name</th>
              <th>Cultivar</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {speciesList.map((species) => (
              <tr key={species.id}>
                <td>{species.commonName}</td>
                <td>{species.scientificName}</td>
                <td>{species.cultivar || "-"}</td>
                <td>
                  <Link
                    href={`/admin/master-data?editSpecies=${species.id}#species`}
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