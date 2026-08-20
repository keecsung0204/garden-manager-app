import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";
import ConfirmDeleteButton from "@/app/components/ConfirmDeleteButton";
import ConfirmPhotoDeleteButton from "@/app/components/ConfirmPhotoDeleteButton";
import {
  uploadGardenPhoto,
  deleteGardenPhoto,
  getGardenPhotoUrl,
} from "@/lib/photoStorage";
import NotePhotoViewer from "@/app/components/NotePhotoViewer";
import PhotoInputPreview from "@/app/components/PhotoInputPreview";

function losAngelesLocalToDate(value: string) {
  const [datePart, timePart] = value.split("T");

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const localAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  function getOffset(timestamp: number) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      timeZoneName: "longOffset",
    }).formatToParts(new Date(timestamp));

    const zone = parts.find(
      (part) => part.type === "timeZoneName"
    )?.value;

    const match = zone?.match(/GMT([+-])(\d{2}):(\d{2})/);

    if (!match) {
      return 0;
    }

    const sign = match[1] === "+" ? 1 : -1;
    return sign * (Number(match[2]) * 60 + Number(match[3]));
  }

  let offsetMinutes = getOffset(localAsUtc);
  let utcTime = localAsUtc - offsetMinutes * 60_000;

  // DST 경계에서도 올바른 offset을 다시 한번 확인
  offsetMinutes = getOffset(utcTime);
  utcTime = localAsUtc - offsetMinutes * 60_000;

  return new Date(utcTime);
}
function careLevelText(level: number | null) {
  if (!level) return "-";

  const labels = [
    "Very Low",
    "Low",
    "Medium",
    "High",
    "Very High",
  ];

  return `${level} - ${labels[level - 1]}`;
}

export const dynamic = "force-dynamic";
export default async function PlantDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { addNote?: string };
}) {
  const showAddNote = searchParams?.addNote === "1";
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
      species: true,
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
  const coverPhotoUrl = coverPhoto
    ? await getGardenPhotoUrl(coverPhoto.filePath)
    : null;

  const notesWithPhotoUrls = await Promise.all(
    plant.notes.map(async (note) => ({
      ...note,
      photos: await Promise.all(
        note.photos.map(async (photo) => ({
          ...photo,
          displayUrl: await getGardenPhotoUrl(photo.filePath),
        }))
      ),
    }))
  );

  async function createNote(formData: FormData) {
    "use server";

    const noteTypeId = formData.get("noteTypeId") as string;
    const content = formData.get("content") as string;
    const noteDate = formData.get("noteDate") as string;
    const photo = formData.get("photo") as File | null;
    const photoCaption = formData.get("photoCaption") as string;

    const newNote = await prisma.plantNote.create({
      data: {
        plantId: currentPlantId,
        noteTypeId: noteTypeId ? Number(noteTypeId) : null,
        content,
        ...(noteDate
          ? { noteDate: losAngelesLocalToDate(noteDate) }
          : {}),
      },
    });

    if (photo && photo.size > 0) {
      const uploadedPhoto = await uploadGardenPhoto({
        file: photo,
        plantId: currentPlantId,
        noteId: newNote.id,
      });

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
          fileName: uploadedPhoto.fileName,
          filePath: uploadedPhoto.filePath,
          caption: photoCaption?.trim() || null,
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

    try {
      await deleteGardenPhoto(photo.filePath);
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
            src={coverPhotoUrl || coverPhoto.filePath}
            alt={coverPhoto.caption || coverPhoto.fileName}
          />
        </div>
      )}

      <div className="page-actions plant-page-actions">
        <Link className="link-button secondary" href="/">
          Home
        </Link>

        <Link className="link-button" href={`/plants/${plant.id}/edit`}>
          Edit
        </Link>

        <Link
          className="link-button"
          href={`/plants/${plant.id}?addNote=1#add-note-form`}
        >
          Add Note
        </Link>

        {plant.chatgptUrl && (
          <a
            className="link-button secondary"
            href={plant.chatgptUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open ChatGPT
          </a>
        )}
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
          <span className="detail-label">Species</span>
          <span>{plant.species?.commonName || "-"}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Scientific Name</span>
          <span>
            {plant.species?.scientificName || plant.scientificName || "-"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Cultivar</span>
          <span>{plant.species?.cultivar || "-"}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Water Need</span>
          <span>{careLevelText(plant.waterNeedLevel)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Sun Need</span>
          <span>{careLevelText(plant.sunNeedLevel)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Moisture Check Depth</span>
          <span>
            {plant.moistureCheckDepthCm != null
              ? `${plant.moistureCheckDepthCm} cm`
              : "-"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Moisture Trigger</span>
          <span>
            {plant.moistureTrigger != null
              ? plant.moistureTrigger
              : "-"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Watering Guide</span>
          <span>{plant.wateringGuide || "-"}</span>
        </div>
      </section>
      {showAddNote && (
        <form
          id="add-note-form"
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
          <div className="form-row">
            <label htmlFor="photoCaption">Photo Caption</label>
            <input
              id="photoCaption"
              name="photoCaption"
              type="text"
              placeholder="예: 6월 말 새순 상태"
            />
          </div>

          <div className="form-actions">
            <SubmitButton pendingText="Saving Note...">
              Save Note
            </SubmitButton>
            <Link
              className="link-button secondary"
              href={`/plants/${plant.id}`}
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
      <section className="detail-card">
        <h2>Recent Notes</h2>

        {notesWithPhotoUrls.length === 0 ? (
          <p>아직 기록이 없습니다.</p>
        ) : (
          <div className="note-list">
            {notesWithPhotoUrls.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-header">
                  <span className="note-type">
                    {note.noteTypeRef?.name || note.noteType || "Note"}
                  </span>

                  <div className="note-header-actions">
                    <span className="note-date">
                      {note.noteDate.toLocaleString("en-US", {
                        timeZone: "America/Los_Angeles",
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
                <div className="note-content">{note.content}</div>

                  {(note.aiQuestionSummary || note.aiAnswerSummary) && (
                    <div className="ai-summary-box">
                      {note.aiQuestionSummary && (
                        <div className="ai-summary-section">
                          <strong>AI 문의 요약</strong>
                          <div>{note.aiQuestionSummary}</div>
                        </div>
                      )}

                      {note.aiAnswerSummary && (
                        <div className="ai-summary-section">
                          <strong>AI 답변 요약</strong>
                          <div>{note.aiAnswerSummary}</div>
                        </div>
                      )}
                    </div>
                  )}

                {note.photos.length > 0 && (
                    <div className="note-photos">
                      {note.photos.map((photo) => (
                        <div key={photo.id} className="note-photo-item">
                          <NotePhotoViewer
                            filePath={photo.displayUrl}
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
                          {photo.caption && (
                            <div className="photo-caption">{photo.caption}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {note.photos.length > 0 && (
                    <Link className="ai-check-link" href={`/notes/${note.id}/ai-check`}>
                      AI 문의자료 보기
                    </Link>
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