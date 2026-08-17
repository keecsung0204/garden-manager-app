import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";
import PhotoInputPreview from "@/app/components/PhotoInputPreview";
import { uploadGardenPhoto, getGardenPhotoUrl } from "@/lib/photoStorage";

export default async function EditNotePage({
    params,
}: {
    params: { id: string };
}) {
    const noteId = Number(params.id);

    const note = await prisma.plantNote.findUnique({
        where: {
            id: noteId,
        },
        include: {
            plant: true,
            noteTypeRef: true,
            photos: {
                orderBy: {
                    createdAt: "desc",
                },
            },
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

    if (!note) {
        return (
            <main className="edit-page">
                <h1>Note Not Found</h1>

                <Link className="link-button secondary" href="/">
                    ← Back to Home
                </Link>
            </main>
        );
    }

    const plantId = note.plantId;
    const photoDisplayItems = await Promise.all(
        note.photos.map(async (photo) => ({
            ...photo,
            displayUrl: await getGardenPhotoUrl(photo.filePath),
        }))
    );

    async function updateNote(formData: FormData) {
        "use server";

        const noteTypeId = formData.get("noteTypeId") as string;
        const content = formData.get("content") as string;
        const aiQuestionSummary = formData.get("aiQuestionSummary") as string;
        const aiAnswerSummary = formData.get("aiAnswerSummary") as string;
        const photo = formData.get("photo") as File | null;
        const newPhotoCaption = formData.get("newPhotoCaption") as string;

        await prisma.plantNote.update({
            where: {
                id: noteId,
            },
            data: {
                noteTypeId: noteTypeId ? Number(noteTypeId) : null,
                content,
                aiQuestionSummary: aiQuestionSummary?.trim() || null,
                aiAnswerSummary: aiAnswerSummary?.trim() || null,
            },
        });
        const photos = await prisma.plantPhoto.findMany({
            where: {
                noteId,
            },
        });

        await Promise.all(
            photos.map((photo) =>
                prisma.plantPhoto.update({
                    where: {
                        id: photo.id,
                    },
                    data: {
                        caption:
                            (formData.get(`photoCaption-${photo.id}`) as string)?.trim() ||
                            null,
                    },
                })
            )
        );
        if (photo && photo.size > 0) {
            const uploadedPhoto = await uploadGardenPhoto({
                file: photo,
                plantId,
                noteId,
            });
            await prisma.plantPhoto.create({
                data: {
                    plantId,
                    noteId,
                    fileName: uploadedPhoto.fileName,
                    filePath: uploadedPhoto.filePath,
                    caption: newPhotoCaption?.trim() || null,
                },
            });
        }
        revalidatePath(`/plants/${plantId}`);
        redirect(`/plants/${plantId}`);
    }

    return (
        <main className="edit-page">
            <h1>Edit Note</h1>

            <div className="page-actions">
                <Link className="link-button secondary" href={`/plants/${plantId}`}>
                    ← Back to Plant
                </Link>
            </div>

            <section className="detail-card">
                <h2>{note.plant.plantName}</h2>

                <form className="add-note-form" action={updateNote}>
                    <div className="form-row">
                        <label htmlFor="noteTypeId">Note Type</label>

                        <select
                            id="noteTypeId"
                            name="noteTypeId"
                            defaultValue={note.noteTypeId ? String(note.noteTypeId) : ""}
                        >
                            <option value="">Note Type 선택</option>

                            {noteTypes.map((noteType) => (
                                <option key={noteType.id} value={noteType.id}>
                                    {noteType.name} - {noteType.description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="content">Content</label>

                        <textarea
                            id="content"
                            name="content"
                            rows={5}
                            required
                            defaultValue={note.content}
                        />
                    </div>

                    {(note.aiQuestionSummary || note.aiAnswerSummary) && (
                <>
                    <div className="form-row">
                        <label htmlFor="aiQuestionSummary">AI 문의 요약</label>
                        <textarea
                            id="aiQuestionSummary"
                            name="aiQuestionSummary"
                            rows={5}
                            defaultValue={note.aiQuestionSummary || ""}
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="aiAnswerSummary">AI 답변 요약</label>
                        <textarea
                            id="aiAnswerSummary"
                            name="aiAnswerSummary"
                            rows={5}
                            defaultValue={note.aiAnswerSummary || ""}
                        />
                    </div>
                </>
            )}
                    {photoDisplayItems.length > 0 && (
                        <div className="form-row existing-photos-row">
                            <label>Existing Photos</label>

                            <div className="note-photos">
                                {photoDisplayItems.map((photo) => (
                                    <div key={photo.id} className="note-photo-item">
                                        <img
                                            className="note-photo"
                                            src={photo.displayUrl}
                                            alt={photo.caption || photo.fileName}
                                        />

                                        <label
                                            className="photo-caption-edit-label"
                                            htmlFor={`photoCaption-${photo.id}`}
                                        >
                                            Caption
                                        </label>

                                        <input
                                            id={`photoCaption-${photo.id}`}
                                            name={`photoCaption-${photo.id}`}
                                            type="text"
                                            defaultValue={photo.caption || ""}
                                            className="photo-caption-input"
                                            placeholder="사진 설명"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <PhotoInputPreview />

                    <div className="form-row">
                        <label htmlFor="newPhotoCaption">Photo Caption</label>
                        <input
                            id="newPhotoCaption"
                            name="newPhotoCaption"
                            type="text"
                            placeholder="예: 6월 말 새순 상태"
                        />
                    </div>
                    <div className="form-actions">
                        <SubmitButton pendingText="Saving Note...">Save Note</SubmitButton>
                    </div>
                </form>
            </section>
        </main >
    );
}