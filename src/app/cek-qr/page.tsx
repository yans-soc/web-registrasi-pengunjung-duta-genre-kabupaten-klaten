"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  UserCheck, 
  ArrowLeft, 
  Clock, 
  QrCode, 
  Loader2,
  Calendar,
  ShieldCheck,
  Eye,
  User,
  Users
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

  // Verification state
  const [visitor, setVisitor] = useState<VisitorDetail | null>(null);
  const [loadingVerify, setLoadingVerify] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>("");

  // Admin session state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const [loadingCheckIn, setLoadingCheckIn] = useState<boolean>(false);
  const [checkInSuccess, setCheckInSuccess] = useState<string>("");

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");

  // Check Admin Login
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error("Failed to check admin status:", err);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // Verify ticket if params exist (uuid, code, sig)
  useEffect(() => {
    if (uuid && code && sig) {
      const verifyTicket = async () => {
        setLoadingVerify(true);
        setVerifyError("");
        try {
          const res = await fetch(`/api/visitors/detail?uuid=${uuid}&code=${code}&sig=${sig}`);
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Gagal memverifikasi tiket");
          }
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

  // Handle manual search by full_name OR unique_code
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
      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan pencarian");
      }
      setSearchResults(data.results);
      if (data.results.length === 0) {
        setSearchError("Tidak ada pendaftar yang cocok.");
      }
    } catch (err: any) {
      setSearchError(err.message || "Terjadi kesalahan");
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle Admin Check-In Action
  const handleCheckIn = async () => {
    if (!visitor) return;
    setLoadingCheckIn(true);
    setCheckInSuccess("");
    setVerifyError("");

    try {
      const res = await fetch("/api/visitors/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid: uuid,
          uniqueCode: code,
          signature: sig,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan check-in");
      }

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  };

  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  // Case 1: Verification Mode (URL contains uuid & code & sig)
  if (uuid && code && sig) {
    return (
      <div className="w-full max-w-md">
        <Link 
          href="/cek-qr" 
          onClick={() => router.push("/cek-qr")} 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#EA580C] mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cari Tiket Lain / Kembali
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-150 overflow-hidden">
          {loadingVerify ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#EA580C] mx-auto mb-4" />
              <p className="text-sm text-slate-500 font-medium">Memverifikasi tanda tangan digital tiket...</p>
            </div>
          ) : verifyError ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-[#DC2626] mx-auto mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Verifikasi Gagal</h3>
              <p className="text-sm text-[#DC2626] bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 mb-6 font-medium leading-relaxed">
                {verifyError}
              </p>
              <p className="text-xs text-slate-400">
                Tiket ini tidak terdaftar, palsu, atau tanda tangan digitalnya telah dimanipulasi secara manual.
              </p>
            </div>
          ) : visitor ? (
            <div>
              {/* Verification Header */}
              <div className={`p-6 text-center text-white ${
                visitor.status === "CHECKED_IN" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600" 
                  : "bg-gradient-to-r from-[#EA580C] to-[#DC2626]"
              }`}>
                {visitor.status === "CHECKED_IN" ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Tiket Valid - Sudah Hadir
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/25 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5" /> Tiket Valid - Belum Hadir
                  </div>
                )}
                <h3 className="text-2xl font-black text-white">{visitor.ticketCode}</h3>
                <p className="text-xs text-orange-100 mt-1">Verifikasi Digital Signature Sukses</p>
              </div>

              {/* Check-In success alert */}
              {checkInSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold text-center border-b border-emerald-100 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {checkInSuccess}
                </div>
              )}

              {/* Visitor details list */}
              <div className="p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</span>
                  <span className="text-base font-bold text-slate-800">{visitor.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jenis Kelamin</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-1">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" /> {visitor.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usia / Tanggal Lahir</span>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" /> {visitor.age} tahun ({formatBirthDate(visitor.birthDate)})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat / Domisili</span>
                  <span className="text-sm font-semibold text-slate-700 mt-1 block">{visitor.address}</span>
                </div>

                <div className="pt-5 border-t border-slate-100 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Tiket</span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-1.5 ${
                      visitor.status === "CHECKED_IN" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {visitor.status === "CHECKED_IN" ? "HADIR (CHECKED IN)" : "BELUM HADIR (PENDING)"}
                    </span>
                  </div>

                  {visitor.status === "CHECKED_IN" && visitor.checkInTime && (
                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Waktu Check-In</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatDate(visitor.checkInTime)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Diverifikasi Oleh</span>
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" /> {visitor.checkedInBy || "Sistem Scanner"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin-only Check-In Action Button */}
                {isAdmin && visitor.status === "REGISTERED" && (
                  <div className="pt-4">
                    <button
                      onClick={handleCheckIn}
                      disabled={loadingCheckIn}
                      className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                      style={{ backgroundColor: "#EA580C" }}
                    >
                      {loadingCheckIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Melakukan Check-in...
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" /> Check-In Sekarang
                        </>
                      )}
                    </button>
                  </div>
                )}

                {checkingAdmin && (
                  <div className="text-center pt-2">
                    <p className="text-[10px] text-slate-400 font-medium">Mengecek otorisasi admin...</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Case 2: Search Mode (URL does not contain uuid & code & sig)
  return (
    <div className="w-full max-w-md">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#EA580C] mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
      </Link>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-150 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md" style={{ backgroundColor: "#EA580C" }}>
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cek Status & Cari Tiket</h2>
          <p className="text-sm text-slate-500 mt-1">Cari tiket terdaftar dengan nama lengkap atau kode tiket</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Ketik nama atau kode tiket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loadingSearch}
              className="px-5 text-white font-bold rounded-xl transition-colors disabled:bg-slate-300 flex items-center justify-center"
              style={{ backgroundColor: "#EA580C" }}
            >
              {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
            </button>
          </div>
          {searchError && (
            <p className="text-xs font-bold text-[#DC2626] mt-3.5 bg-rose-50/50 p-3 rounded-lg border border-rose-100/50">
              {searchError}
            </p>
          )}
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Pencarian</h3>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {searchResults.map((visitor) => (
                <div key={visitor.id} className="py-3 flex justify-between items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{visitor.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{visitor.address} • {visitor.ticketCode}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      visitor.status === "CHECKED_IN" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {visitor.status === "CHECKED_IN" ? "Hadir" : "Pending"}
                    </span>
                    <Link
                      href={`/cek-qr?uuid=${visitor.uuid}&code=${visitor.ticketCode}&sig=${visitor.signature}`}
                      className="p-2 bg-slate-50 hover:bg-orange-50 text-slate-500 hover:text-[#EA580C] rounded-lg border border-slate-100 hover:border-orange-100 transition-all flex items-center justify-center"
                      title="Lihat Detail Tiket"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CekQRPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F2] text-slate-800 py-12 px-6 flex flex-col justify-center items-center">
      <Suspense
        fallback={
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#EA580C] mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-medium">Memuat halaman verifikasi...</p>
          </div>
        }
      >
        <VerificationAndSearchContent />
      </Suspense>
    </div>
  );
}