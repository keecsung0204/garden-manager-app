import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function MasterDataPage() {
  const [areas, categories, statuses] = await Promise.all([
    prisma.area.findMany({
      orderBy: { areaCode: "asc" },
    }),
    prisma.plantCategory.findMany({
      orderBy: { categoryCode: "asc" },
    }),
    prisma.plantStatus.findMany({
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  return (
    <main style={{ padding: "20px", maxWidth: "900px" }}>
      <h1>Manage Data</h1>

      <div className="page-actions">
        <Link href="/" className="link-button secondary">
          ← Back to Home
        </Link>

        <Link href="/irrigation-zones" className="link-button">
            Irrigation Zones
        </Link>
      </div>

      <section className="detail-card">
        <h2>Areas</h2>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area.id}>
                <td>{area.areaCode}</td>
                <td>{area.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="detail-card">
        <h2>Categories</h2>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.categoryCode}</td>
                <td>{category.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="detail-card">
        <h2>Plant Status</h2>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => (
              <tr key={status.id}>
                <td>{status.statusCode}</td>
                <td>{status.name}</td>
                <td>{status.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}