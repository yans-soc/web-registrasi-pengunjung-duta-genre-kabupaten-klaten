"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Percent, 
  RefreshCw, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Scan,
  ShieldAlert
} from "lucide-react";

interface Stats {
  total: number;
  present: number;
  pending: number;
  rate: number;
}

interface RecentRegistration {
  id: number;
  ticketCode: string;
  name: string;
  agency: string;
  status: string;
  createdAt: string;
}

interface RecentCheckIn {
  id: number;
  ticketCode: string;
  name: string;
  checkInTime: string;
  admin: {
    name: string;
  } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRegs, setRecentRegs] = useState<RecentRegistration[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat statistik");
      }
      setStats(data.stats);
      setRecentRegs(data.recentRegistrations);
      setRecentCheckIns(data.recentCheckIns);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan memuat data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  };

  const formatDate = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center flex-col gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C]" />
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-xl mx-auto">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-4" />
        <h3 className="text-lg font-black text-rose-950 mb-2">Terjadi Kesalahan</h3>
        <p className="text-sm text-rose-600 mb-6">{error}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner - Styled like Purity UI Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-r from-[#EA580C] via-[#DC2626] to-[#B91C1C] text-white rounded-3xl p-6 shadow-xl shadow-[#EA580C]/10 flex flex-col justify-between min-h-[180px]">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -right-2 -top-10 w-36 h-36 bg-white/10 rounded-full blur-xl"></div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">PURITY DASHBOARD</span>
            <h1 className="text-xl md:text-2xl font-black mt-2 leading-tight">Selamat Datang Kembali, Admin!</h1>
            <p className="text-xs text-orange-100/90 mt-1.5 max-w-md font-medium leading-relaxed">
              Pantau jalannya registrasi, kelola data pengunjung, serta lakukan verifikasi tiket secara real-time dan aman.
            </p>
          </div>
          <div className="flex items-center gap-2.5 mt-4 z-10">
            <Link
              href="/admin/visitors"
              className="px-5 py-2.5 bg-white text-[#EA580C] text-xs font-black rounded-xl hover:bg-slate-50 hover:shadow-lg transition-all uppercase tracking-wider"
            >
              Lihat Pengunjung
            </Link>
            <Link
              href="/admin/scanner"
              className="px-5 py-2.5 bg-white/20 text-white text-xs font-black rounded-xl hover:bg-white/30 hover:shadow-lg transition-all uppercase tracking-wider flex items-center gap-1.5 border border-white/20"
            >
              <Scan className="w-3.5 h-3.5" /> Scan QR
            </Link>
          </div>
        </div>

        {/* Small System Quick Control Card */}
        <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xl shadow-slate-100/40 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Layanan</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-wider mt-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE / AKTIF
                </span>
              </div>
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 disabled:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl border border-slate-150 transition-all shadow-sm shrink-0"
                title="Segarkan Data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
              Sistem registrasi & sinkronisasi kehadiran berjalan normal. Data di bawah diperbarui secara otomatis.
            </p>
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span>Terakhir diperbarui:</span>
            <span className="font-bold text-slate-600">Hari ini, {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
          </div>
        </div>
      </div>

      {/* Stats Widgets - Styled like Purity UI */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Terdaftar</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-1">{stats.total} orang</span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-[#EA580C] to-[#DC2626] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#EA580C]/20">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Present */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sudah Hadir</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-1">{stats.present} orang</span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Belum Hadir</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-1">{stats.pending} orang</span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <UserMinus className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Attendance Rate */}
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rasio Kehadiran</span>
              <span className="text-2xl font-black text-slate-800 tracking-tight block mt-1">{stats.rate}%</span>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid for lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Registrations - Styled like Purity UI Tables */}
        <div className="bg-white rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/30 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-black text-slate-800">Pendaftaran Terbaru</h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Daftar pendaftar terbaru yang masuk ke sistem.</p>
              </div>
              <Link 
                href="/admin/visitors" 
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-[#FFF8F2] border border-slate-150 hover:border-[#EA580C]/20 text-slate-600 hover:text-[#EA580C] text-[10px] font-black rounded-xl transition-all uppercase tracking-wider flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentRegs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">Belum ada pengunjung terdaftar.</div>
            ) : (
              <div className="space-y-3.5">
                {recentRegs.map((reg) => (
                  <div key={reg.id} className="flex justify-between items-center p-3 hover:bg-slate-50/50 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* User Initial Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 border border-slate-150 font-black flex items-center justify-center text-xs uppercase shrink-0">
                        {reg.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{reg.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                          {reg.agency || "Instansi/Umum"} • {reg.ticketCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        reg.status === "PRESENT" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {reg.status === "PRESENT" ? "Hadir" : "Pending"}
                      </span>
                      <p className="text-[9px] text-slate-400 font-medium mt-1">
                        {formatDate(reg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Check-ins */}
        <div className="bg-white rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/30 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-black text-slate-800">Kehadiran Terbaru (Scan)</h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Aktivitas verifikasi tiket masuk hari ini.</p>
              </div>
              <Link 
                href="/admin/scanner" 
                className="px-3.5 py-1.5 bg-[#FFF8F2] border border-[#EA580C]/20 hover:bg-[#FEEAD6] text-[#EA580C] text-[10px] font-black rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5"
              >
                <Scan className="w-3.5 h-3.5" /> Buka Scanner
              </Link>
            </div>

            {recentCheckIns.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">Belum ada aktivitas check-in hari ini.</div>
            ) : (
              <div className="space-y-3.5">
                {recentCheckIns.map((ci) => (
                  <div key={ci.id} className="flex justify-between items-center p-3 hover:bg-slate-50/50 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checked-In Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-[#FFF8F2] text-[#EA580C] border border-[#EA580C]/20 font-black flex items-center justify-center text-xs uppercase shrink-0">
                        {ci.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{ci.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                          Kode: {ci.ticketCode} • By {ci.admin?.name || "Scanner"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right shrink-0">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-black text-emerald-700">
                        {formatTime(ci.checkInTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}