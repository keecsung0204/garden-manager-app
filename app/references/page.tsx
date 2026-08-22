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

export default async function ReferencesPage() {
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

        <form action={addReference} className="form-grid">
          <div className="form-row">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>

          <div className="form-row">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              placeholder="Layout, Irrigation, Manual..."
            />
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <label htmlFor="url">URL</label>

            <input
                id="url"
                name="url"
                type="url"
                placeholder="https://..."
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
              defaultValue="0"
            />
          </div>

          <div className="form-actions">
            <button type="submit">Add Reference</button>
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