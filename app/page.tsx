import Link from "next/link";

export default function HomePage() {
  return (
    <main className="edit-page">
      <section className="detail-card">
        <h2>Garden Manager</h2>

        <p>
          정원 관리에 필요한 메뉴를 선택하세요.
        </p>

        <div className="home-menu">
          <Link href="/plants" className="link-button">
            Plant List
          </Link>

          <Link href="/plants/new" className="link-button secondary">
            Add Plant
          </Link>

          <Link href="/admin/master-data" className="link-button secondary">
            Manage Data
          </Link>

          <Link href="/irrigation-zones" className="link-button secondary">
            Irrigation Zones
          </Link>

          <Link href="/references" className="link-button secondary">
            Reference
          </Link>
        </div>
        <img
          src="/garden-home.jpg"
          alt="Garden"
          className="home-hero-image"
        />
      </section>
    </main>
  );
}