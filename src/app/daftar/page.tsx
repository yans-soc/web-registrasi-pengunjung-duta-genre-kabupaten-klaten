"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Ticket, User, Calendar, MapPin, ChevronRight, Sparkles, Shield, ArrowRight } from "lucide-react";

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
        const birth = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        );
        const today = new Date();
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
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

  const inputClass =
    "block w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 focus:bg-white/[0.05] text-sm transition-all font-medium";

  const labelClass =
    "block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2";

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#F5F0EB] flex flex-col">
      <style jsx global>{`
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
        }
      `}</style>
      <div className="absolute inset-0 grain pointer-events-none" />

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-[#0C0A09]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#F97316] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[#0C0A09] font-black text-[10px] shadow-sm" style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}>
              DG
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">E-Ticketing</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12 relative z-10">
        <div className="w-full max-w-md">

          {/* ── Hero heading ── */}
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3 h-3 text-[#FBBF24]" />
              Pendaftaran Pengunjung
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-[0.95] uppercase mb-3">
              Formulir<br />
              <span className="bg-gradient-to-r from-[#FBBF24] to-[#F97316] bg-clip-text text-transparent">
                Tiket Masuk
              </span>
            </h1>
            <p className="text-xs text-white/45 font-medium max-w-xs mx-auto leading-relaxed">
              Dapatkan tiket QR code resmi untuk menghadiri Malam Puncak Apresiasi Duta Genre Klaten 2026.
            </p>
          </div>

          {/* ── Steps indicator ── */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {["Data Diri", "E-Ticket"].map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${i === 0 ? "bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316]" : "bg-white/[0.02] border border-white/[0.06] text-white/30"}`}>
                  <span className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] font-black ${i === 0 ? "bg-[#F97316] text-[#0C0A09]" : "bg-white/5"}`}>{i + 1}</span>
                  {step}
                </div>
                {i < 1 && <ChevronRight className="w-3.5 h-3.5 text-white/10" />}
              </div>
            ))}
          </div>

          {/* ── Form card ── */}
          <div className="bg-[#12100E] rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl relative">
            <div className="h-1 w-full bg-gradient-to-r from-[#FBBF24] to-[#F97316]" />

            <div className="p-6 sm:p-8">
              {/* Error alert */}
              {error && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-rose-950/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20">
                  <div className="w-5 h-5 rounded-md bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black">!</span>
                  </div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="full_name" className={labelClass}>
                    Nama Lengkap <span className="text-[#F97316] normal-case tracking-normal font-black">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="full_name"
                      required
                      placeholder="Masukkan nama lengkap"
                      value={formData.full_name}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label htmlFor="gender" className={labelClass}>
                    Jenis Kelamin <span className="text-[#F97316] normal-case tracking-normal font-black">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["LAKI-LAKI", "PEREMPUAN"].map((val) => (
                      <label
                        key={val}
                        className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border cursor-pointer transition-all font-bold text-xs uppercase tracking-wider ${
                          formData.gender === val
                            ? "border-[#F97316] bg-[#F97316]/5 text-white"
                            : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${formData.gender === val ? "border-[#F97316]" : "border-white/20"}`}>
                          {formData.gender === val && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
                        </div>
                        {val === "LAKI-LAKI" ? "Laki-laki" : "Perempuan"}
                        <input
                          type="radio"
                          name="gender"
                          value={val}
                          required
                          className="sr-only"
                          onChange={(e) => handleChange("gender", e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tanggal Lahir + Umur */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="birth_date" className={labelClass}>
                      Tanggal Lahir <span className="text-[#F97316] normal-case tracking-normal font-black">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        id="birth_date"
                        required
                        value={formData.birth_date}
                        onChange={(e) => handleChange("birth_date", e.target.value)}
                        className={`${inputClass} pl-11 [color-scheme:dark]`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Umur</label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={age > 0 ? `${age} Tahun` : ""}
                        placeholder="Otomatis"
                        className="block w-full px-4 py-3.5 bg-white/[0.01] border border-white/[0.04] rounded-xl text-white/50 placeholder-white/10 text-sm font-bold cursor-default"
                      />
                      {age > 0 && (
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <span className="text-[9px] font-black text-[#FBBF24] uppercase tracking-wider">Auto</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alamat */}
                <div>
                  <label htmlFor="address" className={labelClass}>
                    Alamat Lengkap <span className="text-[#F97316] normal-case tracking-normal font-black">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-4 pointer-events-none text-white/20">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <textarea
                      id="address"
                      required
                      rows={3}
                      placeholder="Masukkan alamat lengkap (Kecamatan, Desa/Kelurahan, RT/RW)"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className={`${inputClass} pl-11 resize-none`}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 text-[#0C0A09] font-black rounded-xl shadow-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 relative overflow-hidden"
                    style={{ background: submitting ? "#333" : "linear-gradient(135deg, #FBBF24, #F97316)", boxShadow: submitting ? "none" : "0 8px 30px rgba(249,115,22,0.3)" }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mendaftarkan...
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        Dapatkan Tiket Masuk
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Trust badges ── */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-3 text-[10px] text-white/35 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Terenkripsi Aman
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              Tiket 100% Gratis
            </div>
          </div>

          {/* ── Already registered? ── */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/30 font-medium">
              Sudah pernah mendaftar?{" "}
              <Link href="/cek-qr" className="text-[#F97316] font-bold hover:underline transition-all">
                Cek Status Tiket Anda →
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
