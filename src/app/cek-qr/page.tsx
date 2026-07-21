"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Search, UserCheck, ArrowLeft, Clock, QrCode, Loader2, Calendar, ShieldCheck, Eye, Users, Home, AlertTriangle } from "lucide-react";

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
        <Link
          href="/cek-qr"
          className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-[#F97316] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cari Tiket Lain
        </Link>

        <div className="bg-[#141210] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
          {loadingVerify ? (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg text-[#0C0A09]" style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}>
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Memverifikasi Signature Tiket...</p>
            </div>
          ) : verifyError ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mx-auto mb-5">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Verifikasi Gagal</h3>
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 mb-5">
                <p className="text-xs text-rose-400 font-bold leading-relaxed">{verifyError}</p>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed font-semibold">
                Tiket ini palsu, tidak terdaftar, atau signature keamanannya tidak sah.
              </p>
            </div>
          ) : visitor ? (
            <>
              {/* Status header */}
              <div
                className="relative overflow-hidden text-white px-7 py-8 text-center"
                style={{
                  background: isCheckedIn
                    ? "linear-gradient(135deg, #059669 0%, #064e3b 100%)"
                    : "linear-gradient(135deg, #1E1B18 0%, #12100E 100%)",
                }}
              >
                {isCheckedIn ? null : (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FBBF24] to-[#F97316]" />
                )}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-xl" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-3 border border-white/10 bg-white/5">
                    {isCheckedIn
                      ? <><CheckCircle2 className="w-3 h-3 text-[#34D399]" /> Tiket Valid · Hadir</>
                      : <><ShieldCheck className="w-3 h-3 text-[#FBBF24]" /> Tiket Valid · Siap Check-In</>
                    }
                  </div>
                  <p className="text-2xl font-black tracking-tight uppercase">{visitor.ticketCode}</p>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider mt-1 font-semibold">Keamanan Digital Kriptografi Sah</p>
                </div>
              </div>

              {/* Check-in success alert */}
              {checkInSuccess && (
                <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  {checkInSuccess}
                </div>
              )}

              {/* Details */}
              <div className="p-7 space-y-5">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">Nama Lengkap</p>
                  <p className="text-base font-bold text-white uppercase">{visitor.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">Jenis Kelamin</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 uppercase">
                      <Users className="w-3.5 h-3.5 text-[#F97316]" />
                      {visitor.gender}
                    </span>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">Usia / Lahir</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 uppercase">
                      <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />
                      {visitor.age} Tahun
                    </span>
                    <p className="text-[9px] text-white/35 mt-0.5 font-semibold">({formatBirthDate(visitor.birthDate)})</p>
                  </div>
                </div>

                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">Alamat Lengkap</p>
                  <p className="text-xs font-bold text-white/70 leading-relaxed uppercase">{visitor.address}</p>
                </div>

                <div className="pt-5 border-t border-white/[0.06] space-y-4">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Status Tiket</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${isCheckedIn ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                      {isCheckedIn ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isCheckedIn ? "Hadir (Checked In)" : "Belum Hadir (Pending)"}
                    </span>
                  </div>

                  {isCheckedIn && visitor.checkInTime && (
                    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 space-y-3">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Waktu Check-In</p>
                        <p className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                          {formatDate(visitor.checkInTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Scanner Operator</p>
                        <p className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#FBBF24]" />
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
                    className="w-full py-4 text-[#0C0A09] font-black rounded-xl shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}
                  >
                    {loadingCheckIn ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Check-in...</>
                    ) : (
                      <><UserCheck className="w-4 h-4" /> Check-In Pengunjung</>
                    )}
                  </button>
                )}

                {verifyError && !loadingVerify && (
                  <div className="flex items-start gap-2 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    {verifyError}
                  </div>
                )}

                {checkingAdmin && (
                  <p className="text-center text-[9px] text-white/20 font-bold uppercase tracking-wider">Memvalidasi Status Operator...</p>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white transition-colors">
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
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-[#F97316] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="bg-[#141210] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="h-1 w-full bg-gradient-to-r from-[#FBBF24] to-[#F97316]" />

        <div className="p-6 sm:p-8">
          {/* Title */}
          <div className="text-center mb-7">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-[#0C0A09] shadow-lg mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}
            >
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Cek & Cari Tiket</h2>
            <p className="text-xs text-white/45 mt-1 font-medium">
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
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 focus:bg-white/[0.05] text-sm transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loadingSearch}
                className="px-5 text-[#0C0A09] font-black rounded-xl transition-all hover:brightness-110 disabled:opacity-60 flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}
              >
                {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {searchError && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                {searchError}
              </div>
            )}
          </form>

          {/* Results */}
          {searchResults.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-white/25 mb-3">
                {searchResults.length} Hasil Ditemukan
              </p>
              <div className="divide-y divide-white/[0.04] max-h-72 overflow-y-auto -mx-1 px-1">
                {searchResults.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white uppercase truncate">{v.name}</p>
                      <p className="text-[10px] text-white/40 font-semibold mt-0.5 truncate">
                        {v.ticketCode} · {v.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                        v.status === "CHECKED_IN"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {v.status === "CHECKED_IN" ? "Hadir" : "Pending"}
                      </span>
                      <Link
                        href={`/cek-qr?uuid=${v.uuid}&code=${v.ticketCode}&sig=${v.signature}`}
                        className="w-8 h-8 bg-white/5 hover:bg-orange-500/10 text-white/50 hover:text-[#F97316] rounded-xl border border-white/[0.08] hover:border-orange-500/20 transition-all flex items-center justify-center"
                        title="Lihat Detail"
                      >
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
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#141210] rounded-xl border border-white/[0.08] p-4 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#F97316] mb-2" />
          <p className="text-xs font-black text-white uppercase mb-0.5">Kriptografi Sah</p>
          <p className="text-[10px] text-white/35 leading-relaxed font-semibold">Tanda tangan digital keaslian e-ticket</p>
        </div>
        <div className="bg-[#141210] rounded-xl border border-white/[0.08] p-4 shadow-sm">
          <QrCode className="w-5 h-5 text-[#FBBF24] mb-2" />
          <p className="text-xs font-black text-white uppercase mb-0.5">Sekali Scan</p>
          <p className="text-[10px] text-white/35 leading-relaxed font-semibold">QR hanya dapat digunakan 1 kali check-in</p>
        </div>
      </div>
    </div>
  );
}

export default function CekQRPage() {
  return (
    <div className="min-h-screen bg-[#0C0A09] py-10 sm:py-16 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      <style jsx global>{`
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
        }
      `}</style>
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="absolute right-[-10%] top-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 bg-orange-500" />
      <div className="absolute left-[-10%] bottom-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 bg-amber-500" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-16 relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#0C0A09] shadow-lg" style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}>
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Memuat halaman verifikasi...</p>
          </div>
        }
      >
        <VerificationAndSearchContent />
      </Suspense>
    </div>
  );
}
