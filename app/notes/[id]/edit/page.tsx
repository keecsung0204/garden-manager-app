import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";

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

    async function updateNote(formData: FormData) {
        "use server";

        const noteTypeId = formData.get("noteTypeId") as string;
        const content = formData.get("content") as string;

        await prisma.plantNote.update({
            where: {
                id: noteId,
            },
            data: {
                noteTypeId: noteTypeId ? Number(noteTypeId) : null,
                content,
            },
        });

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

                    <div className="form-actions">
                        <SubmitButton pendingText="Saving Note...">Save Note</SubmitButton>
                    </div>
                </form>
            </section>
        </main>
    );
}