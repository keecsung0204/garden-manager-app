import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";
import ConfirmDeleteButton from "@/app/components/ConfirmDeleteButton";

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
      <main style={{ padding: "20px" }}>
        <h1>Plant Not Found</h1>
        <Link href="/">Back to Home</Link>
      </main>
    );
  }
  async function updatePlant(formData: FormData) {
    "use server";

    const plantName = formData.get("plantName") as string;
    const areaId = formData.get("areaId") as string;
    const categoryId = formData.get("categoryId") as string;
    const statusId = formData.get("statusId") as string;
    const identifyStatus = formData.get("identifyStatus") as
      | "Unknown"
      | "Tentative"
      | "Confirmed";
    const scientificName = formData.get("scientificName") as string;
    const currentPlantId = Number(params.id);

    await prisma.plant.update({
      where: {
        id: currentPlantId,
      },
      data: {
        plantName,
        areaId: areaId ? Number(areaId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        statusId: statusId ? Number(statusId) : null,
        identifyStatus,
        scientificName: scientificName || null,
      },
    });

    revalidatePath("/");
    revalidatePath(`/plants/${plant.id}/edit`);

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

    revalidatePath(`/plants/${plant.id}/edit`);
    redirect(`/plants/${plant.id}/edit`);
  }

  async function deleteNote(formData: FormData) {
    "use server";

    const noteId = formData.get("noteId") as string;

    await prisma.plantNote.delete({
      where: {
        id: Number(noteId),
      },
    });

    revalidatePath(`/plants/${plant.id}/edit`);
    redirect(`/plants/${plant.id}/edit`);
  }

  return (
    <main className="edit-page">
      <h1>Edit Plant</h1>

      <form className="detail-card" action={updatePlant}>
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
        <div className="form-actions">
          <button type="submit">Save Changes</button>
        </div>
      </form>

      <form
        key={plant.notes.length}
        className="detail-card"
        action={createNote}
      >
        <h2>Add Note</h2>

        <div className="detail-row">
          <label className="detail-label" htmlFor="noteType">
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

          <textarea
            id="content"
            name="content"
            rows={4}
            required
          />
        </div>

        <div className="form-actions">
          <SubmitButton pendingText="Saving Note...">Save Note</SubmitButton>
        </div>
      </form>

      <section className="detail-card">
        <h2>Notes</h2>

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

                <form action={deleteNote} className="note-delete-form">
                  <input type="hidden" name="noteId" value={note.id} />
                  <ConfirmDeleteButton />
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
      <Link className="back-link" href={`/plants/${plant.id}`}>
        ← Back to Detail
      </Link>
    </main>
  );

}