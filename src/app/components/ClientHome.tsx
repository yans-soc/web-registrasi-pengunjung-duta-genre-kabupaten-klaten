"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, CheckCircle, ArrowRight, QrCode, Ticket, MapPin, CalendarDays, Star, Clock3, X, Sparkles, ChevronRight, Award, ShieldCheck, HelpCircle } from "lucide-react";

interface ClientHomeProps {
  theme: any;
  typography: any;
  hero: any;
  popup: any;
  announcement: any;
  sections: any[];
  stats: { totalRegistered: number; totalCheckedIn: number; percentagePresent: number };
}

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const p = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          setCount(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(tick);
          else setCount(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

const DEFAULT_RUNDOWN = [
  { time: "08.00", title: "Registrasi & Check-In", desc: "Pemeriksaan tiket pengunjung" },
  { time: "09.00", title: "Pembukaan & Sambutan", desc: "Panitia dan tamu undangan" },
  { time: "10.00", title: "Penampilan Peserta I", desc: "Ajang unjuk bakat Duta Genre Klaten" },
  { time: "12.00", title: "Ishoma", desc: "Istirahat, Sholat, Makan Siang" },
  { time: "13.00", title: "Penampilan Peserta II", desc: "Sesi tanya jawab & presentasi program kerja" },
  { time: "15.30", title: "Penjurian", desc: "Penilaian menyeluruh oleh dewan juri ahli" },
  { time: "17.00", title: "Malam Puncak & Penutupan", desc: "Penganugerahan pemenang Duta Genre Klaten 2026" },
];

const DEFAULT_SPONSORS = [
  "Pemkab Klaten", "BKKBN", "DP3AKB", "Dinas Kesehatan", "BPBD Klaten", "Partner Media",
];

export default function ClientHome({ theme, typography, hero, popup, announcement, sections, stats }: ClientHomeProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showAnn, setShowAnn] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Tema Premium: Ungu Royal, Biru Elektrik, Kuning Gold
  const primary = theme.primary || "#6D28D9"; // Deep Purple Royal
  const secondary = theme.secondary || "#2563EB"; // Blue Electric
  const accent = theme.accent || "#D97706"; // Amber Gold

  const heroTitle = hero?.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026";
  const heroSubtitle = hero?.subtitle || "E-Ticketing Pengunjung Resmi";
  const heroDesc = hero?.description || "Portal registrasi tiket pengunjung resmi untuk acara Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.";
  const heroBtnText = hero?.buttonText || "Daftar Tiket Sekarang";
  const heroBtnLink = hero?.buttonLink || "/daftar";
  const heroBgImage = hero?.bgImage || "";
  const heroOverlay = hero?.overlay !== undefined ? hero.overlay / 100 : 0.8;

  const getSection = (slug: string) => sections.find((s) => s.slug === slug && s.isVisible);
  const rundownSect = getSection("rundown");
  const sponsorSect = getSection("sponsor");
  const lokasiSect = getSection("lokasi");
  const aboutSect = getSection("about") || getSection("tentang"); // check both formats
  const guestSect = getSection("guest-star");
  const footerSect = sections.find((s) => s.slug === "footer" && s.isVisible);

  const rundownEvents = rundownSect?.content?.events?.length ? rundownSect.content.events : DEFAULT_RUNDOWN;
  const sponsors: any[] = sponsorSect?.content?.sponsors?.length ? sponsorSect.content.sponsors.map((s: any) => s.name || s) : DEFAULT_SPONSORS;
  const mapUrl = lokasiSect?.content?.mapUrl || "";
  const venueAddress = lokasiSect?.content?.address || "Pendopo Pemkab Klaten, Jawa Tengah";
  const copyright = footerSect?.content?.copyright || "© 2026 Duta Genre Kabupaten Klaten";

  useEffect(() => {
    if (popup?.enabled) {
      const shown = sessionStorage.getItem("popup_shown");
      if (!shown) setShowPopup(true);
    }
  }, [popup]);

  useEffect(() => {
    if (theme.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = theme.favicon;
    }
  }, [theme.favicon]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closePopup = () => { setShowPopup(false); sessionStorage.setItem("popup_shown", "true"); };

  const { count: cReg, ref: rReg } = useCountUp(stats.totalRegistered);
  const { count: cIn, ref: rIn } = useCountUp(stats.totalCheckedIn);
  const { count: cPct, ref: rPct } = useCountUp(stats.percentagePresent);

  const marqueeItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <div className="min-h-screen bg-[#07050E] text-[#F3F4F6] overflow-x-hidden selection:bg-purple-600 selection:text-white" style={{ fontFamily: typography.bodyFont || "inherit" }}>
      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes pulse-slow { 0%,100% { transform: scale(1) translate(0px, 0px); opacity: 0.15; } 50% { transform: scale(1.15) translate(20px, -20px); opacity: 0.25; } }
        @keyframes pulse-slow-reverse { 0%,100% { transform: scale(1.1) translate(0px, 0px); opacity: 0.12; } 50% { transform: scale(0.95) translate(-15px, 20px); opacity: 0.2; } }
        .marquee-track { animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .fade-up-1 { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.08s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.15s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .fade-up-4 { animation: fadeUp 0.6s 0.22s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .fade-up-5 { animation: fadeUp 0.6s 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .live-dot { animation: blink 1.5s ease-in-out infinite; }
        .pulse-bg-1 { animation: pulse-slow 10s ease-in-out infinite; }
        .pulse-bg-2 { animation: pulse-slow-reverse 12s ease-in-out infinite; }
        h1, h2, h3, h4, h5, h6 { font-family: ${typography.headingFont || "inherit"} !important; }
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.015;
          mix-blend-mode: overlay;
        }
        .neon-glow {
          box-shadow: 0 0 25px -5px rgba(109, 40, 217, 0.3), 0 0 15px -3px rgba(37, 99, 235, 0.2);
        }
      `}</style>

      {/* ── Announcement ── */}
      {announcement?.enabled && showAnn && (
        <div className="relative z-50 flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-bold text-white shadow-md transition-all duration-300" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}>
          <span className="live-dot w-2.5 h-2.5 rounded-full bg-white shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span className="tracking-wide">{announcement.text}</span>
          <button onClick={() => setShowAnn(false)} className="ml-2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0 transition-all active:scale-90">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${announcement?.enabled && showAnn ? "mt-[44px]" : "mt-0"} ${scrolled ? "bg-[#07050E]/85 backdrop-blur-lg border-b border-white/[0.08] py-3.5 shadow-xl" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme.logo ? (
              <img src={theme.logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-md border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-purple-500/20" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>DG</div>
            )}
            <span className="font-extrabold text-sm tracking-widest text-white hidden sm:block">
              DUTA GENRE KLATEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">2026</span>
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <Link href="/cek-qr" className="inline-flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition-all bg-white/[0.05] hover:bg-white/[0.1] px-4.5 py-2.5 rounded-xl border border-white/[0.08]">
              <QrCode className="w-4 h-4 text-purple-400" /> Cek Tiket
            </Link>
            <Link href="/daftar" className="inline-flex items-center gap-2 text-xs font-extrabold px-5 py-2.5 rounded-xl text-white transition-all hover:shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:scale-[1.03] active:scale-95 border border-white/10" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
              <Ticket className="w-4 h-4" />
              <span>Daftar Sekarang</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col justify-end pb-24 sm:pb-32 overflow-hidden pt-36">
        {/* Background Atmosphere */}
        {heroBgImage ? (
          <div className="absolute inset-0 z-0">
            <img src={heroBgImage} alt="" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(7,5,14,1) 0%, rgba(7,5,14,${heroOverlay}) 70%, rgba(7,5,14,0.5) 100%)` }} />
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#07050E]" />
            {/* Elegant Atmospheric Glow */}
            <div className="absolute right-[-15%] top-[-10%] w-[900px] h-[900px] rounded-full blur-[180px] pulse-bg-1" style={{ backgroundColor: primary }} />
            <div className="absolute left-[-20%] bottom-[-15%] w-[800px] h-[800px] rounded-full blur-[160px] pulse-bg-2" style={{ backgroundColor: secondary }} />
            <div className="absolute right-[15%] bottom-[10%] w-[550px] h-[550px] rounded-full blur-[140px] opacity-10" style={{ backgroundColor: accent }} />
            
            {/* Custom geometric grids */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1.5px, transparent 1.5px)`, backgroundSize: "40px 40px" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07050E]/40 to-[#07050E]" />
            <div className="absolute inset-0 grain pointer-events-none" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full">
          {/* Eyebrow Label */}
          <div className="fade-up-1 flex items-center gap-2 mb-6">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">{heroSubtitle}</span>
          </div>

          {/* Heading */}
          <h1 className="fade-up-2 text-[clamp(2.2rem,6.8vw,5.5rem)] font-black leading-[1.0] tracking-tight text-white mb-8 max-w-5xl uppercase">
            {heroTitle.split(" ").map((word: string, i: number) => {
              const isHighlight = ["DUTA", "GENRE", "KLATEN", "2026", "APRESIASI", "PEMILIHAN"].includes(word.toUpperCase());
              return (
                <span key={i} className={isHighlight ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400" : ""}>
                  {word}{" "}
                </span>
              );
            })}
          </h1>

          {/* Description */}
          <p className="fade-up-3 text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mb-10 border-l-3 border-purple-500 pl-5">
            {heroDesc}
          </p>

          {/* Action Buttons */}
          <div className="fade-up-4 flex flex-wrap gap-4 items-center mb-16">
            <Link href={heroBtnLink} className="group inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl text-sm font-extrabold text-white transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-purple-900/30 border border-white/10 hover:border-white/20" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}>
              <Ticket className="w-5 h-5 text-white" />
              {heroBtnText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link href="/cek-qr" className="inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl text-sm font-bold text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all hover:scale-[1.01] backdrop-blur-md">
              <QrCode className="w-5 h-5 text-purple-400" />
              Cek Status Tiket
            </Link>
          </div>

          {/* Live Stats Board */}
          <div className="fade-up-5 grid grid-cols-3 gap-6 max-w-2xl p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-purple-500 to-transparent" />
            <div ref={rReg} className="text-center sm:text-left">
              <span className="block text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">{cReg.toLocaleString("id-ID")}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300">Pendaftar</span>
            </div>
            <div ref={rIn} className="text-center sm:text-left border-x border-white/10 px-4">
              <span className="block text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums" style={{ color: accent }}>{cIn.toLocaleString("id-ID")}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300">Hadir (Checked-In)</span>
            </div>
            <div ref={rPct} className="text-center sm:text-left">
              <span className="block text-3xl sm:text-4xl font-extrabold tracking-tight text-cyan-400 tabular-nums">{cPct}%</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300">Rasio Kehadiran</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <div className="w-[2px] h-14 rounded-full bg-gradient-to-b from-purple-500 to-transparent animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-purple-300">Scroll Down</span>
        </div>
      </section>

      {/* ══════════ INFO STRIP ══════════ */}
      <section className="relative z-10 border-y border-white/[0.08] bg-[#0C0A15]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {[
              { icon: <CalendarDays className="w-5 h-5" />, label: "Tahun Pelaksanaan 2026", color: "text-purple-400" },
              { icon: <MapPin className="w-5 h-5" />, label: venueAddress, color: "text-indigo-400" },
              { icon: <Ticket className="w-5 h-5" />, label: "E-Ticket QR Code Otomatis", color: "text-blue-400" },
              { icon: <Award className="w-5 h-5" />, label: "Apresiasi Genre Klaten", color: "text-amber-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3.5 py-6 px-6 text-sm text-gray-300 font-bold justify-center md:justify-start hover:bg-white/[0.02] transition-all">
                <span className={item.color}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TENTANG / ABOUT ══════════ */}
      {aboutSect && (
        <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#090710] overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[150px] opacity-10 pointer-events-none" style={{ backgroundColor: primary }} />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-6 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 shadow-sm">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                {aboutSect.name}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white mb-8 uppercase tracking-tight">
                {aboutSect.content?.heading || "Tentang Duta Genre"}
              </h2>
              <div className="text-gray-300 text-sm leading-relaxed space-y-5 max-w-none [&_p]:text-gray-300 [&_strong]:text-white [&_a]:text-purple-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: aboutSect.content?.description || "Informasi seputar acara." }} />
              <div className="pt-8">
                <Link href="/daftar" className="inline-flex items-center gap-2 text-sm font-extrabold text-purple-400 hover:text-purple-300 transition-colors group">
                  Daftar Tiket Pengunjung Sekarang <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              {aboutSect.content?.imageUrl ? (
                <div className="relative group">
                  <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
                  <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl bg-white/[0.02]">
                    <img src={aboutSect.content.imageUrl} alt="Tentang" className="w-full aspect-[4/3] object-cover hover:scale-103 transition-transform duration-700" />
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-3xl border border-white/[0.08] overflow-hidden flex flex-col items-center justify-center shadow-2xl bg-gradient-to-b from-white/[0.02] to-transparent p-8">
                  <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                  <Award className="w-16 h-16 text-purple-500/50 mb-4 animate-pulse" />
                  <span className="text-xl font-black tracking-widest text-purple-400/30 uppercase text-center">DUTA GENRE KLATEN</span>
                  <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Kolaborasi Generasi Berencana</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ RUNDOWN / TIMELINE ══════════ */}
      <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#07050E] overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.06] pointer-events-none" style={{ backgroundColor: secondary }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-20 border-b border-white/[0.08] pb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-4 text-purple-400">
                <Clock3 className="w-3.5 h-3.5" />
                {rundownSect?.name || "Rundown Acara"}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight uppercase">JADWAL & TIMELINE UTAMA</h2>
            </div>
            <p className="text-gray-400 text-sm max-w-sm border-l-2 border-purple-500 pl-4 leading-relaxed">
              Jadwal pelaksanaan malam puncak Apresiasi Duta Genre Klaten 2026. Susunan acara bersifat dinamis sesuai kondisi penyelenggaraan.
            </p>
          </div>

          {/* Timeline Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rundownEvents.map((evt: any, i: number) => {
              const isFirst = i === 0;
              return (
                <div key={i} className="group relative p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between min-h-[190px]">
                  <div className="absolute top-0 left-0 w-12 h-[1px] bg-gradient-to-r from-purple-500 to-transparent group-hover:w-20 transition-all duration-300" />
                  <div>
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-sm font-black tracking-wider px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 tabular-nums">
                        {evt.time}
                      </span>
                      {isFirst && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 live-dot flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Start
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg mb-2.5 group-hover:text-purple-300 transition-colors">
                      {evt.title || evt.name}
                    </h3>
                  </div>
                  {(evt.desc || evt.description) && (
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-auto pt-2">{evt.desc || evt.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ GUEST STAR ══════════ */}
      {guestSect && (
        <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#090710] overflow-hidden">
          <div className="absolute bottom-0 right-10 w-[600px] h-[600px] rounded-full blur-[170px] opacity-[0.08] pointer-events-none" style={{ backgroundColor: primary }} />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-4 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 shadow-sm">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                {guestSect.name}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">Bintang Tamu Spesial</h2>
            </div>
            
            {!(guestSect.content?.stars?.length) ? (
              <div className="text-center py-20 rounded-3xl border border-white/[0.06] bg-white/[0.01] max-w-xl mx-auto backdrop-blur-md">
                <Sparkles className="w-9 h-9 text-purple-500/40 mx-auto mb-4 animate-bounce" />
                <p className="text-gray-300 text-sm font-extrabold">Bintang Tamu Spesial Segera Dirilis!</p>
                <p className="text-gray-500 text-xs mt-1.5">Pantau terus pembaruan tiket dan detail acara.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(guestSect.content?.stars || []).map((star: any, i: number) => (
                  <div key={i} className="group relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0D0B14] hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-2 shadow-2xl">
                    {star.image ? (
                      <div className="relative aspect-square overflow-hidden bg-black">
                        <img src={star.image} alt={star.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B14] via-transparent to-transparent opacity-90" />
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-5xl font-black text-white/5 uppercase relative bg-gradient-to-br from-purple-500/10 to-transparent">
                        {star.name?.[0]}
                      </div>
                    )}
                    <div className="p-6 relative z-10 bg-[#0D0B14]">
                      <h4 className="font-extrabold text-white text-base tracking-tight mb-1.5 group-hover:text-purple-300 transition-colors">{star.name}</h4>
                      <p className="text-xs font-bold uppercase tracking-wider text-purple-400">{star.role || "Special Guest"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ VENUE / LOKASI ══════════ */}
      <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#07050E] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-20 border-b border-white/[0.08] pb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-4 text-purple-400">
                <MapPin className="w-3.5 h-3.5" />
                {lokasiSect?.name || "Venue & Lokasi"}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight uppercase">LOKASI PELAKSANAAN</h2>
            </div>
            <p className="text-gray-400 text-sm max-w-sm border-l-2 border-purple-500 pl-4 leading-relaxed">
              Panduan rute Google Maps untuk kenyamanan perjalanan Anda menuju lokasi malam puncak Duta Genre Klaten 2026.
            </p>
          </div>

          {mapUrl ? (
            <div className="rounded-3xl overflow-hidden border border-white/[0.08] w-full h-[380px] sm:h-[500px] shadow-2xl relative bg-white/[0.02]">
              <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="opacity-85 hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0E0B16] shadow-2xl relative">
              <div className="h-64 sm:h-80 flex flex-col items-center justify-center gap-5 relative overflow-hidden" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${primary}15, transparent)` }}>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-xl shadow-purple-500/25 border border-purple-400/30" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="text-center relative px-4">
                  <h3 className="font-extrabold text-white text-2xl uppercase tracking-tight">{venueAddress}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-2">Klaten, Jawa Tengah, Indonesia</p>
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] bg-white/[0.01]">
                <p className="text-gray-400 text-xs sm:text-sm font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-400" />Lokasi di Klaten. Akses transportasi mudah dijangkau.</p>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-6 py-3 rounded-xl text-white transition-all hover:shadow-lg border border-white/10"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                  Buka Peta Google
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ SPONSOR MARQUEE ══════════ */}
      <section className="py-20 border-y border-white/[0.08] bg-[#090710] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-10 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-purple-400 block mb-2">{sponsorSect?.name || "KOLABORATOR & SPONSOR"}</span>
          <p className="text-gray-400 text-sm font-bold">Mitra Strategis Pendukung Acara Duta Genre Klaten</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-r from-[#090710] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none bg-gradient-to-l from-[#090710] to-transparent" />
          <div className="flex marquee-track whitespace-nowrap">
            {marqueeItems.map((sp: any, i: number) => (
              <div key={i} className="inline-flex items-center justify-center px-12 py-4.5 mx-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] transition-all hover:border-purple-500/20">
                {typeof sp === "string" ? (
                  <span className="text-sm font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap uppercase tracking-wider">{sp}</span>
                ) : sp.logo ? (
                  <img src={sp.logo} alt={sp.name} className="h-6 object-contain opacity-55 hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-sm font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap uppercase tracking-wider">{sp.name || sp}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA SECTION ══════════ */}
      <section className="py-28 sm:py-36 px-6 sm:px-10 bg-[#07050E]">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-20 border border-purple-500/20 shadow-3xl" style={{ background: `linear-gradient(135deg, ${primary}15 0%, ${secondary}09 50%, ${accent}04 100%)` }}>
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
            <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none" style={{ backgroundColor: primary }} />
            <div className="absolute -left-12 -bottom-12 w-80 h-80 rounded-full blur-[100px] opacity-15 pointer-events-none" style={{ backgroundColor: accent }} />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.25em] mb-6 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Gratis · E-Ticket QR · Instant Check-In
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight uppercase mb-6">AMBIL TIKET GRATIS<br />SEKARANG JUGA</h2>
                  <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
                    Dapatkan e-ticket QR Code secara langsung untuk menghadiri Apresiasi Pemilihan Duta Genre Kabupaten Klaten 2026.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
                  <Link href="/daftar" className="group inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-sm font-extrabold text-white transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-purple-950/20 w-full lg:w-auto border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                    <Ticket className="w-5 h-5 text-white" />
                    Registrasi Tiket
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                  <Link href="/cek-qr" className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-sm font-bold text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] transition-all w-full lg:w-auto backdrop-blur-md">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    Cek Status Tiket Anda
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.08] bg-[#040308] py-12 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-[11px] shadow-md border border-white/10" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>DG</div>
            <p className="text-xs font-bold text-gray-500">{copyright}</p>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-gray-500 font-extrabold">
            <span className="hover:text-gray-400 transition-colors">genreklaten.web.id</span>
            <span className="w-[1px] h-3.5 bg-white/10" />
            <Link href="/admin/login" className="hover:text-purple-400 transition-colors">Dashboard Admin</Link>
          </div>
        </div>
      </footer>

      {/* ── Popup ── */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
          <div className="bg-[#0E0C15] rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/[0.1] relative">
            <button onClick={closePopup} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-gray-400 hover:text-white flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
            {popup.image && <img src={popup.image} alt={popup.title} className="w-full aspect-video object-cover opacity-90" />}
            <div className="p-6">
              <h3 className="text-lg font-black text-white mb-2 leading-tight">{popup.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">{popup.text}</p>
              {popup.buttonText && (
                <Link href={popup.buttonLink || "#"} onClick={closePopup}
                  className="flex w-full py-4 font-bold rounded-2xl text-center text-xs items-center justify-center gap-2 transition-all hover:shadow-lg border border-white/10 text-white"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                  {popup.buttonText} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
