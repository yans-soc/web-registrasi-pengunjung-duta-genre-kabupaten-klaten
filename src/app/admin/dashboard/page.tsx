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
  Scan,
  ShieldAlert,
  TrendingUp
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
  admin: { name: string } | null;
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
      <div className="py-12 flex justify-center items-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center max-w-md mx-auto">
        <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-red-900 mb-2">Terjadi Kesalahan</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button onClick={() => fetchDashboardData()} className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 text-sm">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-1">Selamat Datang, Admin!</h1>
            <p className="text-sm text-orange-100">Pantau aktivitas registrasi dan kehadiran pengunjung secara real-time.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/visitors" className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 text-sm transition-colors">
              Lihat Pengunjung
            </Link>
            <Link href="/admin/scanner" className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-400 text-sm transition-colors flex items-center gap-2">
              <Scan className="w-4 h-4" /> Scan QR
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Terdaftar</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Sudah Hadir</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.present}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Belum Hadir</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                <UserMinus className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Rasio Kehadiran</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.rate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                <Percent className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Pendaftaran Terbaru</h2>
              <p className="text-xs text-gray-500 mt-0.5">Daftar pendaftar terbaru yang masuk ke sistem.</p>
            </div>
            <Link href="/admin/visitors" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5">
            {recentRegs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Belum ada pengunjung terdaftar.</p>
            ) : (
              <div className="space-y-3">
                {recentRegs.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-xs shrink-0">
                        {reg.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{reg.name}</p>
                        <p className="text-xs text-gray-500 truncate">{reg.agency || "Instansi/Umum"}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                      reg.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {reg.status === "PRESENT" ? "Hadir" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Kehadiran Terbaru</h2>
              <p className="text-xs text-gray-500 mt-0.5">Aktivitas verifikasi tiket masuk hari ini.</p>
            </div>
            <Link href="/admin/scanner" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
              <Scan className="w-3 h-3" /> Scanner
            </Link>
          </div>
          <div className="p-5">
            {recentCheckIns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Belum ada aktivitas check-in hari ini.</p>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 font-semibold flex items-center justify-center text-xs shrink-0">
                        {ci.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ci.name}</p>
                        <p className="text-xs text-gray-500 truncate">By {ci.admin?.name || "Scanner"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right shrink-0">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-700">{formatTime(ci.checkInTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Memuat..." : "Segarkan Data"}
        </button>
      </div>
    </div>
  );
}