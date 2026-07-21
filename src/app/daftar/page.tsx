"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Ticket, User, Calendar, MapPin,
  ChevronRight, Sparkles, Shield, ArrowRight, QrCode, Award, CheckCircle
} from "lucide-react";

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
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (fieldName === "birth_date" && value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const today = new Date();
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) calculatedAge--;
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
      if (!res.ok) throw new Error(data.error || "Pendaftaran gagal");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gradient-to-tr from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />

      <div className="min-h-screen flex flex-col lg:flex-row relative z-10">
        {/* ── Left Panel (decorative, desktop only) ── */}
        <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden">
          {/* Content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider text-white shadow-lg shadow-pink-500/25"
                style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                DG
              </div>
              <div>
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-800 uppercase block">Duta Genre</span>
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-500">Kabupaten Klaten</span>
              </div>
            </div>

            {/* Big decorative text */}
            <div className="mb-8">
              <span className="text-[120px] xl:text-[150px] font-black leading-none select-none pointer-events-none text-slate-100">
                26
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 uppercase tracking-tight leading-[1.05] mb-5">
              Dapatkan<br />
              <span className="grad-text-pink">Tiket Gratis</span><br />
              Sekarang
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Registrasi tiket pengunjung resmi Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              {[
                { icon: <Ticket className="w-4 h-4" />, text: "E-Ticket QR Code otomatis" },
                { icon: <Shield className="w-4 h-4" />, text: "Terenkripsi kriptografi digital" },
                { icon: <Award className="w-4 h-4" />, text: "Berlaku untuk malam puncak" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-pink-100"
                    style={{ background: "linear-gradient(135deg, #FFF8ED, #FFF3E6)", color: "#F97316" }}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>genreklaten.web.id</span>
            <span className="w-px h-3 bg-slate-200" />
            <Link href="/cek-qr" className="hover:text-pink-500 transition-colors">Cek Tiket</Link>
          </div>
        </div>

        {/* ── Right Panel (form) ── */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
            <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-[9px] text-white shadow-md shadow-pink-500/20"
                  style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                  DG
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">E-Ticketing</span>
              </div>
              <Link href="/cek-qr" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
                <QrCode className="w-3.5 h-3.5" />
                Cek Tiket
              </Link>
            </div>
          </header>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-5 py-12">
            <div className="w-full max-w-md">
              {/* Eyebrow */}
              <div className="mb-7 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-200 text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
                  style={{ backgroundColor: "#FFF8ED", color: "#F97316" }}>
                  <Sparkles className="w-3 h-3" />
                  Pendaftaran Pengunjung
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[0.95] uppercase tracking-tight mt-4 mb-3">
                  Formulir<br />
                  <span className="grad-text-pink">Tiket Masuk</span>
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Dapatkan tiket QR code resmi untuk menghadiri Malam Puncak Apresiasi Duta Genre Klaten 2026.
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1 mb-8">
                {["Data Diri", "E-Ticket"].map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      i === 0
                        ? "border-pink-200 text-pink-600 bg-pink-50"
                        : "border-slate-200 text-slate-400 bg-slate-50"
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] font-black ${
                        i === 0 ? "text-white" : "bg-slate-200 text-slate-400"
                      }`}
                        style={i === 0 ? { background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" } : {}}>
                        {i + 1}
                      </span>
                      {step}
                    </div>
                    {i < 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                ))}
              </div>

              {/* Form card */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xl shadow-slate-100">
                {/* Accent top bar */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #FF4FA3, #8B5CF6)" }} />

                <div className="p-6 sm:p-8">
                  {/* Error */}
                  {error && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-800">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px] bg-red-100">!</div>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nama */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                        Nama Lengkap <span className="text-pink-500 normal-case tracking-normal">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan nama lengkap"
                          value={formData.full_name}
                          onChange={(e) => handleChange("full_name", e.target.value)}
                          className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                        Jenis Kelamin <span className="text-pink-500 normal-case tracking-normal">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["LAKI-LAKI", "PEREMPUAN"].map((val) => (
                          <label
                            key={val}
                            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all font-bold text-xs uppercase tracking-wider"
                            style={formData.gender === val ? {
                              borderColor: "#FF4FA3",
                              backgroundColor: "#FFF8ED",
                              color: "#F97316"
                            } : {
                              borderColor: "#E2E8F0",
                              backgroundColor: "#F8FAFC",
                              color: "#64748B"
                            }}>
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                              style={{ borderColor: formData.gender === val ? "#FF4FA3" : "#CBD5E1" }}>
                              {formData.gender === val && (
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FF4FA3" }} />
                              )}
                            </div>
                            {val === "LAKI-LAKI" ? "Laki-laki" : "Perempuan"}
                            <input type="radio" name="gender" value={val} required className="sr-only"
                              onChange={(e) => handleChange("gender", e.target.value)} />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tanggal Lahir + Umur */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                          Tanggal Lahir <span className="text-pink-500 normal-case tracking-normal">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <input
                            type="date"
                            required
                            value={formData.birth_date}
                            onChange={(e) => handleChange("birth_date", e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                          Umur
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={age > 0 ? `${age} Tahun` : ""}
                            placeholder="Otomatis"
                            className="block w-full px-4 py-3.5 rounded-xl text-sm font-bold cursor-default bg-slate-50 border border-slate-200 text-slate-600"
                          />
                          {age > 0 && (
                            <div className="absolute inset-y-0 right-3 flex items-center">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                        Alamat Lengkap <span className="text-pink-500 normal-case tracking-normal">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute top-3.5 left-4 pointer-events-none text-slate-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <textarea
                          required
                          rows={3}
                          placeholder="Masukkan alamat lengkap (Kecamatan, Desa/Kelurahan, RT/RW)"
                          value={formData.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                          className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
                        style={{
                          background: submitting ? "#CBD5E1" : "linear-gradient(135deg, #FF4FA3, #8B5CF6)",
                        }}>
                        {submitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Mendaftarkan...</>
                        ) : (
                          <><Ticket className="w-4 h-4" />Dapatkan Tiket Masuk<ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-7 flex items-center justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Terenkripsi Aman
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  Tiket 100% Gratis
                </div>
              </div>

              {/* Already registered */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Sudah pernah mendaftar?{" "}
                  <Link href="/cek-qr" className="font-bold text-pink-500 hover:text-pink-600 transition-all">
                    Cek Status Tiket →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
