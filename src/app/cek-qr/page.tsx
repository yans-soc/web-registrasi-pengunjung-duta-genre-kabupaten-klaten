"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, XCircle, Search, UserCheck, ArrowLeft, Clock,
  QrCode, Loader2, Calendar, ShieldCheck, Eye, Users, Home, AlertTriangle
} from "lucide-react";

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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors fade-up">
          <ArrowLeft className="w-4 h-4" />
          Cari Tiket Lain
        </Link>

        <div className="rounded-3xl overflow-hidden pop bg-white shadow-2xl shadow-slate-200/50 border border-slate-200">
          {/* Loading */}
          {loadingVerify && (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/25"
                style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Memverifikasi Signature Tiket...</p>
            </div>
          )}

          {/* Error */}
          {!loadingVerify && verifyError && !visitor && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-red-50 border border-red-200">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">Verifikasi Gagal</h3>
              <div className="rounded-xl p-4 mb-5 bg-red-50 border border-red-200">
                <p className="text-xs font-bold leading-relaxed text-red-700">{verifyError}</p>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
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
                    ? "linear-gradient(160deg, #059669 0%, #047857 100%)"
                    : "linear-gradient(160deg, #FF4FA3 0%, #8B5CF6 100%)"
                }}>
                <div className="absolute top-0 inset-x-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.3), transparent)" }} />
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-[60px] opacity-30 bg-white/20" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-[60px] opacity-20 bg-white/10" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] mb-3 bg-white/20 border-white/30 text-white">
                    {isCheckedIn
                      ? <><CheckCircle2 className="w-3 h-3" /> Tiket Valid · Hadir</>
                      : <><ShieldCheck className="w-3 h-3" /> Tiket Valid · Siap Check-In</>}
                  </div>
                  <p className="text-2xl font-black tracking-tight uppercase text-white">{visitor.ticketCode}</p>
                  <p className="text-white/70 text-[9px] uppercase tracking-wider mt-1 font-semibold">Keamanan Digital Kriptografi Sah</p>
                </div>
              </div>

              {/* Check-in success alert */}
              {checkInSuccess && (
                <div className="flex items-center justify-center gap-2 py-3 px-4 border-b border-emerald-100 bg-emerald-50 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  {checkInSuccess}
                </div>
              )}

              {/* Details */}
              <div className="p-7 space-y-5">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1.5">Nama Lengkap</p>
                  <p className="text-base font-bold text-slate-900 uppercase">{visitor.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1.5">Jenis Kelamin</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase">
                      <Users className="w-3.5 h-3.5 text-pink-500" />
                      {visitor.gender}
                    </span>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1.5">Usia / Lahir</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      {visitor.age} Tahun
                    </span>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">({formatBirthDate(visitor.birthDate)})</p>
                  </div>
                </div>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1.5">Alamat Lengkap</p>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase">{visitor.address}</p>
                </div>

                {/* Status */}
                <div className="pt-5 space-y-4 border-t border-slate-100">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Status Tiket</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border"
                      style={isCheckedIn
                        ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
                        : { background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }}>
                      {isCheckedIn ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isCheckedIn ? "Hadir (Checked In)" : "Belum Hadir (Pending)"}
                    </span>
                  </div>

                  {isCheckedIn && visitor.checkInTime && (
                    <div className="rounded-xl p-4 space-y-3 bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Waktu Check-In</p>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          {formatDate(visitor.checkInTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Scanner Operator</p>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-pink-500" />
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
                    className="w-full py-4 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
                    style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                    {loadingCheckIn
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Check-in...</>
                      : <><UserCheck className="w-4 h-4" /> Check-In Pengunjung</>}
                  </button>
                )}

                {/* Check-in error */}
                {verifyError && visitor && (
                  <div className="flex items-start gap-2 p-3 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    {verifyError}
                  </div>
                )}

                {checkingAdmin && (
                  <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Memvalidasi Status Operator...
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
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
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors fade-up">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      {/* Search card */}
      <div className="rounded-3xl overflow-hidden pop bg-white shadow-2xl shadow-slate-200/50 border border-slate-200">
        {/* Top gradient bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF4FA3, #8B5CF6)" }} />

        <div className="p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/25 mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cek & Cari Tiket</h2>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
              Masukkan nama lengkap atau kode tiket pendaftaran
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ketik nama atau kode tiket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loadingSearch}
                className="px-5 font-black rounded-xl text-white transition-all hover:scale-[1.05] disabled:opacity-50 flex items-center justify-center shadow-lg shadow-pink-500/25"
                style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                {loadingSearch
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Search className="w-4 h-4" />}
              </button>
            </div>

            {searchError && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {searchError}
              </div>
            )}
          </form>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3">
                {searchResults.length} Hasil Ditemukan
              </p>
              <div className="divide-y max-h-72 overflow-y-auto -mx-1 px-1 divide-slate-100">
                {searchResults.map((v) => (
                  <div key={v.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 uppercase truncate">{v.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                        {v.ticketCode} · {v.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border"
                        style={v.status === "CHECKED_IN"
                          ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
                          : { background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }}>
                        {v.status === "CHECKED_IN" ? "Hadir" : "Pending"}
                      </span>
                      <Link
                        href={`/cek-qr?uuid=${v.uuid}&code=${v.ticketCode}&sig=${v.signature}`}
                        className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center transition-all hover:border-pink-300 text-slate-400 hover:text-pink-500"
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
        <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
          <ShieldCheck className="w-5 h-5 mb-2.5 text-pink-500" />
          <p className="text-xs font-black text-slate-900 uppercase mb-0.5">Kriptografi Sah</p>
          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">Tanda tangan digital keaslian e-ticket</p>
        </div>
        <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
          <QrCode className="w-5 h-5 mb-2.5 text-purple-500" />
          <p className="text-xs font-black text-slate-900 uppercase mb-0.5">Sekali Scan</p>
          <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">QR hanya dapat digunakan 1 kali check-in</p>
        </div>
      </div>

      {/* Register link */}
      <div className="text-center fade-up-2">
        <p className="text-xs text-slate-500 font-medium">
          Belum punya tiket?{" "}
          <Link href="/daftar" className="font-bold text-pink-500 hover:text-pink-600 transition-all">
            Daftar Sekarang →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CekQRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 py-10 sm:py-16 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-tr from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-16 relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/25"
              style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Memuat halaman verifikasi...</p>
          </div>
        }
      >
        <VerificationAndSearchContent />
      </Suspense>
    </div>
  );
}
