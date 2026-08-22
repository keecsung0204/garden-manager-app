import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <h1 className="app-title">Garden Manager</h1>
        <nav className="app-nav">
          <Link href="/" className="link-button secondary">
            Home
          </Link>
          <Link href="/plants/new" className="link-button">
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
        </nav>
      </div>
    </header>
  );
}