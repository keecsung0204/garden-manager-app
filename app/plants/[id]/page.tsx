import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";
import ConfirmDeleteButton from "@/app/components/ConfirmDeleteButton";
import ConfirmPhotoDeleteButton from "@/app/components/ConfirmPhotoDeleteButton";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import NotePhotoViewer from "@/app/components/NotePhotoViewer";
import PhotoInputPreview from "@/app/components/PhotoInputPreview";


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
      photos: {
        orderBy: [
          {
            isCover: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        take: 1,
      },
      notes: {
        orderBy: {
          noteDate: "desc",
        },
        include: {
          noteTypeRef: true,
          photos: true,
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
  const coverPhoto = plant.photos[0];

  async function createNote(formData: FormData) {
    "use server";

    const noteTypeId = formData.get("noteTypeId") as string;
    const content = formData.get("content") as string;
    const noteDate = formData.get("noteDate") as string;
    const photo = formData.get("photo") as File | null;

    const newNote = await prisma.plantNote.create({
      data: {
        plantId: currentPlantId,
        noteTypeId: noteTypeId ? Number(noteTypeId) : null,
        content,
        ...(noteDate ? { noteDate: new Date(noteDate) } : {}),
      },
    });

    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${photo.name}`;
      const filePath = `/uploads/${fileName}`;
      const savePath = path.join(process.cwd(), "public", "uploads", fileName);

      await writeFile(savePath, buffer);

      const existingCoverPhoto = await prisma.plantPhoto.findFirst({
        where: {
          plantId: currentPlantId,
          isCover: true,
        },
      });

      await prisma.plantPhoto.create({
        data: {
          plantId: currentPlantId,
          noteId: newNote.id,
          fileName: photo.name,
          filePath,
          isCover: !existingCoverPhoto,
        },
      });
    }

    revalidatePath(`/plants/${currentPlantId}`);
    redirect(`/plants/${currentPlantId}`);
  }
  async function deletePhoto(formData: FormData) {
    "use server";

    const photoId = Number(formData.get("photoId"));

    const photo = await prisma.plantPhoto.findUnique({
      where: {
        id: photoId,
      },
    });

    if (!photo) {
      return;
    }

    await prisma.plantPhoto.delete({
      where: {
        id: photoId,
      },
    });

    const relativePath = photo.filePath.replace(/^\/+/, "");
    const fullPath = path.join(process.cwd(), "public", relativePath);

    try {
      await unlink(fullPath);
    } catch {
      // 파일이 이미 없어도 DB 삭제는 성공으로 처리합니다.
    }

    revalidatePath(`/plants/${currentPlantId}`);
    redirect(`/plants/${currentPlantId}`);
  }

  async function setCoverPhoto(formData: FormData) {
    "use server";

    const photoId = Number(formData.get("photoId"));

    const photo = await prisma.plantPhoto.findUnique({
      where: {
        id: photoId,
      },
    });

    if (!photo) {
      return;
    }

    await prisma.plantPhoto.updateMany({
      where: {
        plantId: photo.plantId,
      },
      data: {
        isCover: false,
      },
    });

    await prisma.plantPhoto.update({
      where: {
        id: photoId,
      },
      data: {
        isCover: true,
      },
    });

    revalidatePath(`/plants/${currentPlantId}`);
    redirect(`/plants/${currentPlantId}`);
  }

  async function deleteNote(formData: FormData) {
    "use server";

    const noteId = formData.get("noteId") as string;

    await prisma.plantNote.delete({
      where: {
        id: Number(noteId),
      },
    });

    revalidatePath(`/plants/${currentPlantId}`);
    redirect(`/plants/${currentPlantId}`);
  }
  return (
    <main className="edit-page">
      <h1>{plant.plantName}</h1>

      {coverPhoto && (
        <div className="plant-cover-photo">
          <img
            src={coverPhoto.filePath}
            alt={coverPhoto.caption || coverPhoto.fileName}
          />
        </div>
      )}

      <div className="page-actions">
        <Link className="link-button secondary" href="/">
          ← Back to Home
        </Link>

        <Link className="link-button" href={`/plants/${plant.id}/edit`}>
          Edit Plant
        </Link>
      </div>

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
        className="detail-card add-note-form"
        action={createNote}
      >
        <h2>Add Note</h2>

        <div className="form-row">
          <label htmlFor="noteDate">Note Date</label>

          <input
            id="noteDate"
            name="noteDate"
            type="datetime-local"
          />
        </div>

        <div className="form-row">
          <label htmlFor="noteTypeId">
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

        <div className="form-row">
          <label htmlFor="content">
            Content
          </label>

          <textarea id="content" name="content" rows={4} required />
        </div>

        <PhotoInputPreview />

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

                  <div className="note-header-actions">
                    <span className="note-date">
                      {note.noteDate.toLocaleString([], {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>

                    <Link className="link-button secondary" href={`/notes/${note.id}/edit`}>
                      Edit
                    </Link>

                    <form action={deleteNote} className="note-delete-form">
                      <input type="hidden" name="noteId" value={note.id} />
                      <ConfirmDeleteButton />
                    </form>
                  </div>
                </div>

                <div className="note-body">
                  <p className="note-content">{note.content}</p>
                  {note.photos.length > 0 && (
                    <div className="note-photos">
                      {note.photos.map((photo) => (
                        <div key={photo.id} className="note-photo-item">
                          <NotePhotoViewer
                            filePath={photo.filePath}
                            altText={photo.caption || photo.fileName}
                          />

                          <div className="photo-actions-row">
                            <div className="photo-action-left">
                              {photo.isCover ? (
                                <div className="photo-cover-label">Cover</div>
                              ) : (
                                <form action={setCoverPhoto} className="photo-cover-form">
                                  <input type="hidden" name="photoId" value={photo.id} />
                                  <button type="submit" className="photo-cover-button">
                                    Set
                                  </button>
                                </form>
                              )}
                            </div>

                            <div className="photo-action-right">
                              <form action={deletePhoto} className="photo-delete-form">
                                <input type="hidden" name="photoId" value={photo.id} />
                                <ConfirmPhotoDeleteButton />
                              </form>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}