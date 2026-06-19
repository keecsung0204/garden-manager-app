import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PlantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const plantId = Number(params.id);

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