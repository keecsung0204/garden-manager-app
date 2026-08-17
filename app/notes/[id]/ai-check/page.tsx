import prisma from "@/lib/prisma";
import Link from "next/link";
import CopyButton from "@/app/components/CopyButton";
import { getGardenPhotoUrl } from "@/lib/photoStorage";
import SaveAIAdvice from "@/app/components/SaveAIAdvice";

export default async function AiCheckPage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { mode?: string };
}) {
    const noteId = Number(params.id);
    const mode = searchParams.mode === "diagnose" ? "diagnose" : "identify";
    const summaryInstruction = `
        마지막에 Garden Manager 기록용으로 아래 형식도 작성해 주세요.

        [문의 요약]
        200~300자

        [답변 요약]
        200~300자

        [요약 끝]

        답변 요약에는 주요 판단, 권장 조치, 앞으로 관찰할 사항을 포함해 주세요.
        `;

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
                    species: true,
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

    const photosWithUrls = await Promise.all(
    note.photos.map(async (photo) => ({
        ...photo,
        displayUrl: await getGardenPhotoUrl(photo.filePath),
    }))
);
    const inquiryDate = note.noteDate.toLocaleDateString("en-CA");
    const questionText =
    mode === "diagnose"
        ? `[${inquiryDate} · ${note.plant.plantName} · Diagnose]

        이 식물에서 보이는 문제를 진단해 주세요.이 식물에서 보이는 문제를 진단해 주세요.

위치: Southern California, Fullerton 근처 집 정원
Area: ${note.plant.area?.name || "미지정"}
Plant Name: ${note.plant.plantName}
Species: ${note.plant.species?.commonName || "미지정"}
Scientific Name: ${note.plant.species?.scientificName || note.plant.scientificName || "미지정"}
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
- 사진과 관찰 내용에서 보이는 증상
- 가능한 원인을 가능성이 높은 순서대로
- 병충해, 물 부족, 과습, 영양 문제 가능성
- 추가로 확인해야 할 부분
- 지금 해야 할 조치
- 피해야 할 조치
- 긴급한 문제인지 여부

확실하지 않은 내용은 추측이라고 표시해 주세요.`
        : `[${inquiryDate} · ${note.plant.plantName} · Identify]
        이 식물의 종류를 확인해 주세요.

위치: Southern California, Fullerton 근처 집 정원
Area: ${note.plant.area?.name || "미지정"}
현재 Plant Name: ${note.plant.plantName}
현재 등록된 Species: ${note.plant.species?.commonName || "미지정"}
현재 등록된 Scientific Name: ${note.plant.species?.scientificName || note.plant.scientificName || "미지정"}
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
- 가장 가능성이 높은 식물 이름
- Common Name
- Scientific Name
- Cultivar 후보가 있으면 그 정보
- 다른 가능한 후보
- 확신도
- 식별에 사용한 특징
- 추가로 확인해야 할 특징
- 현재 보이는 전반적인 건강 상태

${summaryInstruction}
`;

    return (
        <main className="edit-page">
            <h1>AI 문의자료</h1>

            <div className="page-actions">
                <Link
                    className={mode === "identify" ? "link-button" : "link-button secondary"}
                    href={`/notes/${note.id}/ai-check?mode=identify`}
                >
                    Identify
                </Link>

                <Link
                    className={mode === "diagnose" ? "link-button" : "link-button secondary"}
                    href={`/notes/${note.id}/ai-check?mode=diagnose`}
                >
                    Diagnose
                </Link>
            </div>

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

            {photosWithUrls.length > 0 && (
                <section className="detail-card ai-check-card">
                    <h2>사진</h2>

                    <div className="note-photos">
                        {photosWithUrls.map((photo) => (
                            <div key={photo.id} className="note-photo-item">
                                <img
                                    className="note-photo"
                                    src={photo.displayUrl}
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
                    {mode === "diagnose" ? (
                        <>
                            <div>□ 문제가 보이는 부분 가까이</div>
                            <div>□ 정상 부분과 비교 사진</div>
                            <div>□ 잎 앞면 / 뒷면</div>
                            <div>□ 줄기 / 가지</div>
                            <div>□ 흙과 뿌리 주변 상태</div>
                        </>
                    ) : (
                        <>
                            <div>□ 식물 전체 모습</div>
                            <div>□ 잎 가까이</div>
                            <div>□ 줄기 / 가지</div>
                            <div>□ 꽃 또는 열매</div>
                            <div>□ 주변 환경</div>
                        </>
                    )}
                </div>
            </section>

            <section className="detail-card ai-check-card">
                <h2>
                    AI에게 보낼 질문 - {mode === "diagnose" ? "Diagnose" : "Identify"}
                </h2>

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
            <SaveAIAdvice
                noteId={note.id}
                plantId={note.plantId}
            />
        </main>
    );
}