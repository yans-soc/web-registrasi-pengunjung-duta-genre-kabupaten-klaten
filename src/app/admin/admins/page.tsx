"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  UserPlus, 
  Key, 
  X, 
  RefreshCw, 
  Shield, 
  User, 
  Mail,
  Lock
} from "lucide-react";

interface Admin {
  id: number;
  name: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    username: "",
    password: "",
    role: "SCANNER",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentAdminId(data.admin.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmins(data.admins);
      } else {
        setErrorMsg(data.error || "Gagal memuat daftar admin.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi gagal. Pastikan Anda memiliki akses Super Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchAdmins();
  }, []);

  const handleOpenAdd = () => {
    setFormData({ id: "", name: "", username: "", password: "", role: "SCANNER" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (admin: Admin) => {
    setFormData({ 
      id: admin.id.toString(), 
      name: admin.name, 
      username: admin.username, 
      password: "", // Keep empty for no change
      role: admin.role 
    });
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Admin berhasil ditambahkan!");
        setIsAddOpen(false);
        fetchAdmins();
      } else {
        alert(data.error || "Gagal menambahkan admin.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          username: formData.username,
          password: formData.password || undefined,
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Data admin berhasil diperbarui!");
        setIsEditOpen(false);
        fetchAdmins();
      } else {
        alert(data.error || "Gagal memperbarui admin.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (id === currentAdminId) {
      alert("Anda tidak dapat menghapus akun Anda sendiri!");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus admin ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/admins?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Admin berhasil dihapus.");
        fetchAdmins();
      } else {
        alert(data.error || "Gagal menghapus admin.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  if (errorMsg && !loading) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-xl mx-auto mt-12 text-center space-y-4">
        <Shield className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-red-800 uppercase tracking-wider">Akses Ditolak</h2>
        <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Admin</h1>
          <p className="text-sm text-slate-500">Kelola kredensial, role, dan hak akses admin sistem.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Tambah Admin
        </button>
      </div>

      {/* Main Admins Table Card */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-150">
                <th className="px-6 py-4 w-12 text-center">No</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4 text-center">Role / Hak Akses</th>
                <th className="px-6 py-4">Terdaftar Pada</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-7 h-7 animate-spin text-[#EA580C]" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Data...</p>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm font-medium text-slate-400">
                    Tidak ada admin ditemukan.
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {admin.name} {admin.id === currentAdminId && <span className="text-[9px] font-bold text-[#EA580C] bg-[#FFF8F2] border border-[#EA580C]/20 px-2 py-0.5 rounded-full ml-2">Anda</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-medium text-slate-650">
                      {admin.username}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        admin.role === "SUPER_ADMIN" 
                          ? "bg-rose-50 text-rose-700 border border-rose-100" 
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Scanner"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {new Date(admin.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(admin)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-150"
                          title="Edit Admin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id, admin.name)}
                          disabled={admin.id === currentAdminId}
                          className="p-1.5 bg-red-50 hover:bg-red-100 disabled:bg-slate-50 disabled:text-slate-300 text-red-650 rounded-lg transition-colors border border-red-100 disabled:border-slate-100"
                          title="Hapus Admin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative bg-white rounded-3xl border border-slate-150 w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 mt-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F2] border border-[#EA580C]/20 flex items-center justify-center text-[#EA580C]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">Tambah Admin Baru</h3>
                <p className="text-xs text-slate-450 mt-0.5">Buat kredensial admin pengelola baru.</p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Nama Lengkap</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                    placeholder="Nama Lengkap Admin"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                    placeholder="username_admin"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Role / Hak Akses</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20"
                >
                  <option value="SCANNER">Scanner (Scan & Konfirmasi Kehadiran)</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-extrabold rounded-xl shadow-lg transition-colors text-xs uppercase tracking-wider"
              >
                Simpan Admin Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white rounded-3xl border border-slate-150 w-full max-w-md p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6 mt-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8F2] border border-[#EA580C]/20 flex items-center justify-center text-[#EA580C]">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950">Edit Data Admin</h3>
                <p className="text-xs text-slate-450 mt-0.5">Perbarui informasi atau ganti password admin.</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Nama Lengkap</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Password Baru</label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all"
                    placeholder="Kosongkan jika tidak ingin mengubah"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Role / Hak Akses</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={parseInt(formData.id) === currentAdminId}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="SCANNER">Scanner (Scan & Konfirmasi Kehadiran)</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh)</option>
                </select>
                {parseInt(formData.id) === currentAdminId && (
                  <p className="text-[9px] text-amber-600 font-medium mt-1">Anda tidak bisa mengubah hak akses Anda sendiri.</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-extrabold rounded-xl shadow-lg transition-colors text-xs uppercase tracking-wider"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
