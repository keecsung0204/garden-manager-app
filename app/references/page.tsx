import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function addReference(formData: FormData) {
  "use server";

  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const url = formData.get("url")?.toString().trim();
  const sortOrder = formData.get("sortOrder")?.toString();

  if (!title) return;

  await prisma.gardenReference.create({
    data: {
      title,
      category: category || null,
      description: description || null,
      url: url || null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      isActive: true,
    },
  });

  revalidatePath("/references");
}

async function updateReference(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const url = formData.get("url")?.toString().trim();
  const sortOrder = formData.get("sortOrder")?.toString();

  if (!id || !title) return;

  await prisma.gardenReference.update({
    where: {
      id,
    },
    data: {
      title,
      category: category || null,
      description: description || null,
      url: url || null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    },
  });

  revalidatePath("/references");
}

async function deactivateReference(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!id) return;

  await prisma.gardenReference.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/references");
}

export default async function ReferencesPage({
  searchParams,
}: {
  searchParams?: { edit?: string };
}) {
  const editingId = searchParams?.edit
    ? Number(searchParams.edit)
    : null;

  const editingReference = editingId
    ? await prisma.gardenReference.findUnique({
        where: { id: editingId },
      })
    : null;
  const references = await prisma.gardenReference.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        title: "asc",
      },
    ],
  });

  return (
    <main className="edit-page">
      <section className="detail-card">
        <h2>Reference Materials</h2>

        <form
          action={editingReference ? updateReference : addReference}
          className="form-grid"
        >
          {editingReference && (
            <input
              type="hidden"
              name="id"
              value={editingReference.id}
            />
          )}
          <div className="form-row">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              required
              defaultValue={editingReference?.title || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              placeholder="Layout, Irrigation, Manual..."
              defaultValue={editingReference?.category || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={editingReference?.description || ""}
            />
          </div>

          <div className="form-row">
            <label htmlFor="url">URL</label>

            <input
                id="url"
                name="url"
                type="url"
                placeholder="https://..."
                defaultValue={editingReference?.url || ""}
            />

            <a
                href="https://drive.google.com/drive/my-drive"
                target="_blank"
                rel="noopener noreferrer"
                className="link-button secondary"
            >
                Open Google Drive
            </a>
          </div>

          <div className="form-row">
            <label htmlFor="sortOrder">Sort Order</label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={editingReference?.sortOrder ?? 0}
            />
          </div>

          <div className="form-actions">
            <button type="submit">
            {editingReference ? "Save Reference" : "Add Reference"}
          </button>
          </div>
        </form>
      </section>

      <section className="detail-card">
        <h2>Saved References</h2>

        {references.length === 0 ? (
          <p>아직 등록된 참고자료가 없습니다.</p>
        ) : (
          <div>
            {references.map((item) => (
              <div className="detail-row" key={item.id}>
                <span className="detail-label">
                  {item.category || "Reference"}
                </span>

                <span>
                  <strong>{item.title}</strong>

                  {item.description && (
                    <>
                      <br />
                      {item.description}
                    </>
                  )}

                  {item.url && (
                    <>
                      <br />
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </a>
                      <br />

                      <a
                        href={`/references?edit=${item.id}`}
                        className="link-button secondary"
                      >
                        Edit
                      </a>

                      <form
                        action={deactivateReference}
                        style={{ display: "inline" }}
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={item.id}
                        />

                        <button
                          type="submit"
                          className="link-button secondary"
                        >
                          Inactive
                        </button>
                      </form>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}