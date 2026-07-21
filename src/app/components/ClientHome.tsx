"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users, CheckCircle, ArrowRight, QrCode, Ticket,
  MapPin, CalendarDays, Star, Clock3, X, Sparkles,
  ChevronRight, Award, ShieldCheck
} from "lucide-react";

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

  const primary = theme.primary || "#7C3AED";
  const secondary = theme.secondary || "#1D4ED8";
  const accent = theme.accent || "#F59E0B";

  const heroTitle = hero?.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026";
  const heroSubtitle = hero?.subtitle || "E-Ticketing Pengunjung Resmi";
  const heroDesc = hero?.description || "Portal registrasi tiket pengunjung resmi untuk acara Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.";
  const heroBtnText = hero?.buttonText || "Daftar Tiket Sekarang";
  const heroBtnLink = hero?.buttonLink || "/daftar";
  const heroBgImage = hero?.bgImage || "";
  const heroOverlay = hero?.overlay !== undefined ? hero.overlay / 100 : 0.82;

  const getSection = (slug: string) => sections.find((s) => s.slug === slug && s.isVisible);
  const rundownSect = getSection("rundown");
  const sponsorSect = getSection("sponsor");
  const lokasiSect = getSection("lokasi");
  const aboutSect = getSection("about") || getSection("tentang");
  const guestSect = getSection("guest-star");
  const footerSect = sections.find((s) => s.slug === "footer" && s.isVisible);

  const rundownEvents = rundownSect?.content?.events?.length ? rundownSect.content.events : DEFAULT_RUNDOWN;
  const sponsors: any[] = sponsorSect?.content?.sponsors?.length
    ? sponsorSect.content.sponsors.map((s: any) => s.name || s)
    : DEFAULT_SPONSORS;
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
    <div
      className="min-h-screen bg-[#050408] text-white overflow-x-hidden"
      style={{ fontFamily: typography.bodyFont || "inherit" }}
    >
      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.25; } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes grain-move {
          0%,100% { transform: translate(0,0); }
          10% { transform: translate(-2%,-2%); }
          30% { transform: translate(2%,2%); }
          50% { transform: translate(-1%,2%); }
          70% { transform: translate(2%,-1%); }
          90% { transform: translate(-2%,1%); }
        }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .fade-up-1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .fade-up-2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .fade-up-3 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .fade-up-4 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        .fade-up-5 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s both; }
        .slide-in { animation: slideIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .live-dot { animation: blink 1.4s ease-in-out infinite; }
        .float-anim { animation: float 5s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 20s linear infinite; }
        h1,h2,h3,h4,h5,h6 { font-family: ${typography.headingFont || "inherit"} !important; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #050408; }
        ::-webkit-scrollbar-thumb { background: ${primary}55; border-radius: 99px; }

        /* Noise texture */
        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.018;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* Number ticker */
        .ticker { font-variant-numeric: tabular-nums; }

        /* Section label underline */
        .section-label::after {
          content: '';
          display: block;
          width: 24px;
          height: 2px;
          background: ${primary};
          margin-top: 6px;
        }

        /* Card hover lift */
        .card-lift { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease; }
        .card-lift:hover { transform: translateY(-6px); box-shadow: 0 24px 60px -12px ${primary}30; }

        /* Line clamp */
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* Hero text stroke */
        .text-stroke {
          -webkit-text-stroke: 1px rgba(255,255,255,0.08);
          color: transparent;
        }
        
        /* Gradient text */
        .grad-text {
          background: linear-gradient(135deg, ${primary}, ${secondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Timeline connector */
        .tl-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 19px;
          top: 44px;
          width: 2px;
          height: calc(100% - 20px);
          background: linear-gradient(to bottom, ${primary}60, transparent);
        }
      `}</style>

      {/* ── Announcement Bar ── */}
      {announcement?.enabled && showAnn && (
        <div
          className="relative z-50 flex items-center justify-center gap-2 py-2.5 px-4 text-[11px] font-semibold tracking-wide text-white"
          style={{ background: `linear-gradient(90deg, ${primary}EE, ${secondary}EE)` }}
        >
          <span className="live-dot w-2 h-2 rounded-full bg-white/80 shrink-0" />
          <span>{announcement.text}</span>
          <button
            onClick={() => setShowAnn(false)}
            className="ml-3 w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={`fixed left-0 right-0 z-40 transition-all duration-500 ${announcement?.enabled && showAnn ? "top-[36px]" : "top-0"}`}>
        <div className={`transition-all duration-500 ${scrolled ? "bg-[#050408]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl" : "bg-transparent"}`}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              {theme.logo ? (
                <img src={theme.logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[11px] tracking-wider"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  DG
                </div>
              )}
              <div className="hidden sm:block">
                <span className="text-[11px] font-black tracking-[0.2em] text-white/90 uppercase leading-none block">Duta Genre</span>
                <span className="text-[9px] font-semibold tracking-[0.15em] uppercase leading-none" style={{ color: primary }}>Kabupaten Klaten</span>
              </div>
            </div>

            {/* Nav Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/cek-qr"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/60 hover:text-white/90 transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.05]"
              >
                <QrCode className="w-3.5 h-3.5" />
                Cek Tiket
              </Link>
              <Link
                href="/daftar"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              >
                <Ticket className="w-3.5 h-3.5" />
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden noise">
        {/* BG */}
        {heroBgImage ? (
          <div className="absolute inset-0 z-0">
            <img src={heroBgImage} alt="" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(5,4,8,1) 10%, rgba(5,4,8,${heroOverlay}) 60%, rgba(5,4,8,0.4) 100%)` }} />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-[#050408]">
            {/* Abstract SVG shape — top right */}
            <svg className="absolute right-0 top-0 w-[700px] h-[700px] opacity-[0.07]" viewBox="0 0 700 700" fill="none">
              <circle cx="500" cy="200" r="400" stroke={primary} strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="500" cy="200" r="280" stroke={secondary} strokeWidth="1" strokeDasharray="2 12" />
            </svg>
            {/* Blob glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[200px] opacity-[0.13]" style={{ backgroundColor: primary }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.1]" style={{ backgroundColor: secondary }} />
            {/* Fine grid */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: `linear-gradient(${primary}40 1px, transparent 1px), linear-gradient(90deg, ${primary}40 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050408]" />
          </div>
        )}

        {/* Floating accent number — decorative */}
        <div className="absolute right-[8%] top-[22%] hidden lg:block select-none pointer-events-none">
          <span className="text-[180px] font-black text-stroke leading-none float-anim"
            style={{ WebkitTextStroke: `1px ${primary}18` }}>
            26
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full pt-32 pb-24 sm:pt-40 sm:pb-32">
          {/* Eyebrow */}
          <div className="fade-up-1 flex items-center gap-3 mb-7">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ borderColor: `${primary}40`, backgroundColor: `${primary}10`, color: primary }}>
              <span className="live-dot w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
              {heroSubtitle}
            </div>
            <div className="flex-1 max-w-[80px] h-[1px]" style={{ background: `linear-gradient(90deg, ${primary}50, transparent)` }} />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">2026</span>
          </div>

          {/* Main Heading */}
          <h1 className="fade-up-2 font-black leading-[0.95] tracking-tight text-white mb-8 uppercase"
            style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)" }}>
            {(() => {
              const words = heroTitle.split(" ");
              const highlights = ["DUTA", "GENRE", "KLATEN", "2026", "APRESIASI", "PEMILIHAN"];
              return words.map((word: string, i: number) => (
                <span key={i} className={highlights.includes(word.toUpperCase()) ? "grad-text" : ""}>{word} </span>
              ));
            })()}
          </h1>

          {/* Desc */}
          <p className="fade-up-3 text-white/50 text-sm sm:text-[15px] max-w-xl leading-relaxed mb-10 font-normal">
            {heroDesc}
          </p>

          {/* CTAs */}
          <div className="fade-up-4 flex flex-wrap gap-3 mb-16">
            <Link
              href={heroBtnLink}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <Ticket className="w-4 h-4" />
              {heroBtnText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/cek-qr"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-all border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] backdrop-blur-md"
            >
              <QrCode className="w-4 h-4" style={{ color: primary }} />
              Cek Status Tiket
            </Link>
          </div>

          {/* Stats */}
          <div className="fade-up-5">
            <div className="inline-grid grid-cols-3 divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-xl"
              style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
              {[
                { ref: rReg, val: cReg, label: "Pendaftar", suffix: "" },
                { ref: rIn, val: cIn, label: "Hadir", suffix: "" },
                { ref: rPct, val: cPct, label: "Kehadiran", suffix: "%" },
              ].map((s, i) => (
                <div key={i} ref={s.ref} className="flex flex-col items-center justify-center px-6 py-4 sm:px-8 sm:py-5 gap-0.5">
                  <span className="ticker text-2xl sm:text-3xl font-black text-white leading-none">
                    {s.val.toLocaleString("id-ID")}{s.suffix}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/35 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30 pointer-events-none">
          <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent" />
          <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white">scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INFO STRIP
      ══════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-[#080610]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
            {[
              { icon: <CalendarDays className="w-4 h-4" />, text: "2026", sub: "Tahun Pelaksanaan" },
              { icon: <MapPin className="w-4 h-4" />, text: venueAddress.split(",")[0], sub: "Lokasi Acara" },
              { icon: <Ticket className="w-4 h-4" />, text: "E-Ticket QR", sub: "Tiket Digital Otomatis" },
              { icon: <Award className="w-4 h-4" />, text: "Duta Genre", sub: "Apresiasi Klaten" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center md:items-start gap-1 py-5 px-5 md:px-6">
                <span className="text-white/30 mb-1" style={{ color: i === 0 ? primary : i === 1 ? secondary : i === 2 ? primary : accent }}>{item.icon}</span>
                <span className="text-sm font-bold text-white/80 truncate max-w-[150px]">{item.text}</span>
                <span className="text-[10px] text-white/30 font-medium">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ABOUT
      ══════════════════════════════════════ */}
      {aboutSect && (
        <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden bg-[#050408]">
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              {/* Text */}
              <div>
                <p className="section-label text-[10px] font-black uppercase tracking-[0.25em] mb-6" style={{ color: primary }}>
                  {aboutSect.name}
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.05] uppercase tracking-tight mb-7">
                  {aboutSect.content?.heading || "Tentang Duta Genre"}
                </h2>
                <div
                  className="text-white/50 text-sm leading-[1.9] space-y-4 [&_p]:text-white/50 [&_strong]:text-white/80 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: aboutSect.content?.description || "Informasi seputar acara." }}
                />
                <Link
                  href="/daftar"
                  className="inline-flex items-center gap-2 mt-8 text-sm font-bold group transition-colors"
                  style={{ color: primary }}
                >
                  Daftar Tiket Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Visual */}
              <div className="relative">
                {aboutSect.content?.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/[0.06]">
                    <img src={aboutSect.content.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050408]/60 to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-2xl border border-white/[0.06] overflow-hidden flex items-center justify-center relative"
                    style={{ background: `radial-gradient(ellipse at center, ${primary}12 0%, transparent 70%)` }}>
                    {/* Decorative rings */}
                    <div className="absolute w-48 h-48 rounded-full border border-white/[0.04] spin-slow" />
                    <div className="absolute w-72 h-72 rounded-full border border-dashed border-white/[0.03]" style={{ animation: "spin-slow 30s linear infinite reverse" }} />
                    <div className="relative flex flex-col items-center gap-3 text-center">
                      <Award className="w-10 h-10" style={{ color: `${primary}80` }} />
                      <span className="text-2xl font-black uppercase tracking-wider text-white/10">Duta Genre</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Generasi Berencana Klaten</span>
                    </div>
                  </div>
                )}
                {/* Accent badge */}
                <div className="absolute -bottom-3 -right-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-white border border-white/[0.08]"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                  Klaten 2026
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          RUNDOWN / TIMELINE
      ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative bg-[#080610] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.05] pointer-events-none" style={{ backgroundColor: secondary }} />
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="section-label text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: secondary }}>
                {rundownSect?.name || "Rundown"}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.05]">
                Jadwal &<br />Timeline Acara
              </h2>
            </div>
            <p className="text-white/35 text-sm max-w-xs leading-relaxed sm:text-right">
              Susunan acara bersifat dinamis mengikuti kondisi hari pelaksanaan.
            </p>
          </div>

          {/* Timeline — vertical on mobile, grid on desktop */}
          <div className="block lg:hidden space-y-0">
            {rundownEvents.map((evt: any, i: number) => (
              <div key={i} className="tl-item relative flex gap-5 pb-8">
                {/* Dot */}
                <div className="flex-shrink-0 mt-1 relative">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border"
                    style={{
                      background: i === 0 ? `linear-gradient(135deg, ${primary}, ${secondary})` : "transparent",
                      borderColor: i === 0 ? "transparent" : `${primary}30`,
                      color: i === 0 ? "white" : primary
                    }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="pt-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md mb-2 inline-block"
                    style={{ backgroundColor: `${primary}15`, color: primary }}>
                    {evt.time}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-1">{evt.title || evt.name}</h3>
                  {(evt.desc || evt.description) && (
                    <p className="text-xs text-white/35 leading-relaxed">{evt.desc || evt.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-4">
            {rundownEvents.map((evt: any, i: number) => (
              <div key={i}
                className="card-lift group relative p-6 rounded-xl border cursor-default"
                style={{
                  background: i === 0 ? `linear-gradient(135deg, ${primary}20, ${secondary}10)` : "rgba(255,255,255,0.02)",
                  borderColor: i === 0 ? `${primary}40` : "rgba(255,255,255,0.06)"
                }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[11px] font-black px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: `${primary}15`, color: primary }}>
                    {evt.time}
                  </span>
                  <span className="text-[10px] font-bold text-white/20">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 group-hover:opacity-80 transition-opacity leading-snug">
                  {evt.title || evt.name}
                </h3>
                {(evt.desc || evt.description) && (
                  <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2">
                    {evt.desc || evt.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          GUEST STAR
      ══════════════════════════════════════ */}
      {guestSect && (
        <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden bg-[#050408]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
              <div>
                <p className="section-label text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: accent }}>
                  {guestSect.name}
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.05]">
                  Bintang Tamu<br />Spesial
                </h2>
              </div>
            </div>

            {!(guestSect.content?.stars?.length) ? (
              <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden p-14 text-center"
                style={{ background: `radial-gradient(ellipse at center, ${accent}08 0%, transparent 70%)` }}>
                <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-30" style={{ color: accent }} />
                <p className="text-white/50 text-sm font-semibold">Bintang Tamu Segera Diumumkan</p>
                <p className="text-white/25 text-xs mt-1">Pantau terus pembaruan acara.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-5">
                {(guestSect.content?.stars || []).map((star: any, i: number) => (
                  <div key={i} className="card-lift group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0C0A12]">
                    {star.image ? (
                      <div className="relative aspect-square overflow-hidden">
                        <img src={star.image} alt={star.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A12] via-[#0C0A12]/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-4xl font-black text-white/5 bg-gradient-to-br"
                        style={{ background: `linear-gradient(135deg, ${primary}15, ${secondary}10)` }}>
                        {star.name?.[0]}
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-white leading-snug">{star.name}</h4>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: accent }}>
                        {star.role || "Special Guest"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          VENUE / LOKASI
      ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative bg-[#080610] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="section-label text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: primary }}>
                {lokasiSect?.name || "Venue & Lokasi"}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.05]">
                Lokasi<br />Pelaksanaan
              </h2>
            </div>
            <p className="text-white/35 text-sm max-w-xs sm:text-right leading-relaxed">
              Panduan rute menuju lokasi malam puncak Duta Genre Klaten 2026.
            </p>
          </div>

          {mapUrl ? (
            <div className="rounded-2xl overflow-hidden border border-white/[0.06] h-[360px] sm:h-[480px] shadow-2xl relative">
              <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="opacity-80 hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden"
              style={{ background: `radial-gradient(ellipse at 50% 100%, ${primary}10 0%, transparent 70%), #080610` }}>
              <div className="flex flex-col items-center justify-center gap-5 py-20 px-8 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.08]"
                  style={{ background: `linear-gradient(135deg, ${primary}30, ${secondary}20)` }}>
                  <MapPin className="w-7 h-7" style={{ color: primary }} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{venueAddress}</h3>
                  <p className="text-white/35 text-sm mt-1">Klaten, Jawa Tengah, Indonesia</p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-white/30 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: primary }} />
                  Akses transportasi mudah dijangkau.
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  Buka Google Maps
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          SPONSOR MARQUEE
      ══════════════════════════════════════ */}
      <section className="py-14 border-y border-white/[0.05] bg-[#050408] overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-8 flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 whitespace-nowrap">
            {sponsorSect?.name || "Mitra & Sponsor"}
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#050408] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#050408] to-transparent" />
          <div className="flex marquee-track">
            {marqueeItems.map((sp: any, i: number) => (
              <div key={i} className="inline-flex items-center justify-center px-8 py-3 mx-3 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all shrink-0">
                {typeof sp === "string" ? (
                  <span className="text-[11px] font-bold text-white/30 hover:text-white/60 transition-colors whitespace-nowrap uppercase tracking-widest">
                    {sp}
                  </span>
                ) : sp.logo ? (
                  <img src={sp.logo} alt={sp.name} className="h-5 object-contain opacity-35 hover:opacity-70 transition-opacity" />
                ) : (
                  <span className="text-[11px] font-bold text-white/30 hover:text-white/60 transition-colors whitespace-nowrap uppercase tracking-widest">
                    {sp.name || sp}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 bg-[#080610]">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] p-10 sm:p-16 lg:p-20 noise">
            {/* BG Glow */}
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 30% 50%, ${primary}18 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, ${secondary}10 0%, transparent 50%), #080610` }} />
            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: `linear-gradient(${primary}40 1px, transparent 1px), linear-gradient(90deg, ${primary}40 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

            <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 px-3 py-1.5 rounded-full border"
                  style={{ borderColor: `${primary}30`, backgroundColor: `${primary}10`, color: primary }}>
                  <Sparkles className="w-3 h-3" />
                  Gratis · QR Code · Instant Check-In
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.05] mb-5">
                  Ambil Tiket<br />Gratis Sekarang
                </h2>
                <p className="text-white/40 text-sm leading-relaxed">
                  Dapatkan e-ticket QR Code untuk menghadiri Apresiasi Pemilihan Duta Genre Kabupaten Klaten 2026.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
                <Link
                  href="/daftar"
                  className="group w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  <Ticket className="w-4 h-4" />
                  Registrasi Tiket
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/cek-qr"
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition-all backdrop-blur-md"
                >
                  <QrCode className="w-4 h-4" style={{ color: primary }} />
                  Cek Status Tiket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] bg-[#050408] py-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] tracking-wider"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
              DG
            </div>
            <p className="text-[11px] text-white/25 font-medium">{copyright}</p>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-white/25 font-semibold">
            <span>genreklaten.web.id</span>
            <span className="w-px h-3 bg-white/10" />
            <Link href="/admin/login" className="hover:text-white/50 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

      {/* ── Popup ── */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0C0A12] rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/[0.08] relative">
            <button
              onClick={closePopup}
              className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {popup.image && (
              <img src={popup.image} alt={popup.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-base font-black text-white mb-2 leading-tight">{popup.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-5">{popup.text}</p>
              {popup.buttonText && (
                <Link
                  href={popup.buttonLink || "#"}
                  onClick={closePopup}
                  className="flex w-full py-3.5 font-bold rounded-xl text-center text-xs items-center justify-center gap-2 text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  {popup.buttonText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
