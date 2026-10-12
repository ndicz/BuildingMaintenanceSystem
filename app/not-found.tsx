import Link from "next/link";

export default function NotFound() {
  return (
    <main className="login-wrap">
      <div className="card login-card">
        <h1>Halaman tidak ditemukan</h1>
        <p className="muted">Data yang dicari mungkin sudah dihapus.</p>
        <Link href="/" className="btn btn-primary">
          Kembali ke Dashboard
        </Link>
      </div>
    </main>
  );
}
