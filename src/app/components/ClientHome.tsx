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

  // Check if any sections are configured
  const hasConfiguredSections = sections.some((s) => s.isVisible);
  const heroSection = sections.find((s) => s.slug === "hero" && s.isVisible);
  const hasHero = heroSection && hero?.enabled !== false;

  // Default fallback values
  const heroTitle =
    hero?.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026";
  const heroSubtitle = hero?.subtitle || "E-Ticketing Pengunjung Resmi";
  const heroDesc =
    hero?.description ||
    "Portal registrasi tiket pengunjung resmi untuk acara Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.";
  const heroBtnText = hero?.buttonText || "Daftar Tiket Sekarang";
  const heroBtnLink = hero?.buttonLink || "/daftar";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bgColor, color: textColor, fontFamily: bodyFont }}
    >
      <style jsx global>{`
        h1, h2, h3, h4, h5, h6 { font-family: ${headingFont} !important; }
        * { box-sizing: border-box; }
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
            className="ml-3 p-0.5 rounded opacity-80 hover:opacity-100 transition-opacity"
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
              <img
                src={theme.logo}
                alt="Logo"
                className="w-8 h-8 object-contain rounded-lg"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
                style={{ backgroundColor: primaryColor }}
              >
                DG
              </div>
            )}
            <div className="leading-tight">
              <p className="font-bold text-slate-900 text-sm leading-none">
                Duta Genre Klaten 2026
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Sistem E-Ticketing
              </p>
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

      {/* ── Main Content ── */}
      <main className="flex-1">

        {/* ── HERO ── (always shown, with or without sections config) */}
        {(!hasConfiguredSections || hasHero) && (
          <section
            className="relative overflow-hidden"
            style={{
              backgroundImage: hero?.bgImage ? `url(${hero.bgImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Gradient background when no image */}
            {!hero?.bgImage && (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}08 0%, ${accentColor}06 50%, ${secondaryColor}05 100%)`,
                }}
              />
            )}

            {/* Overlay for bg image */}
            {hero?.bgImage && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: "black",
                  opacity: hero.overlay !== undefined ? hero.overlay / 100 : 0.55,
                }}
              />
            )}

            {/* Decorative grid */}
            {!hero?.bgImage && (
              <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage: `radial-gradient(circle, ${primaryColor} 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }}
              />
            )}

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border"
                  style={
                    hero?.bgImage
                      ? {
                          backgroundColor: "rgba(255,255,255,0.15)",
                          color: "#ffffff",
                          borderColor: "rgba(255,255,255,0.25)",
                        }
                      : {
                          backgroundColor: `${primaryColor}12`,
                          color: primaryColor,
                          borderColor: `${primaryColor}25`,
                        }
                  }
                >
                  <Star className="w-3 h-3" />
                  {heroSubtitle}
                </span>
              </div>

              {/* Title */}
              <h1
                className={`text-center text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5 ${
                  hero?.bgImage ? "text-white" : "text-slate-900"
                }`}
              >
                {heroTitle}
              </h1>

              {/* Description */}
              <p
                className={`text-center text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-10 ${
                  hero?.bgImage ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {heroDesc}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14">
                <Link
                  href={heroBtnLink}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl hover:brightness-105 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Ticket className="w-4 h-4" />
                  {heroBtnText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/cek-qr"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 font-bold rounded-xl text-sm border transition-all ${
                    hero?.bgImage
                      ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Cek Tiket / Status
                </Link>
              </div>

              {/* Stats Card */}
              <div className="max-w-2xl mx-auto">
                <div
                  className={`rounded-2xl border ${
                    hero?.bgImage
                      ? "bg-white/10 backdrop-blur-sm border-white/15"
                      : "bg-white border-slate-100 shadow-lg shadow-slate-100/80"
                  }`}
                >
                  <div className="grid grid-cols-3 divide-x divide-slate-100/50">
                    {[
                      {
                        label: "Pendaftar",
                        value: stats.totalRegistered,
                        icon: <Users className="w-4 h-4" />,
                        color: primaryColor,
                      },
                      {
                        label: "Check-In",
                        value: stats.totalCheckedIn,
                        icon: <CheckCircle className="w-4 h-4" />,
                        color: secondaryColor,
                      },
                      {
                        label: "Hadir",
                        value: `${stats.percentagePresent}%`,
                        icon: <Clock className="w-4 h-4" />,
                        color: accentColor,
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center py-5 px-3 gap-1.5"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
                          style={{
                            backgroundColor: hero?.bgImage
                              ? "rgba(255,255,255,0.15)"
                              : `${stat.color}12`,
                            color: hero?.bgImage ? "#fff" : stat.color,
                          }}
                        >
                          {stat.icon}
                        </div>
                        <span
                          className={`text-xl sm:text-2xl font-black tabular-nums ${
                            hero?.bgImage ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {stat.value}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            hero?.bgImage ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Quick Info Strip ── (always shown if no custom sections) */}
        {(!hasConfiguredSections || !sections.find((s) => s.slug === "about" && s.isVisible)) && (
          <section className="border-y border-slate-100 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="font-medium">2026</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="font-medium">Kabupaten Klaten, Jawa Tengah</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="font-medium">Tiket Digital</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Dynamic Sections from DB ── */}
        {sections.map((sect) => {
          if (!sect.isVisible) return null;

          switch (sect.slug) {
            case "hero":
              // Already rendered above
              return null;

            case "about": {
              const desc = sect.content?.description || "";
              const imgUrl = sect.content?.imageUrl || "";
              return (
                <section
                  key={sect.id}
                  className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-100"
                >
                  <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
                      {imgUrl && (
                        <div className="w-full md:w-2/5 shrink-0">
                          <img
                            src={imgUrl}
                            alt="Tentang Acara"
                            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md border border-slate-100"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 mb-4">
                          <div
                            className="w-6 h-0.5 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            {sect.name}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">
                          Mengenal Pemilihan Duta Genre
                        </h2>
                        <div
                          className="text-slate-500 text-sm leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: desc || "Informasi seputar acara.",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              );
            }

            case "rundown": {
              const events = sect.content?.events || [];
              return (
                <section
                  key={sect.id}
                  className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50 border-b border-slate-100"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          {sect.name}
                        </span>
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Jadwal & Agenda Acara
                      </h2>
                    </div>

                    {events.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-8">
                        Rundown akan segera diumumkan.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {events.map((evt: any, i: number) => (
                          <div
                            key={i}
                            className="flex gap-4 items-start bg-white rounded-xl border border-slate-100 px-5 py-4 shadow-sm"
                          >
                            <div
                              className="shrink-0 text-xs font-black mt-0.5 w-16 tabular-nums"
                              style={{ color: primaryColor }}
                            >
                              {evt.time}
                            </div>
                            <div className="w-px bg-slate-100 self-stretch" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{evt.title}</p>
                              {evt.description && (
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  {evt.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            case "guest-star": {
              const stars = sect.content?.stars || [];
              return (
                <section
                  key={sect.id}
                  className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-100"
                >
                  <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          {sect.name}
                        </span>
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Bintang Tamu Spesial
                      </h2>
                    </div>

                    {stars.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-8">
                        Bintang tamu akan segera diumumkan.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        {stars.map((star: any, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm text-center"
                          >
                            {star.image ? (
                              <img
                                src={star.image}
                                alt={star.name}
                                className="w-full aspect-square object-cover"
                              />
                            ) : (
                              <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-300">
                                <Award className="w-10 h-10" />
                              </div>
                            )}
                            <div className="p-3.5">
                              <p className="font-bold text-slate-900 text-sm">{star.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {star.role || "Special Guest"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            case "sponsor": {
              const sponsors = sect.content?.sponsors || [];
              return (
                <section
                  key={sect.id}
                  className="py-14 px-4 sm:px-6 bg-slate-50 border-b border-slate-100"
                >
                  <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                      <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          {sect.name}
                        </span>
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        Didukung Oleh
                      </h2>
                    </div>

                    {sponsors.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm py-4">
                        Partner & sponsor resmi acara.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-4 justify-center items-center">
                        {sponsors.map((sp: any, i: number) => (
                          <div
                            key={i}
                            className="px-5 py-3 bg-white rounded-xl border border-slate-100 shadow-sm h-14 w-32 flex items-center justify-center"
                          >
                            {sp.logo ? (
                              <img
                                src={sp.logo}
                                alt={sp.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {sp.name}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            case "lokasi": {
              const mapUrl = sect.content?.mapUrl || "";
              return (
                <section
                  key={sect.id}
                  className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-100"
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          {sect.name}
                        </span>
                        <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Lokasi Acara
                      </h2>
                    </div>

                    {mapUrl ? (
                      <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                        <iframe
                          src={mapUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        Peta lokasi belum disematkan.
                      </div>
                    )}
                  </div>
                </section>
              );
            }

            case "footer":
              return null; // Rendered below

            default:
              return null;
          }
        })}

        {/* ── CTA Section ── (only shown when no custom sections or after sections) */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daftar Card */}
              <Link
                href="/daftar"
                className="group relative flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ backgroundColor: primaryColor }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                  }}
                >
                  <Ticket className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base mb-1.5">
                  Daftar Tiket Pengunjung
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1">
                  Registrasi untuk mendapatkan tiket digital acara Duta Genre Klaten 2026.
                </p>
                <div
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: primaryColor }}
                >
                  Daftar Sekarang
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Cek QR Card */}
              <Link
                href="/cek-qr"
                className="group relative flex flex-col p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ backgroundColor: secondaryColor }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${secondaryColor}12`,
                    color: secondaryColor,
                  }}
                >
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base mb-1.5">
                  Cek Tiket & Status
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1">
                  Cek status pendaftaran dan tampilkan QR tiket menggunakan nomor atau nama.
                </p>
                <div
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: secondaryColor }}
                >
                  Cek Sekarang
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      {(() => {
        const footerSect = sections.find((s) => s.slug === "footer" && s.isVisible);
        const copyright =
          footerSect?.content?.copyright ||
          "© 2026 Duta Genre Kabupaten Klaten. All Rights Reserved.";
        return (
          <footer className="border-t border-slate-100 bg-white py-6 px-4 text-center">
            <p className="text-[11px] text-slate-400 font-medium">{copyright}</p>
            <p className="text-[10px] text-slate-300 mt-1">
              Sistem E-Ticketing — genreklaten.web.id
            </p>
          </footer>
        );
      })()}

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
              <img
                src={popup.image}
                alt={popup.title}
                className="w-full aspect-video object-cover"
              />
            )}
            <div className="p-5">
              <h3 className="text-base font-black text-slate-900 mb-2">
                {popup.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                {popup.text}
              </p>
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
