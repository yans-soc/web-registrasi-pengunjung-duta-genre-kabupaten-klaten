"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CheckCircle, Clock, MapPin, Calendar, Award, X } from "lucide-react";

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

  // Theme settings - Spec Colors: Orange, Red, Gold
  const primaryColor = theme.primary || "#EA580C";
  const secondaryColor = theme.secondary || "#DC2626";
  const accentColor = theme.accent || "#F59E0B";
  const bgColor = theme.background || "#FFF8F2";
  const textColor = theme.text || "#111827";

  // Typography settings
  const headingFont = typography.headingFont || "var(--font-geist-sans)";
  const bodyFont = typography.bodyFont || "var(--font-geist-sans)";

  useEffect(() => {
    if (popup && popup.enabled) {
      // Check if popup has already been shown in this session
      const shown = sessionStorage.getItem("popup_shown");
      if (!shown) {
        setShowPopup(true);
      }
    }
  }, [popup]);

  useEffect(() => {
    if (theme.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = theme.favicon;
    }
  }, [theme.favicon]);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("popup_shown", "true");
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
      }}
    >
      {/* Dynamic Styling */}
      <style jsx global>{`
        h1, h2, h3, h4, h5, h6 {
          font-family: ${headingFont} !important;
        }
      `}</style>

      {/* Announcement Bar */}
      {announcement && announcement.enabled && showAnnouncement && (
        <div className="w-full text-white px-4 py-2 text-xs sm:text-sm font-semibold flex justify-between items-center z-50" style={{ backgroundColor: "#EA580C" }}>
          <div className="mx-auto text-center">{announcement.text}</div>
          <button onClick={() => setShowAnnouncement(false)} className="text-white hover:text-amber-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {theme.logo ? (
              <img src={theme.logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                DG
              </div>
            )}
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                Duta Genre Klaten 2026
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Sistem E-Ticketing Pengunjung
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
        <Link
          href="/admin/login"
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#EA580C] transition-colors"
        >
              Portal Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Dynamic Sections Container */}
      <div className="flex-1 flex flex-col">
        {/* Render Sections based on database configs */}
        {sections.map((sect) => {
          if (!sect.isVisible) return null;

          switch (sect.slug) {
            case "hero":
              const isHeroEnabled = hero && hero.enabled !== false;
              if (!isHeroEnabled) return null;
              return (
                <section
                  key={sect.id}
                  className="relative py-20 px-6 text-center flex flex-col items-center justify-center border-b border-slate-100 overflow-hidden"
                  style={{
                    backgroundImage: hero.bgImage ? `url(${hero.bgImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Overlay for readability */}
                  {hero.bgImage && (
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundColor: "black",
                        opacity: hero.overlay !== undefined ? hero.overlay / 100 : 0.5,
                      }}
                    />
                  )}

                  <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-6 inline-block"
                      style={{
                        backgroundColor: hero.bgImage ? "rgba(255,255,255,0.2)" : `${primaryColor}15`,
                        color: hero.bgImage ? "#ffffff" : primaryColor,
                        border: hero.bgImage ? "1px solid rgba(255,255,255,0.3)" : "none",
                      }}
                    >
                      {hero.subtitle || "Registrasi Pengunjung Dibuka"}
                    </span>
                    <h2
                      className={`text-3xl sm:text-5xl font-black tracking-tight mb-6 leading-tight ${
                        hero.bgImage ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {hero.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026"}
                    </h2>
                    <p
                      className={`text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${
                        hero.bgImage ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {hero.description ||
                        "Selamat datang di portal e-ticketing resmi pengunjung Apresiasi & Pemilihan Duta Genre Klaten 2026."}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                      <Link
                        href={hero.buttonLink || "/daftar"}
                        className="w-full sm:w-auto px-8 py-4 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all text-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {hero.buttonText || "Daftar Tiket Pengunjung"}
                      </Link>
                      <Link
                        href="/cek-qr"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-colors text-center"
                      >
                        Cek Status & Cari Tiket
                      </Link>
                    </div>

                    {/* Real-time Stats Widget */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 text-left">
                      <div className="flex flex-col items-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                          style={{
                            backgroundColor: `${primaryColor}10`,
                            color: primaryColor,
                          }}
                        >
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">
                          {stats.totalRegistered}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
                          Total Pendaftar
                        </span>
                      </div>

                      <div className="flex flex-col items-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                          style={{
                            backgroundColor: `${secondaryColor}10`,
                            color: secondaryColor,
                          }}
                        >
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">
                          {stats.totalCheckedIn}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
                          Hadir (Check-In)
                        </span>
                      </div>

                      <div className="flex flex-col items-center p-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                          style={{
                            backgroundColor: `${accentColor}10`,
                            color: accentColor,
                          }}
                        >
                          <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">
                          {stats.percentagePresent}%
                        </span>
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
                          Tingkat Kehadiran
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case "about":
              const desc = sect.content?.description || "";
              const imgUrl = sect.content?.imageUrl || "";
              return (
                <section key={sect.id} className="py-16 px-6 bg-white border-b border-slate-100">
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
                    {imgUrl && (
                      <div className="w-full md:w-1/3">
                        <img
                          src={imgUrl}
                          alt="Tentang Acara"
                          className="w-full h-auto rounded-2xl shadow-lg border border-slate-100 object-cover max-h-64"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {sect.name}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 leading-snug">
                        Mengenal Pemilihan Duta Genre
                      </h3>
                      <div
                        className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: desc || "Informasi seputar acara." }}
                      />
                    </div>
                  </div>
                </section>
              );

            case "rundown":
              const events = sect.content?.events || [];
              return (
                <section key={sect.id} className="py-16 px-6 bg-slate-50 border-b border-slate-100">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                      <div className="flex justify-center items-center gap-2 mb-3">
                        <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {sect.name}
                        </span>
                        <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Jadwal & Agenda Acara</h3>
                    </div>

                    {events.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm">Rundown akan segera diumumkan.</p>
                    ) : (
                      <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 sm:before:left-1/2 before:w-0.5 before:bg-slate-200">
                        {events.map((evt: any, i: number) => (
                          <div
                            key={i}
                            className={`flex flex-col sm:flex-row items-stretch sm:justify-between relative ${
                              i % 2 === 0 ? "" : "sm:flex-row-reverse"
                            }`}
                          >
                            <div className="absolute left-4 sm:left-1/2 w-4 h-4 bg-white border-2 rounded-full transform -translate-x-1.5 sm:-translate-x-2 z-10" style={{ borderColor: primaryColor }} />
                            <div className="w-full sm:w-[45%] pl-8 sm:pl-0 sm:text-right">
                              {i % 2 === 0 ? (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                  <span className="text-xs font-black" style={{ color: primaryColor }}>{evt.time}</span>
                                  <h4 className="text-sm font-bold text-slate-900 mt-1">{evt.title}</h4>
                                  {evt.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{evt.description}</p>}
                                </div>
                              ) : null}
                            </div>
                            <div className="w-full sm:w-[45%] pl-8 sm:pl-0 sm:text-left">
                              {i % 2 !== 0 ? (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                  <span className="text-xs font-black" style={{ color: primaryColor }}>{evt.time}</span>
                                  <h4 className="text-sm font-bold text-slate-900 mt-1">{evt.title}</h4>
                                  {evt.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{evt.description}</p>}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );

            case "guest-star":
              const stars = sect.content?.stars || [];
              return (
                <section key={sect.id} className="py-16 px-6 bg-white border-b border-slate-100">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                      <div className="flex justify-center items-center gap-2 mb-3">
                        <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {sect.name}
                        </span>
                        <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Bintang Tamu Spesial</h3>
                    </div>

                    {stars.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm">Bintang tamu akan segera diumumkan.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                        {stars.map((star: any, i: number) => (
                          <div key={i} className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-100 text-center">
                            {star.image ? (
                              <img src={star.image} alt={star.name} className="w-full h-48 object-cover" />
                            ) : (
                              <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">
                                <Award className="w-12 h-12" />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="font-bold text-slate-900 text-sm">{star.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">{star.role || "Special Guest"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );

            case "sponsor":
              const sponsors = sect.content?.sponsors || [];
              return (
                <section key={sect.id} className="py-16 px-6 bg-slate-50 border-b border-slate-100">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="flex justify-center items-center gap-2 mb-3">
                        <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {sect.name}
                        </span>
                        <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Didukung Oleh</h3>
                    </div>

                    {sponsors.length === 0 ? (
                      <p className="text-center text-slate-400 text-sm">Sponsor & Partners resmi acara.</p>
                    ) : (
                      <div className="flex flex-wrap gap-8 justify-center items-center">
                        {sponsors.map((sp: any, i: number) => (
                          <div key={i} className="p-4 bg-white rounded-xl shadow-xs border border-slate-100 h-16 w-36 flex items-center justify-center overflow-hidden">
                            {sp.logo ? (
                              <img src={sp.logo} alt={sp.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">{sp.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );

            case "lokasi":
              const mapUrl = sect.content?.mapUrl || "";
              return (
                <section key={sect.id} className="py-16 px-6 bg-slate-50 border-b border-slate-100">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center items-center gap-2 mb-3">
                      <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {sect.name}
                      </span>
                      <div className="w-8 h-1" style={{ backgroundColor: primaryColor }} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">Lokasi & Peta Acara</h3>

                    {mapUrl ? (
                      <div className="w-full h-80 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                        <iframe
                          src={mapUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Peta lokasi belum disematkan.</p>
                    )}
                  </div>
                </section>
              );

            case "footer":
              const copyright = sect.content?.copyright || "© 2026 Duta Genre Kabupaten Klaten. All Rights Reserved.";
              return (
                <footer key={sect.id} className="bg-white border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-400 font-medium">
                  <p>{copyright}</p>
                  <p className="mt-1.5 text-slate-400">Created with Precision & Care.</p>
                </footer>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* Modal Popup Builder */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative border border-slate-100">
            <button
              onClick={handleClosePopup}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {popup.image && (
              <img src={popup.image} alt={popup.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-lg font-black text-slate-900 mb-2">{popup.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{popup.text}</p>
              {popup.buttonText && (
                <Link
                  href={popup.buttonLink || "#"}
                  onClick={handleClosePopup}
                  className="block w-full py-3 text-white font-bold rounded-xl text-center shadow-lg hover:brightness-110 transition-all text-sm"
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
