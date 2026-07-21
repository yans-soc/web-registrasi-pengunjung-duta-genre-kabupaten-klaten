"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Ticket, User, Calendar, MapPin,
  ChevronRight, Sparkles, Shield, ArrowRight, QrCode, Award
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
    <div className="min-h-screen bg-[#050408] text-white overflow-hidden">
      <style jsx global>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.12s both; }
        .fade-up-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .float-anim { animation: float 6s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050408; }
        ::-webkit-scrollbar-thumb { background: #7C3AED55; border-radius: 99px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        .input-field {
          display: block; width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          outline: none;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.2); }
        .input-field:focus {
          border-color: rgba(124,58,237,0.5);
          background: rgba(124,58,237,0.04);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
        .textarea-field {
          display: block; width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          outline: none;
          resize: none;
        }
        .textarea-field::placeholder { color: rgba(255,255,255,0.2); }
        .textarea-field:focus {
          border-color: rgba(124,58,237,0.5);
          background: rgba(124,58,237,0.04);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }
        .noise-overlay::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.018; pointer-events: none; mix-blend-mode: overlay;
        }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── Left Panel (decorative, desktop only) ── */}
        <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] relative flex-col justify-between p-10 xl:p-14 noise-overlay overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0 bg-[#080610]" />
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.18]" style={{ backgroundColor: "#7C3AED" }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.12]" style={{ backgroundColor: "#1D4ED8" }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(#7C3AED40 1px, transparent 1px), linear-gradient(90deg, #7C3AED40 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

          {/* Top logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] tracking-wider text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)" }}>
              DG
            </div>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-white/80 uppercase block">Duta Genre</span>
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "#7C3AED" }}>Kabupaten Klaten</span>
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
            {/* Big decorative text */}
            <div className="mb-10 float-anim">
              <span className="text-[120px] xl:text-[150px] font-black leading-none select-none pointer-events-none"
                style={{ WebkitTextStroke: "1px rgba(124,58,237,0.2)", color: "transparent" }}>
                26
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white uppercase tracking-tight leading-[1.05] mb-5">
              Dapatkan<br />
              <span style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Tiket Gratis
              </span><br />
              Sekarang
            </h2>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Registrasi tiket pengunjung resmi Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-3">
              {[
                { icon: <Ticket className="w-3.5 h-3.5" />, text: "E-Ticket QR Code otomatis" },
                { icon: <Shield className="w-3.5 h-3.5" />, text: "Terenkripsi kriptografi digital" },
                { icon: <Award className="w-3.5 h-3.5" />, text: "Berlaku untuk malam puncak" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/[0.06]"
                    style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-white/50">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="relative z-10 flex items-center gap-4 text-[10px] text-white/25 font-bold uppercase tracking-widest">
            <span>genreklaten.web.id</span>
            <span className="w-px h-3 bg-white/10" />
            <Link href="/cek-qr" className="hover:text-white/50 transition-colors">Cek Tiket</Link>
          </div>
        </div>

        {/* ── Right Panel (form) ── */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-40 bg-[#050408]/90 backdrop-blur-xl border-b border-white/[0.05]">
            <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white/70 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[9px] text-white"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)" }}>
                  DG
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40">E-Ticketing</span>
              </div>
              <Link href="/cek-qr" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors">
                <QrCode className="w-3.5 h-3.5" />
                Cek Tiket
              </Link>
            </div>
          </header>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-5 py-12 relative">
            {/* BG glow (mobile/tablet) */}
            <div className="lg:hidden absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[120px] opacity-[0.12] pointer-events-none" style={{ backgroundColor: "#7C3AED" }} />
            <div className="lg:hidden absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] rounded-full blur-[100px] opacity-[0.08] pointer-events-none" style={{ backgroundColor: "#1D4ED8" }} />

            <div className="w-full max-w-md">
              {/* Eyebrow */}
              <div className="fade-up-1 mb-7 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] mb-5"
                  style={{ borderColor: "rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.08)", color: "#7C3AED" }}>
                  <Sparkles className="w-3 h-3" />
                  Pendaftaran Pengunjung
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-[0.95] uppercase tracking-tight mt-4 mb-3">
                  Formulir<br />
                  <span style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Tiket Masuk
                  </span>
                </h1>
                <p className="text-xs text-white/40 leading-relaxed font-medium">
                  Dapatkan tiket QR code resmi untuk menghadiri Malam Puncak Apresiasi Duta Genre Klaten 2026.
                </p>
              </div>

              {/* Step indicator */}
              <div className="fade-up-2 flex items-center gap-1 mb-8">
                {["Data Diri", "E-Ticket"].map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      i === 0
                        ? "border-violet-500/30 text-violet-400"
                        : "border-white/[0.06] text-white/25"
                    }`}
                      style={i === 0 ? { backgroundColor: "rgba(124,58,237,0.08)" } : { backgroundColor: "rgba(255,255,255,0.02)" }}>
                      <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] font-black ${
                        i === 0 ? "text-white" : "bg-white/5 text-white/30"
                      }`}
                        style={i === 0 ? { background: "linear-gradient(135deg, #7C3AED, #1D4ED8)" } : {}}>
                        {i + 1}
                      </span>
                      {step}
                    </div>
                    {i < 1 && <ChevronRight className="w-3.5 h-3.5 text-white/10" />}
                  </div>
                ))}
              </div>

              {/* Form card */}
              <div className="fade-up-3 rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.02)", boxShadow: "0 32px 80px -20px rgba(0,0,0,0.6)" }}>
                {/* Accent top bar */}
                <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #7C3AED, #1D4ED8)" }} />

                <div className="p-6 sm:p-8">
                  {/* Error */}
                  {error && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border text-xs font-bold"
                      style={{ backgroundColor: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]"
                        style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>!</div>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nama */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">
                        Nama Lengkap <span className="text-violet-400 normal-case tracking-normal">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan nama lengkap"
                          value={formData.full_name}
                          onChange={(e) => handleChange("full_name", e.target.value)}
                          className="input-field"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">
                        Jenis Kelamin <span className="text-violet-400 normal-case tracking-normal">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["LAKI-LAKI", "PEREMPUAN"].map((val) => (
                          <label
                            key={val}
                            className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border cursor-pointer transition-all font-bold text-xs uppercase tracking-wider"
                            style={formData.gender === val ? {
                              borderColor: "rgba(124,58,237,0.5)",
                              backgroundColor: "rgba(124,58,237,0.06)",
                              color: "rgba(255,255,255,0.9)"
                            } : {
                              borderColor: "rgba(255,255,255,0.06)",
                              backgroundColor: "rgba(255,255,255,0.01)",
                              color: "rgba(255,255,255,0.35)"
                            }}>
                            <div className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                              style={{ borderColor: formData.gender === val ? "#7C3AED" : "rgba(255,255,255,0.2)" }}>
                              {formData.gender === val && (
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#7C3AED" }} />
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
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">
                          Tanggal Lahir <span className="text-violet-400 normal-case tracking-normal">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <input
                            type="date"
                            required
                            value={formData.birth_date}
                            onChange={(e) => handleChange("birth_date", e.target.value)}
                            className="input-field"
                            style={{ colorScheme: "dark" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">
                          Umur
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={age > 0 ? `${age} Tahun` : ""}
                            placeholder="Otomatis"
                            className="block w-full px-4 py-3.5 rounded-xl text-sm font-bold cursor-default"
                            style={{
                              background: "rgba(255,255,255,0.01)",
                              border: "1px solid rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          />
                          {age > 0 && (
                            <div className="absolute inset-y-0 right-3 flex items-center">
                              <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#7C3AED" }}>Auto</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">
                        Alamat Lengkap <span className="text-violet-400 normal-case tracking-normal">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute top-3.5 left-4 pointer-events-none text-white/20">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <textarea
                          required
                          rows={3}
                          placeholder="Masukkan alamat lengkap (Kecamatan, Desa/Kelurahan, RT/RW)"
                          value={formData.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                          className="textarea-field"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        style={{
                          background: submitting ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #7C3AED, #1D4ED8)",
                          boxShadow: submitting ? "none" : "0 8px 32px rgba(124,58,237,0.3)",
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
              <div className="mt-7 flex items-center justify-center gap-6 text-[10px] text-white/25 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Terenkripsi Aman
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Tiket 100% Gratis
                </div>
              </div>

              {/* Already registered */}
              <div className="mt-6 text-center">
                <p className="text-xs text-white/25 font-medium">
                  Sudah pernah mendaftar?{" "}
                  <Link href="/cek-qr" className="font-bold hover:underline transition-all" style={{ color: "#7C3AED" }}>
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
