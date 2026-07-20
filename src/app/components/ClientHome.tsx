"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  Clock,
  Award,
  X,
  ArrowRight,
  QrCode,
  Ticket,
  MapPin,
  CalendarDays,
  Star,
  ChevronRight,
  Building2,
  Clock3,
} from "lucide-react";

interface ClientHomeProps {
  theme: any;
  typography: any;
  hero: any;
  popup: any;
  announcement: any;
  sections: any[];
  stats: {
    totalRegistered: number;
    totalCheckedIn: number;
    percentagePresent: number;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function SectionLabel({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 mb-3">
      <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

// ── Default placeholder data ───────────────────────────────────────────────

const DEFAULT_RUNDOWN = [
  { time: "08.00", title: "Registrasi & Check-In Peserta", description: "Pemeriksaan tiket dan pengarahan awal" },
  { time: "09.00", title: "Pembukaan & Sambutan", description: "Sambutan dari panitia dan tamu undangan" },
  { time: "10.00", title: "Penampilan Peserta Tahap I", description: "" },
  { time: "12.00", title: "Ishoma", description: "Istirahat, sholat, dan makan siang" },
  { time: "13.00", title: "Penampilan Peserta Tahap II", description: "" },
  { time: "15.30", title: "Penjurian & Musyawarah", description: "Proses penilaian oleh dewan juri" },
  { time: "17.00", title: "Pengumuman & Malam Puncak", description: "Pengumuman pemenang & penutupan acara" },
];

const DEFAULT_SPONSORS = [
  { name: "Pemkab Klaten" },
  { name: "BKKBN" },
  { name: "DP3AKB" },
  { name: "Partner" },
];

export default function ClientHome({
  theme,
  typography,
  hero,
  popup,
  announcement,
  sections,
  stats,
}: ClientHomeProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const primaryColor = theme.primary || "#EA580C";
  const secondaryColor = theme.secondary || "#DC2626";
  const accentColor = theme.accent || "#F59E0B";
  const bgColor = theme.background || "#FAFAFA";
  const textColor = theme.text || "#111827";
  const headingFont = typography.headingFont || "var(--font-geist-sans)";
  const bodyFont = typography.bodyFont || "var(--font-geist-sans)";

  useEffect(() => {
    if (popup?.enabled) {
      const shown = sessionStorage.getItem("popup_shown");
      if (!shown) setShowPopup(true);
    }
  }, [popup]);

  useEffect(() => {
    if (theme.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = theme.favicon;
    }
  }, [theme.favicon]);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("popup_shown", "true");
  };

  // Resolve section data or use defaults
  const getSection = (slug: string) =>
    sections.find((s) => s.slug === slug && s.isVisible);

  const heroSect = getSection("hero");
  const rundownSect = getSection("rundown");
  const sponsorSect = getSection("sponsor");
  const lokasiSect = getSection("lokasi");
  const aboutSect = getSection("about");
  const guestSect = getSection("guest-star");
  const footerSect = sections.find((s) => s.slug === "footer" && s.isVisible);

  // Hero values
  const heroBgImage = hero?.bgImage || "";
  const heroTitle = hero?.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026";
  const heroSubtitle = hero?.subtitle || "E-Ticketing Pengunjung Resmi";
  const heroDesc = hero?.description || "Portal registrasi tiket pengunjung resmi untuk acara Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.";
  const heroBtnText = hero?.buttonText || "Daftar Tiket Sekarang";
  const heroBtnLink = hero?.buttonLink || "/daftar";
  const heroOverlay = hero?.overlay !== undefined ? hero.overlay / 100 : 0.5;

  // Rundown
  const rundownEvents: any[] = rundownSect?.content?.events?.length
    ? rundownSect.content.events
    : DEFAULT_RUNDOWN;

  // Sponsors
  const sponsors: any[] = sponsorSect?.content?.sponsors?.length
    ? sponsorSect.content.sponsors
    : DEFAULT_SPONSORS;

  // Lokasi
  const mapUrl: string = lokasiSect?.content?.mapUrl || "";
  const venueAddress: string = lokasiSect?.content?.address || "Kabupaten Klaten, Jawa Tengah";

  // Footer
  const copyright =
    footerSect?.content?.copyright ||
    "© 2026 Duta Genre Kabupaten Klaten. All Rights Reserved.";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: bodyFont }}
    >
      <style jsx global>{`
        h1, h2, h3, h4, h5, h6 { font-family: ${headingFont} !important; }
      `}</style>

      {/* ── Announcement Bar ── */}
      {announcement?.enabled && showAnnouncement && (
        <div
          className="w-full text-white py-2 px-4 flex items-center justify-between text-xs font-semibold z-50"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="flex-1 text-center">{announcement.text}</span>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="ml-3 opacity-80 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {theme.logo ? (
              <img src={theme.logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
                style={{ backgroundColor: primaryColor }}
              >
                DG
              </div>
            )}
            <div className="leading-tight">
              <p className="font-bold text-slate-900 text-sm leading-none">Duta Genre Klaten 2026</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sistem E-Ticketing</p>
            </div>
          </div>
          <Link
            href="/admin/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            Portal Admin
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* ══════════════════════════════════════════
            SECTION: HERO
        ══════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden min-h-[520px] sm:min-h-[600px] flex items-center"
          style={{
            backgroundImage: heroBgImage ? `url(${heroBgImage})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient fallback when no bg image */}
          {!heroBgImage && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}0D 0%, ${accentColor}08 50%, ${secondaryColor}06 100%)`,
                }}
              />
              {/* Dot grid */}
              <div
                className="absolute inset-0 opacity-[0.018]"
                style={{
                  backgroundImage: `radial-gradient(circle, ${primaryColor} 1.5px, transparent 1.5px)`,
                  backgroundSize: "28px 28px",
                }}
              />
            </>
          )}

