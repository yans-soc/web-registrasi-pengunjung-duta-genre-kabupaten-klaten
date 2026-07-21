"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, XCircle, Search, UserCheck, ArrowLeft, Clock,
  QrCode, Loader2, Calendar, ShieldCheck, Eye, Users, Home, AlertTriangle
} from "lucide-react";

const STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scalePop { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
  .fade-up { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-up-1 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.07s both; }
  .fade-up-2 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
  .pop { animation: scalePop 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
  .search-input {
    display: block; width: 100%;
    padding: 0.9rem 1rem 0.9rem 2.75rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 0.75rem;
    color: white;
    font-size: 0.875rem; font-weight: 500;
    transition: all 0.2s ease; outline: none;
  }
  .search-input::placeholder { color: rgba(255,255,255,0.2); }
  .search-input:focus {
    border-color: rgba(124,58,237,0.5);
    background: rgba(124,58,237,0.04);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
  }
`;

interface VisitorDetail {
  id: number;
  ticketCode: string;
  name: string;
  gender: string;
  birthDate: string;
  age: number;
  address: string;
  status: string;
  checkInTime: string | null;
  checkedInBy: string | null;
  signature: string;
}

function VerificationAndSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uuid = searchParams.get("uuid");
  const code = searchParams.get("code");
  const sig = searchParams.get("sig");

  const [visitor, setVisitor] = useState<VisitorDetail | null>(null);
  const [loadingVerify, setLoadingVerify] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>("");

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const [loadingCheckIn, setLoadingCheckIn] = useState<boolean>(false);
  const [checkInSuccess, setCheckInSuccess] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) setIsAdmin(true);
        }
      } catch {}
      finally { setCheckingAdmin(false); }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (uuid && code && sig) {
      const verifyTicket = async () => {
        setLoadingVerify(true);
        setVerifyError("");
        try {
          const res = await fetch(`/api/visitors/detail?uuid=${uuid}&code=${code}&sig=${sig}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Gagal memverifikasi tiket");
          setVisitor(data.visitor);
        } catch (err: any) {
          setVerifyError(err.message || "Tiket tidak valid");
        } finally {
          setLoadingVerify(false);
        }
      };
      verifyTicket();
    }
  }, [uuid, code, sig]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 3) {
      setSearchError("Masukkan minimal 3 karakter.");
      return;
    }
    setLoadingSearch(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const res = await fetch(`/api/visitors/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan pencarian");
      setSearchResults(data.results);
      if (data.results.length === 0) setSearchError("Tidak ada pendaftar yang cocok.");
    } catch (err: any) {
      setSearchError(err.message || "Terjadi kesalahan");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleCheckIn = async () => {
    if (!visitor) return;
    setLoadingCheckIn(true);
    setCheckInSuccess("");
    setVerifyError("");
    try {
      const res = await fetch("/api/visitors/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, uniqueCode: code, signature: sig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal melakukan check-in");
      setCheckInSuccess("Check-in Berhasil!");
      setVisitor({
        ...visitor,
        status: "CHECKED_IN",
        checkInTime: data.visitor.checkInTime,
        checkedInBy: data.visitor.checkedInBy || "Admin",
      });
    } catch (err: any) {
      setVerifyError(err.message || "Terjadi kesalahan check-in");
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) + " WIB";

  const formatBirthDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
    });

  const isCheckedIn = visitor?.status === "CHECKED_IN";

  // ── VERIFICATION MODE ──────────────────────────────────────────────────
  if (uuid && code && sig) {
    return (
      <div className="w-full max-w-md flex flex-col gap-4 relative z-10">
        <Link href="/cek-qr"
          className="inline-flex items-center gap-2 text-xs font-bold text-white/35 hover:text-white/70 transition-colors fade-up">
          <ArrowLeft className="w-4 h-4" />
          Cari Tiket Lain
        </Link>

        <div className="rounded-2xl overflow-hidden pop"
          style={{
            background: "rgba(10,8,18,0.95)",
            border: "1px solid rgba(124,58,237,0.15)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px -20px rgba(124,58,237,0.2), 0 40px 80px -30px rgba(0,0,0,0.7)"
          }}>

          {/* Loading */}
          {loadingVerify && (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)" }}>
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs text-white/35 font-bold uppercase tracking-wider">Memverifikasi Signature Tiket...</p>
            </div>
          )}

          {/* Error */}
          {!loadingVerify && verifyError && !visitor && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <XCircle className="w-8 h-8" style={{ color: "#f87171" }} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Verifikasi Gagal</h3>
              <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p className="text-xs font-bold leading-relaxed" style={{ color: "#f87171" }}>{verifyError}</p>
              </div>
              <p className="text-[10px] text-white/25 leading-relaxed font-semibold">
                Tiket ini palsu, tidak terdaftar, atau signature keamanannya tidak sah.
              </p>
            </div>
          )}

          {/* Visitor detail */}
          {!loadingVerify && visitor && (
            <>
              {/* Status header */}
              <div className="relative overflow-hidden px-7 py-8 text-center"
                style={{
                  background: isCheckedIn
                    ? "linear-gradient(160deg, #064e3b 0%, #022c22 100%)"
                    : "linear-gradient(160deg, #0f0d1f 0%, #0c0a1a 100%)"
                }}>
                {/* Top accent line */}
                <div className="absolute top-0 inset-x-0 h-[2px]"
                  style={{ background: isCheckedIn ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #7C3AED, #1D4ED8)" }} />
                {/* Glows */}
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-[60px] opacity-25"
                  style={{ backgroundColor: isCheckedIn ? "#10b981" : "#7C3AED" }} />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-[60px] opacity-15"
                  style={{ backgroundColor: isCheckedIn ? "#059669" : "#1D4ED8" }} />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] mb-3"
                    style={isCheckedIn
                      ? { background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.25)", color: "#6ee7b7" }
                      : { background: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.8)" }}>
                    {isCheckedIn
                      ? <><CheckCircle2 className="w-3 h-3" /> Tiket Valid · Hadir</>
                      : <><ShieldCheck className="w-3 h-3" /> Tiket Valid · Siap Check-In</>}
                  </div>
                  <p className="text-2xl font-black tracking-tight uppercase text-white">{visitor.ticketCode}</p>
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mt-1 font-semibold">Keamanan Digital Kriptografi Sah</p>
                </div>
              </div>

              {/* Check-in success alert */}
              {checkInSuccess && (
                <div className="flex items-center justify-center gap-2 py-3 px-4 border-b text-[10px] font-black uppercase tracking-wider"
                  style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.15)", color: "#34d399" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {checkInSuccess}
                </div>
              )}

              {/* Details */}
              <div className="p-7 space-y-5">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/25 mb-1.5">Nama Lengkap</p>
                  <p className="text-base font-bold text-white uppercase">{visitor.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/25 mb-1.5">Jenis Kelamin</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 uppercase">
                      <Users className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                      {visitor.gender}
                    </span>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/25 mb-1.5">Usia / Lahir</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 uppercase">
                      <Calendar className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                      {visitor.age} Tahun
                    </span>
                    <p className="text-[9px] text-white/25 mt-0.5 font-semibold">({formatBirthDate(visitor.birthDate)})</p>
                  </div>
                </div>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/25 mb-1.5">Alamat Lengkap</p>
                  <p className="text-xs font-bold text-white/60 leading-relaxed uppercase">{visitor.address}</p>
                </div>

                {/* Status */}
                <div className="pt-5 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/25 mb-2">Status Tiket</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border"
                      style={isCheckedIn
                        ? { background: "rgba(16,185,129,0.06)", color: "#34d399", borderColor: "rgba(16,185,129,0.2)" }
                        : { background: "rgba(245,158,11,0.06)", color: "#fbbf24", borderColor: "rgba(245,158,11,0.2)" }}>
                      {isCheckedIn ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isCheckedIn ? "Hadir (Checked In)" : "Belum Hadir (Pending)"}
                    </span>
                  </div>

                  {isCheckedIn && visitor.checkInTime && (
                    <div className="rounded-xl p-4 space-y-3"
                      style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.1)" }}>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Waktu Check-In</p>
                        <p className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                          {formatDate(visitor.checkInTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Scanner Operator</p>
                        <p className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
                          {visitor.checkedInBy || "Sistem"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin check-in button */}
                {isAdmin && visitor.status === "REGISTERED" && (
                  <button
                    onClick={handleCheckIn}
                    disabled={loadingCheckIn}
                    className="w-full py-4 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
                    {loadingCheckIn
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Check-in...</>
                      : <><UserCheck className="w-4 h-4" /> Check-In Pengunjung</>}
                  </button>
                )}

                {/* Check-in error */}
                {verifyError && visitor && (
                  <div className="flex items-start gap-2 p-3 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    {verifyError}
                  </div>
                )}

                {checkingAdmin && (
                  <p className="text-center text-[9px] text-white/20 font-bold uppercase tracking-wider">
                    Memvalidasi Status Operator...
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/30 hover:text-white/60 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // ── SEARCH MODE ────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md flex flex-col gap-4 relative z-10">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-white/35 hover:text-white/70 transition-colors fade-up">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      {/* Search card */}
      <div className="rounded-2xl overflow-hidden pop"
        style={{
          background: "rgba(10,8,18,0.95)",
          border: "1px solid rgba(124,58,237,0.15)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px -20px rgba(124,58,237,0.2), 0 40px 80px -30px rgba(0,0,0,0.7)"
        }}>
        {/* Top gradient bar */}
        <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #7C3AED, #1D4ED8)" }} />

        <div className="p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Cek &amp; Cari Tiket</h2>
            <p className="text-xs text-white/35 mt-2 font-medium leading-relaxed">
              Masukkan nama lengkap atau kode tiket pendaftaran
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ketik nama atau kode tiket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button
                type="submit"
                disabled={loadingSearch}
                className="px-5 font-black rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                {loadingSearch
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />}
              </button>
            </div>

            {searchError && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {searchError}
              </div>
            )}
          </form>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-white/20 mb-3">
                {searchResults.length} Hasil Ditemukan
              </p>
              <div className="divide-y max-h-72 overflow-y-auto -mx-1 px-1" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {searchResults.map((v) => (
                  <div key={v.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white uppercase truncate">{v.name}</p>
                      <p className="text-[10px] text-white/35 font-semibold mt-0.5 truncate">
                        {v.ticketCode} · {v.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border"
                        style={v.status === "CHECKED_IN"
                          ? { background: "rgba(16,185,129,0.07)", color: "#34d399", borderColor: "rgba(16,185,129,0.2)" }
                          : { background: "rgba(245,158,11,0.07)", color: "#fbbf24", borderColor: "rgba(245,158,11,0.2)" }}>
                        {v.status === "CHECKED_IN" ? "Hadir" : "Pending"}
                      </span>
                      <Link
                        href={`/cek-qr?uuid=${v.uuid}&code=${v.ticketCode}&sig=${v.signature}`}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all hover:border-violet-500/30"
                        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                        title="Lihat Detail">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 fade-up-1">
        <div className="rounded-xl p-4"
          style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.1)" }}>
          <ShieldCheck className="w-5 h-5 mb-2.5" style={{ color: "#7C3AED" }} />
          <p className="text-xs font-black text-white uppercase mb-0.5">Kriptografi Sah</p>
          <p className="text-[10px] text-white/30 leading-relaxed font-semibold">Tanda tangan digital keaslian e-ticket</p>
        </div>
        <div className="rounded-xl p-4"
          style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.1)" }}>
          <QrCode className="w-5 h-5 mb-2.5" style={{ color: "#a78bfa" }} />
          <p className="text-xs font-black text-white uppercase mb-0.5">Sekali Scan</p>
          <p className="text-[10px] text-white/30 leading-relaxed font-semibold">QR hanya dapat digunakan 1 kali check-in</p>
        </div>
      </div>

      {/* Register link */}
      <div className="text-center fade-up-2">
        <p className="text-xs text-white/25 font-medium">
          Belum punya tiket?{" "}
          <Link href="/daftar" className="font-bold hover:underline transition-all" style={{ color: "#7C3AED" }}>
            Daftar Sekarang →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CekQRPage() {
  return (
    <div className="min-h-screen bg-[#050408] py-10 sm:py-16 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      <style jsx global>{STYLES}</style>

      {/* Background glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.1] pointer-events-none"
        style={{ backgroundColor: "#7C3AED" }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.07] pointer-events-none"
        style={{ backgroundColor: "#1D4ED8" }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#7C3AED20 1px, transparent 1px), linear-gradient(90deg, #7C3AED20 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-16 relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)" }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-white/35 font-bold uppercase tracking-wider">Memuat halaman verifikasi...</p>
          </div>
        }
      >
        <VerificationAndSearchContent />
      </Suspense>
    </div>
  );
}
