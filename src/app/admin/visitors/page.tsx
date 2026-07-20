"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  User, 
  Calendar, 
  Phone,
  Building,
  CheckCircle,
  Clock,
  Eye,
  Mail
} from "lucide-react";
import * as XLSX from "xlsx";

interface Visitor {
  id: number;
  uuid: string;
  ticketCode: string;
  uniqueCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  agency: string;
  status: string;
  signature: string;
  checkInTime: string | null;
  createdAt: string;
  admin: {
    name: string;
  } | null;
}

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        page: page.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/admin/visitors?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setVisitors(data.visitors);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      }
    } catch (err) {
      console.error("Error fetching visitors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [page, limit, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVisitors();
  };

  const handleManualCheckIn = async (visitor: Visitor) => {
    if (!confirm(`Konfirmasi check-in untuk ${visitor.name}?`)) return;
    try {
      const res = await fetch("/api/visitors/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: visitor.uuid, uniqueCode: visitor.uniqueCode, signature: visitor.signature }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Check-in berhasil!");
        fetchVisitors();
        // Update modal detail if open
        if (selectedVisitor && selectedVisitor.id === visitor.id) {
          setSelectedVisitor({ ...selectedVisitor, status: "PRESENT", checkInTime: new Date().toISOString() });
        }
      } else {
        alert(data.error || "Gagal check-in.");
      }
    } catch (err) {
      console.error("Manual checkin error:", err);
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        export: "true",
      });
      const res = await fetch(`/api/admin/visitors?${query.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const formattedData = data.visitors.map((v: Visitor, index: number) => ({
          "No": index + 1,
          "Kode Tiket": v.ticketCode,
          "Nama Lengkap": v.name,
          "Email": v.email,
          "No. WhatsApp": v.phoneNumber,
          "Instansi / Organisasi": v.agency,
          "Status Kehadiran": v.status === "PRESENT" ? "Hadir" : "Pending",
          "Waktu Registrasi": new Date(v.createdAt).toLocaleString("id-ID"),
          "Waktu Check-In": v.checkInTime ? new Date(v.checkInTime).toLocaleString("id-ID") : "-",
          "Diverifikasi Oleh": v.admin?.name || "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pengunjung");

        // Autowidth columns
        const maxLen = formattedData.reduce((acc: any, row: any) => {
          Object.keys(row).forEach((key, colIndex) => {
            const val = row[key]?.toString() || "";
            acc[colIndex] = Math.max(acc[colIndex] || 0, val.length, key.length);
          });
          return acc;
        }, []);
        worksheet["!cols"] = maxLen.map((w: number) => ({ w: w + 3 }));

        XLSX.writeFile(workbook, `Data_Pengunjung_Duta_Genre_Klaten_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } else {
        alert("Gagal memuat data ekspor.");
      }
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Gagal mengekspor data ke Excel.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        export: "true",
      });
      const res = await fetch(`/api/admin/visitors?${query.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          alert("Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir.");
          return;
        }

        const html = `
          <html>
            <head>
              <title>Data Pengunjung Duta Genre Klaten 2026</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #333; }
                h1 { margin-bottom: 5px; text-align: center; }
                h3 { margin-top: 0; text-align: center; font-weight: normal; margin-bottom: 20px; color: #666; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .badge { display: inline-block; padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
                .present { background-color: #d1fae5; color: #065f46; }
                .pending { background-color: #fef3c7; color: #92400e; }
              </style>
            </head>
            <body>
              <h1>Laporan Data Pengunjung</h1>
              <h3>Duta Genre Klaten 2026 - Filter: Status (${statusFilter}), Pencarian ("${search || '-'}")</h3>
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode Tiket</th>
                    <th>Nama Lengkap</th>
                    <th>Email</th>
                    <th>No. WhatsApp</th>
                    <th>Instansi</th>
                    <th>Status</th>
                    <th>Waktu Registrasi</th>
                    <th>Waktu Check-In</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.visitors.map((v: Visitor, index: number) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td style="font-family: monospace; font-weight: bold;">${v.ticketCode}</td>
                      <td style="font-weight: bold;">${v.name}</td>
                      <td>${v.email}</td>
                      <td>${v.phoneNumber}</td>
                      <td>${v.agency}</td>
                      <td>
                        <span class="badge ${v.status === "PRESENT" ? "present" : "pending"}">
                          ${v.status === "PRESENT" ? "Hadir" : "Pending"}
                        </span>
                      </td>
                      <td>${new Date(v.createdAt).toLocaleString("id-ID")}</td>
                      <td>${v.checkInTime ? new Date(v.checkInTime).toLocaleString("id-ID") : "-"}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() { window.close(); };
                }
              </script>
            </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
      } else {
        alert("Gagal memuat data ekspor.");
      }
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Gagal mengekspor data ke PDF.");
    } finally {
      setExporting(false);
    }
  };

  const formatDateTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    const d = new Date(timeStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Pengunjung</h1>
          <p className="text-sm text-slate-500">Kelola dan pantau seluruh daftar pengunjung yang terdaftar dalam sistem.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 disabled:bg-slate-350 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            {exporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-350 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            {exporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            PDF
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari nama, tiket, instansi, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] text-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            className="px-5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-950 transition-colors uppercase tracking-wider"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
          >
            <option value="ALL">Semua Pengunjung</option>
            <option value="PRESENT">Hadir</option>
            <option value="PENDING">Belum Hadir (Pending)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-150">
                <th className="px-6 py-4 w-12 text-center">No</th>
                <th className="px-6 py-4">Kode Tiket</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Instansi</th>
                <th className="px-6 py-4">No. WhatsApp</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Waktu Check-In</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#EA580C]" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Data...</p>
                    </div>
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm font-medium text-slate-400">
                    Tidak ada pengunjung ditemukan.
                  </td>
                </tr>
              ) : (
                visitors.map((v, index) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-[#EA580C] font-mono">
                      {v.ticketCode}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800 leading-none">{v.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{v.email}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 truncate max-w-[150px]">
                      {v.agency}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {v.phoneNumber}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        v.status === "PRESENT" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {v.status === "PRESENT" ? "Hadir" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {v.status === "PRESENT" ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDateTime(v.checkInTime).split(" ").slice(3).join(" ")}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">Oleh: {v.admin?.name || "-"}</span>
                        </div>
                      ) : (
                        <span className="text-slate-350">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedVisitor(v)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {v.status === "PENDING" && (
                          <button
                            onClick={() => handleManualCheckIn(v)}
                            className="p-1.5 bg-[#FFF8F2] hover:bg-[#FEEAD6] text-[#EA580C] rounded-lg transition-colors border border-[#EA580C]/20"
                            title="Konfirmasi Check-In"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {!loading && visitors.length > 0 && (
          <div className="p-4 border-t border-slate-150 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
              Total {totalItems} Pengunjung • Halaman {page} dari {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-300 text-slate-650 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-300 text-slate-650 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedVisitor(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl border border-slate-150 w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedVisitor(null)}
              className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mt-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF8F2] border border-[#EA580C]/20 flex items-center justify-center text-[#EA580C] mb-4 shrink-0">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedVisitor.name}</h3>
              <p className="text-xs font-mono font-bold text-[#EA580C] mt-1">{selectedVisitor.ticketCode}</p>
            </div>

            <div className="py-6 space-y-4 text-slate-700">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Email</span>
                  <span className="text-xs font-medium mt-1 block">{selectedVisitor.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Nomor WhatsApp</span>
                  <span className="text-xs font-medium mt-1 block">{selectedVisitor.phoneNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Instansi</span>
                  <span className="text-xs font-medium mt-1 block">{selectedVisitor.agency}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Terdaftar Pada</span>
                  <span className="text-xs font-medium mt-1 block">{formatDateTime(selectedVisitor.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${selectedVisitor.status === "PRESENT" ? "bg-emerald-500" : "bg-amber-500"}`} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Status Kehadiran</span>
                  <span className="text-xs font-bold mt-1 block uppercase">
                    {selectedVisitor.status === "PRESENT" ? "Hadir (Verified)" : "Belum Hadir (Pending)"}
                  </span>
                </div>
              </div>

              {selectedVisitor.status === "PRESENT" && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase leading-none">Waktu Check-In</span>
                    <span className="text-xs font-medium mt-1 block">
                      {formatDateTime(selectedVisitor.checkInTime)} (Oleh: {selectedVisitor.admin?.name || "Scanner"})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {selectedVisitor.status === "PENDING" && (
              <button
                onClick={() => handleManualCheckIn(selectedVisitor)}
                className="w-full mt-4 py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-extrabold rounded-xl shadow-lg transition-colors text-xs uppercase tracking-wider"
              >
                Konfirmasi Check-In Sekarang
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