          {/* Dark overlay for bg image */}
          {heroBgImage && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${heroOverlay})` }}
            />
          )}

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center text-center">
            {/* Badge */}
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border mb-6"
              style={
                heroBgImage
                  ? { backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.25)" }
                  : { backgroundColor: `${primaryColor}12`, color: primaryColor, borderColor: `${primaryColor}25` }
              }
            >
              <Star className="w-3 h-3" />
              {heroSubtitle}
            </span>

            {/* Title */}
            <h1
              className={`text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5 max-w-3xl ${
                heroBgImage ? "text-white" : "text-slate-900"
              }`}
            >
              {heroTitle}
            </h1>

            {/* Description */}
            <p
              className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-10 ${
                heroBgImage ? "text-slate-200" : "text-slate-500"
              }`}
            >
              {heroDesc}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14 w-full">
              <Link
                href={heroBtnLink}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl text-sm shadow-lg hover:brightness-105 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <Ticket className="w-4 h-4" />
                {heroBtnText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/cek-qr"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 font-bold rounded-xl text-sm border transition-all ${
                  heroBgImage
                    ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <QrCode className="w-4 h-4" />
                Cek Tiket / Status
              </Link>
            </div>

            {/* Stats Widget */}
            <div className="w-full max-w-xl">
              <div
                className={`rounded-2xl border grid grid-cols-3 divide-x ${
                  heroBgImage
                    ? "bg-white/10 backdrop-blur-sm border-white/15 divide-white/10"
                    : "bg-white border-slate-100 shadow-lg shadow-slate-100/80 divide-slate-100"
                }`}
              >
                {[
                  { label: "Pendaftar", value: stats.totalRegistered, icon: <Users className="w-4 h-4" />, color: primaryColor },
                  { label: "Check-In", value: stats.totalCheckedIn, icon: <CheckCircle className="w-4 h-4" />, color: secondaryColor },
                  { label: "Hadir", value: `${stats.percentagePresent}%`, icon: <Clock className="w-4 h-4" />, color: accentColor },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center py-5 px-2 gap-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
                      style={{
                        backgroundColor: heroBgImage ? "rgba(255,255,255,0.15)" : `${s.color}12`,
                        color: heroBgImage ? "#fff" : s.color,
                      }}
                    >
                      {s.icon}
                    </div>
                    <span className={`text-xl sm:text-2xl font-black tabular-nums ${heroBgImage ? "text-white" : "text-slate-900"}`}>
                      {s.value}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${heroBgImage ? "text-slate-300" : "text-slate-400"}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION: INFO STRIP
        ══════════════════════════════════════════ */}
        <section className="border-y border-slate-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                <span className="font-medium">Tahun 2026</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                <span className="font-medium">{venueAddress}</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                <span className="font-medium">Tiket Digital QR</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION: ABOUT (jika ada di DB)
        ══════════════════════════════════════════ */}
        {aboutSect && (
          <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-100">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
              {aboutSect.content?.imageUrl && (
                <div className="w-full md:w-2/5 shrink-0">
                  <img
                    src={aboutSect.content.imageUrl}
                    alt="Tentang Acara"
                    className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md border border-slate-100"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {aboutSect.name}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">
                  Mengenal Pemilihan Duta Genre
                </h2>
                <div
                  className="text-slate-500 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: aboutSect.content?.description || "Informasi seputar acara." }}
                />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            SECTION: RUNDOWN
        ══════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50 border-b border-slate-100">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <SectionLabel label={rundownSect?.name || "Rundown"} color={primaryColor} />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Jadwal & Agenda Acara</h2>
            </div>

            <div className="space-y-2.5">
              {rundownEvents.map((evt: any, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white rounded-xl border border-slate-100 px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="shrink-0 flex flex-col items-center pt-0.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                    >
                      <Clock3 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-black tabular-nums shrink-0"
                        style={{ color: primaryColor }}
                      >
                        {evt.time}
                      </span>
                      <div className="w-px h-3 bg-slate-200" />
                      <p className="text-sm font-bold text-slate-900 truncate">{evt.title}</p>
                    </div>
                    {evt.description && (
                      <p className="text-xs text-slate-400 leading-relaxed pl-0 mt-0.5">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!rundownSect && (
              <p className="text-center text-xs text-slate-400 mt-4">
                * Jadwal dapat berubah sewaktu-waktu
              </p>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION: GUEST STAR (jika ada di DB)
        ══════════════════════════════════════════ */}
        {guestSect && (
          <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-100">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <SectionLabel label={guestSect.name} color={primaryColor} />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Bintang Tamu Spesial</h2>
              </div>
              {(guestSect.content?.stars || []).length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-6">Bintang tamu akan segera diumumkan.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {(guestSect.content?.stars || []).map((star: any, i: number) => (
                    <div key={i} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm text-center">
                      {star.image ? (
                        <img src={star.image} alt={star.name} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
                          <Award className="w-10 h-10" />
                        </div>
                      )}
                      <div className="p-3.5">
                        <p className="font-bold text-slate-900 text-sm">{star.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{star.role || "Special Guest"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════
            SECTION: LOKASI / VENUE
        ══════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <SectionLabel label={lokasiSect?.name || "Lokasi"} color={primaryColor} />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Lokasi & Venue Acara</h2>
            </div>

            {mapUrl ? (
              <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            ) : (
              /* Placeholder venue card when no map yet */
              <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden shadow-sm">
                <div
                  className="w-full h-48 sm:h-64 flex flex-col items-center justify-center gap-4"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${accentColor}06)` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div className="text-center px-4">
                    <p className="font-black text-slate-900 text-base">Kabupaten Klaten</p>
                    <p className="text-sm text-slate-500 mt-1">Jawa Tengah, Indonesia</p>
                  </div>
                </div>
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                    <span>Detail lokasi akan segera diumumkan oleh panitia</span>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Klaten,Jawa+Tengah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg border transition-colors hover:bg-slate-50"
                    style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
                  >
                    Buka Google Maps
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION: SPONSOR / PARTNER
        ══════════════════════════════════════════ */}
        <section className="py-14 px-4 sm:px-6 bg-slate-50 border-b border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <SectionLabel label={sponsorSect?.name || "Sponsor & Mitra"} color={primaryColor} />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Didukung Oleh</h2>
            </div>

            <div className="flex flex-wrap gap-3 justify-center items-center">
              {sponsors.map((sp: any, i: number) => (
                <div
                  key={i}
                  className="px-5 py-3 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center h-14 min-w-[120px]"
                >
                  {sp.logo ? (
                    <img src={sp.logo} alt={sp.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{sp.name}</span>
                  )}
                </div>
              ))}
            </div>

            {!sponsorSect && (
              <p className="text-center text-xs text-slate-400 mt-5">
                Tertarik menjadi sponsor? Hubungi panitia.
              </p>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION: CTA CARDS
        ══════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Siap Hadir?</h2>
              <p className="text-sm text-slate-500 mt-2">Daftar tiket atau cek status pendaftaranmu.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/daftar"
                className="group relative flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: primaryColor }} />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                >
                  <Ticket className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base mb-1.5">Daftar Tiket Pengunjung</h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1">
                  Registrasi untuk mendapatkan tiket digital acara Duta Genre Klaten 2026.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: primaryColor }}>
                  Daftar Sekarang
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                href="/cek-qr"
                className="group relative flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: secondaryColor }} />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${secondaryColor}12`, color: secondaryColor }}
                >
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base mb-1.5">Cek Tiket & Status</h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1">
                  Cek status pendaftaran dan tampilkan QR tiket menggunakan nama atau nomor.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: secondaryColor }}>
                  Cek Sekarang
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white py-6 px-4 text-center">
        <p className="text-[11px] text-slate-400 font-medium">{copyright}</p>
        <p className="text-[10px] text-slate-300 mt-1">Sistem E-Ticketing — genreklaten.web.id</p>
      </footer>

      {/* ── Popup Modal ── */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 relative">
            <button
              onClick={handleClosePopup}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {popup.image && (
              <img src={popup.image} alt={popup.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-5">
              <h3 className="text-base font-black text-slate-900 mb-2">{popup.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">{popup.text}</p>
              {popup.buttonText && (
                <Link
                  href={popup.buttonLink || "#"}
                  onClick={handleClosePopup}
                  className="block w-full py-2.5 text-white font-bold rounded-xl text-center text-sm hover:brightness-105 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  {popup.buttonText}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
