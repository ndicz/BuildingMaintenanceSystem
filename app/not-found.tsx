import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function NotFound() {
  return (
    <main className="login">
      <div className="login-box">
        <Brand />
        <h1>Halaman tidak ditemukan</h1>
        <p className="desc">Data yang dicari mungkin sudah dihapus atau alamatnya salah.</p>
        <Link href="/" className="btn btn-primary">
          Kembali ke ringkasan
        </Link>
      </div>
    </main>
  );
}
