"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, FileText, CheckCircle } from "lucide-react";

export default function DaftarVisitor() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({
    full_name: "",
    gender: "",
    birth_date: "",
    address: "",
  });
  const [age, setAge] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Auto-calculate age when birth_date changes
    if (fieldName === "birth_date" && value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const today = new Date();
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          calculatedAge--;
        }
        setAge(calculatedAge);
      }
    } else if (fieldName === "birth_date" && !value) {
      setAge(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Pendaftaran gagal");
      }

      // Redirect to ticket QR page with details
      const params = new URLSearchParams({
        uuid: data.visitor.uuid,
        code: data.visitor.uniqueCode,
        name: data.visitor.name,
        status: data.visitor.status,
        sig: data.visitor.signature,
      });
      router.push(`/qr?${params.toString()}`);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#111827] py-12 px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#EA580C] mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>

        {/* Form Card with glassmorphism */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-md" style={{ backgroundColor: "#EA580C" }}>
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-[#111827] tracking-tight">Formulir Pendaftaran</h2>
            <p className="text-sm text-slate-500 mt-1">Isi data diri Anda untuk mendapatkan tiket masuk</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="full_name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Nama Lengkap <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                required
                placeholder="Masukkan nama lengkap"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#111827] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] text-sm transition-all"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label htmlFor="gender" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Jenis Kelamin <span className="text-[#DC2626]">*</span>
              </label>
              <select
                id="gender"
                required
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] text-sm transition-all"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="LAKI-LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label htmlFor="birth_date" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Tanggal Lahir <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="date"
                id="birth_date"
                required
                value={formData.birth_date}
                onChange={(e) => handleChange("birth_date", e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] text-sm transition-all"
              />
            </div>

            {/* Umur (readonly otomatis) */}
            <div>
              <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Umur
              </label>
              <input
                type="text"
                id="age"
                readOnly
                value={age > 0 ? `${age} Tahun` : ""}
                placeholder="Terisi otomatis dari tanggal lahir"
                className="block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-[#111827] placeholder-slate-400 text-sm transition-all cursor-default"
              />
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Alamat Lengkap <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                id="address"
                required
                rows={3}
                placeholder="Masukkan alamat lengkap"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#111827] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] text-sm transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg hover:brightness-110 disabled:bg-slate-300 disabled:shadow-none transition-all text-sm flex items-center justify-center gap-2 mt-4"
              style={{ backgroundColor: "#EA580C" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Dapatkan Tiket Masuk
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}