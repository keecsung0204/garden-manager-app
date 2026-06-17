import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/app/components/SubmitButton";

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

    await prisma.plant.update({
      where: {
        id: plant.id,
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

    redirect("/");
  }

  async function createNote(formData: FormData) {
    "use server";

    const noteType = formData.get("noteType") as string;
    const content = formData.get("content") as string;

    await prisma.plantNote.create({
      data: {
        plantId: plant.id,
        noteType,
        content,
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

          <select id="noteType" name="noteType" defaultValue="Observation">
            <option value="Observation">Observation - 관찰</option>
            <option value="Problem">Problem - 문제 발견</option>
            <option value="AI Advice">AI Advice - AI 조언</option>
            <option value="Action">Action - 실제 조치</option>
            <option value="Follow-up">Follow-up - 결과 확인</option>
            <option value="Watering">Watering - 물주기</option>
            <option value="Fertilizer">Fertilizer - 비료</option>
            <option value="Pruning">Pruning - 가지치기</option>
            <option value="Pest">Pest - 해충</option>
            <option value="Disease">Disease - 병</option>
            <option value="Other">Other - 기타</option>
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
                  <span className="note-type">{note.noteType || "Note"}</span>
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
      <Link className="back-link" href="/">
        ← Back to Home
      </Link>
    </main>
  );

}