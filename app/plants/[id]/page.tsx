import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";

export default async function PlantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const plantId = Number(params.id);
  const noteTypes = await prisma.noteType.findMany({
    where: {
      isActive: true,
    },
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
      notes: {
        orderBy: {
          noteDate: "desc",
        },
        include: {
          noteTypeRef: true,
        },
      },
    },
  });

  if (!plant) {
    return (
      <main className="edit-page">
        <h1>Plant Not Found</h1>
        <Link className="back-link" href="/">
          ← Back to Home
        </Link>
      </main>
    );
  }

  const currentPlantId = plant.id;

  async function createNote(formData: FormData) {
    "use server";

    const noteTypeId = formData.get("noteTypeId") as string;
    const content = formData.get("content") as string;

    await prisma.plantNote.create({
      data: {
        plantId: currentPlantId,
        noteTypeId: noteTypeId ? Number(noteTypeId) : null,
        content,
      },
    });

    revalidatePath(`/plants/${currentPlantId}`);
    redirect(`/plants/${currentPlantId}`);
  }
  async function createNote(formData: FormData) {
    "use server";

    const noteTypeId = formData.get("noteTypeId") as string;
    const content = formData.get("content") as string;

    await prisma.plantNote.create({
      data: {
        plantId: plant.id,
        noteTypeId: noteTypeId ? Number(noteTypeId) : null,
        content,
      },
    });

    revalidatePath(`/plants/${plant.id}`);
    redirect(`/plants/${plant.id}`);
  }
  return (
    <main className="edit-page">
      <h1>{plant.plantName}</h1>

      <section className="detail-card">
        <h2>Plant Detail</h2>

        <div className="detail-row">
          <span className="detail-label">Code</span>
          <span>{plant.plantCode}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Area</span>
          <span>
            {plant.area ? `${plant.area.areaCode} - ${plant.area.name}` : "-"}
          </span>
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

        <div className="detail-row">
          <span className="detail-label">Scientific Name</span>
          <span>{plant.scientificName || "-"}</span>
        </div>
      </section>

      <form
        key={plant.notes.length}
        className="detail-card"
        action={createNote}
      >
        <h2>Add Note</h2>

        <div className="detail-row">
          <label className="detail-label" htmlFor="noteTypeId">
            Note Type
          </label>

          <select id="noteTypeId" name="noteTypeId" defaultValue="">
            <option value="">Note Type 선택</option>

            {noteTypes.map((noteType) => (
              <option key={noteType.id} value={noteType.id}>
                {noteType.name} - {noteType.description}
              </option>
            ))}
          </select>
        </div>

        <div className="detail-row">
          <label className="detail-label" htmlFor="content">
            Content
          </label>

          <textarea id="content" name="content" rows={4} required />
        </div>

        <div className="form-actions">
          <SubmitButton pendingText="Saving Note...">Save Note</SubmitButton>
        </div>
      </form>

      <section className="detail-card">
        <h2>Recent Notes</h2>

        {plant.notes.length === 0 ? (
          <p>아직 기록이 없습니다.</p>
        ) : (
          <div className="note-list">
            {plant.notes.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-header">
                  <span className="note-type">
                    {note.noteTypeRef?.name || note.noteType || "Note"}
                  </span>
                  <span className="note-date">
                    {note.noteDate.toLocaleString()}
                  </span>
                </div>

                <p className="note-content">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="page-actions">
        <Link className="link-button secondary" href="/">
          ← Back to Home
        </Link>

        <Link className="link-button" href={`/plants/${plant.id}/edit`}>
          Edit Plant
        </Link>
      </div>
    </main>
  );
}