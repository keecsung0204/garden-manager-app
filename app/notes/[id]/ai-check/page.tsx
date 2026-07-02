import prisma from "@/lib/prisma";
import Link from "next/link";
import CopyButton from "@/app/components/CopyButton";

export default async function AiCheckPage({
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
            noteTypeRef: true,
            photos: {
                orderBy: {
                    createdAt: "desc",
                },
            },
            plant: {
                include: {
                    area: true,
                    category: true,
                    status: true,
                },
            },
        },
    });

    if (!note) {
        return (
            <main className="edit-page">
                <h1>AI 문의자료 없음</h1>
                <p>해당 Note를 찾을 수 없습니다.</p>
                <Link className="back-link" href="/">
                    ← Back to Home
                </Link>
            </main>
        );
    }

    const questionText = `이 식물의 이름과 상태를 추정해 주세요.

위치: Southern California, La Mirada 근처 집 정원
Area: ${note.plant.area?.name || "미지정"}
현재 Plant Name: ${note.plant.plantName}
Category: ${note.plant.category?.name || "미지정"}
Status: ${note.plant.status?.name || "미지정"}
Note Type: ${note.noteTypeRef?.name || note.noteType || "Note"}
촬영/기록 날짜: ${note.noteDate.toLocaleString()}

관찰 내용:
${note.content}

사진 설명:
${note.photos
            .map((photo, index) => `${index + 1}. ${photo.caption || photo.fileName}`)
            .join("\n")}

알고 싶은 것:
- 가능한 식물 이름 후보
- 확신도
- 확인해야 할 특징
- 병충해 또는 물 부족/과습 가능성
- 관리 방법

확실하지 않으면 확실하지 않다고 말해 주세요.`;

    return (
        <main className="edit-page">
            <h1>AI 문의자료</h1>

            <div className="page-actions">
                <Link className="link-button secondary" href={`/plants/${note.plantId}`}>
                    ← Back to Plant
                </Link>

                <Link className="link-button secondary" href={`/notes/${note.id}/edit`}>
                    Edit Note
                </Link>
            </div>

            <section className="detail-card ai-check-card">
                <h2>기본 정보</h2>

                <div className="detail-row">
                    <span className="detail-label">Plant</span>
                    <span>{note.plant.plantName}</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Area</span>
                    <span>{note.plant.area?.name || "미지정"}</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Category</span>
                    <span>{note.plant.category?.name || "미지정"}</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span>{note.plant.status?.name || "미지정"}</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Note Type</span>
                    <span>{note.noteTypeRef?.name || note.noteType || "Note"}</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span>
                        {note.noteDate.toLocaleString([], {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
            </section>

            <section className="detail-card ai-check-card">
                <h2>관찰 내용</h2>
                <p className="note-content">{note.content}</p>
            </section>

            {note.photos.length > 0 && (
                <section className="detail-card ai-check-card">
                    <h2>사진</h2>

                    <div className="note-photos">
                        {note.photos.map((photo) => (
                            <div key={photo.id} className="note-photo-item">
                                <img
                                    className="note-photo"
                                    src={photo.filePath}
                                    alt={photo.caption || photo.fileName}
                                />

                                {photo.caption && (
                                    <div className="photo-caption">{photo.caption}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="detail-card ai-check-card">
                <h2>사진 촬영 체크</h2>

                <div className="ai-check-list">
                    <div>□ 식물 전체 모습</div>
                    <div>□ 잎 가까이</div>
                    <div>□ 줄기 / 가지</div>
                    <div>□ 꽃 또는 열매</div>
                    <div>□ 주변 환경</div>
                </div>
            </section>

            <section className="detail-card ai-check-card">
                <h2>AI에게 보낼 질문</h2>

                <p>
                    아래 내용을 복사해서 ChatGPT에게 사진과 함께 질문하면 됩니다.
                </p>

                <div className="ai-question-box">
                    <div className="ai-question-copy-row">
                        <CopyButton text={questionText} />
                    </div>

                    <pre className="ai-question-text">{questionText}</pre>
                </div>
            </section>
        </main>
    );
}