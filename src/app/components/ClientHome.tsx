"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, CheckCircle, ArrowRight, QrCode, Ticket, MapPin, CalendarDays, Star, Clock3, X, Sparkles, ChevronRight, Laptop, Award, ShieldCheck } from "lucide-react";

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
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

const DEFAULT_RUNDOWN = [
  { time: "08.00", title: "Registrasi & Check-In", desc: "Pemeriksaan tiket pengunjung" },
  { time: "09.00", title: "Pembukaan & Sambutan", desc: "Panitia dan tamu undangan" },
  { time: "10.00", title: "Penampilan Peserta I", desc: "" },
  { time: "12.00", title: "Ishoma", desc: "Istirahat, Sholat, Makan Siang" },
  { time: "13.00", title: "Penampilan Peserta II", desc: "" },
  { time: "15.30", title: "Penjurian", desc: "Penilaian oleh dewan juri" },
  { time: "17.00", title: "Malam Puncak & Penutupan", desc: "Pengumuman pemenang" },
];
const DEFAULT_SPONSORS = [
  "Pemkab Klaten", "BKKBN", "DP3AKB", "Dinas Kesehatan", "BPBD Klaten", "Partner Media",
];

export default function ClientHome({ theme, typography, hero, popup, announcement, sections, stats }: ClientHomeProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showAnn, setShowAnn] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Tema Duta Genre 2026: Ungu Royal, Biru Elektrik, Kuning Gold
  const primary = theme.primary || "#6366F1"; // Indigo/Violet
  const secondary = theme.secondary || "#3B82F6"; // Biru Elektrik
  const accent = theme.accent || "#FBBF24"; // Kuning Emas

  const heroTitle = hero?.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026";
  const heroSubtitle = hero?.subtitle || "E-Ticketing Pengunjung Resmi";
  const heroDesc = hero?.description || "Portal registrasi tiket pengunjung resmi untuk acara Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.";
  const heroBtnText = hero?.buttonText || "Daftar Tiket Sekarang";
  const heroBtnLink = hero?.buttonLink || "/daftar";
  const heroBgImage = hero?.bgImage || "";
  const heroOverlay = hero?.overlay !== undefined ? hero.overlay / 100 : 0.75;

  const getSection = (slug: string) => sections.find((s) => s.slug === slug && s.isVisible);
  const rundownSect = getSection("rundown");
  const sponsorSect = getSection("sponsor");
  const lokasiSect = getSection("lokasi");
  const aboutSect = getSection("about");
  const guestSect = getSection("guest-star");
  const footerSect = sections.find((s) => s.slug === "footer" && s.isVisible);

  const rundownEvents = rundownSect?.content?.events?.length ? rundownSect.content.events : DEFAULT_RUNDOWN;
  const sponsors: any[] = sponsorSect?.content?.sponsors?.length ? sponsorSect.content.sponsors.map((s: any) => s.name || s) : DEFAULT_SPONSORS;
  const mapUrl = lokasiSect?.content?.mapUrl || "";
  const venueAddress = lokasiSect?.content?.address || "Kabupaten Klaten, Jawa Tengah";
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

  const marqueeItems = [...sponsors, ...sponsors];

  return (
    <div className="min-h-screen bg-[#06040A] text-[#F3F4F6] overflow-x-hidden selection:bg-indigo-500 selection:text-white" style={{ fontFamily: typography.bodyFont || "inherit" }}>
      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes pulse-slow { 0%,100% { transform: scale(1) translate(0px, 0px); } 50% { transform: scale(1.1) translate(10px, -15px); } }
        .marquee-track { animation: marquee 25s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .fade-up-1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-5 { animation: fadeUp 0.7s 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .live-dot { animation: blink 1.5s ease-in-out infinite; }
        .pulse-bg { animation: pulse-slow 8s ease-in-out infinite; }
        h1,h2,h3,h4,h5,h6 { font-family: ${typography.headingFont || "inherit"} !important; }
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.025;
          mix-blend-mode: overlay;
        }
      `}</style>

      {/* ── Announcement ── */}
      {announcement?.enabled && showAnn && (
        <div className="relative z-50 flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-bold text-white shadow-lg" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}>
          <span className="live-dot w-2 h-2 rounded-full bg-white shrink-0 shadow-glow" />
          <span>{announcement.text}</span>
          <button onClick={() => setShowAnn(false)} className="ml-2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0 transition-all active:scale-90">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-45 transition-all duration-500 ${announcement?.enabled && showAnn ? "mt-[44px]" : "mt-0"} ${scrolled ? "bg-[#06040A]/80 backdrop-blur-md border-b border-white/[0.08] py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme.logo ? (
              <img src={theme.logo} alt="Logo" className="w-9 h-9 object-contain rounded-xl shadow-md border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>DG</div>
            )}
            <span className="font-extrabold text-sm tracking-tight text-white hidden sm:block">DUTA GENRE KLATEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">2026</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cek-qr" className="inline-flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white transition-all bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2.5 rounded-xl border border-white/[0.06]">
              <QrCode className="w-4 h-4 text-indigo-400" /> Cek Tiket
            </Link>
            <Link href="/daftar" className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 rounded-xl text-white transition-all hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 border border-indigo-400/30" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
              <Ticket className="w-4 h-4" />
              <span>Daftar Sekarang</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col justify-end pb-24 sm:pb-32 overflow-hidden">
        {/* Background blobs & patterns */}
        {heroBgImage ? (
          <div className="absolute inset-0 z-0">
            <img src={heroBgImage} alt="" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(6,4,10,1) 0%, rgba(6,4,10,${heroOverlay}) 60%, rgba(6,4,10,0.4) 100%)` }} />
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            {/* Dark violet atmosphere background */}
            <div className="absolute inset-0 bg-[#06040A]" />
            {/* Mesh gradient circles */}
            <div className="absolute right-[-10%] top-[-10%] w-[800px] h-[800px] rounded-full blur-[160px] opacity-25 pulse-bg" style={{ backgroundColor: primary }} />
            <div className="absolute left-[-20%] bottom-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-20" style={{ backgroundColor: secondary }} />
            <div className="absolute right-[20%] bottom-[10%] w-[450px] h-[450px] rounded-full blur-[130px] opacity-15" style={{ backgroundColor: accent }} />
            
            {/* Modern neon grid line pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "36px 36px" }} />
            
            {/* Fine grain overlay */}
            <div className="absolute inset-0 grain pointer-events-none" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full pt-40">
          {/* Eyebrow */}
          <div className="fade-up-1 flex items-center gap-2 mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-300">{heroSubtitle}</span>
          </div>

          {/* Heading - Dynamic and high impact */}
          <h1 className="fade-up-2 text-[clamp(2.5rem,7.5vw,6rem)] font-extrabold leading-[0.9] tracking-tight text-white mb-8 max-w-5xl uppercase">
            {heroTitle.split(" ").map((word: string, i: number) => {
              // Highlight "Klaten" or "2026" or "Duta Genre"
              const isHighlight = ["DUTA", "GENRE", "KLATEN", "2026"].includes(word.toUpperCase());
              return (
                <span key={i} className={isHighlight ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400" : ""}>
                  {word}{" "}
                </span>
              );
            })}
          </h1>

          {/* Description */}
          <p className="fade-up-3 text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 border-l-2 border-indigo-500/30 pl-4">
            {heroDesc}
          </p>

          {/* Action Buttons */}
          <div className="fade-up-4 flex flex-wrap gap-4 items-center mb-16">
            <Link href={heroBtnLink} className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 border border-white/10" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}>
              <Ticket className="w-5 h-5" />
              {heroBtnText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/cek-qr" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all hover:scale-[1.01] backdrop-blur-md">
              <QrCode className="w-5 h-5 text-indigo-400" />
              Cek Status Tiket
            </Link>
          </div>

          {/* Live Attendance Counter */}
          <div className="fade-up-5 grid grid-cols-3 gap-6 max-w-2xl p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-lg">
            <div ref={rReg} className="text-center sm:text-left">
              <span className="block text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">{cReg.toLocaleString("id-ID")}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Pendaftar</span>
            </div>
            <div ref={rIn} className="text-center sm:text-left border-x border-white/10 px-4">
              <span className="block text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums" style={{ color: accent }}>{cIn.toLocaleString("id-ID")}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Check-In</span>
            </div>
            <div ref={rPct} className="text-center sm:text-left">
              <span className="block text-3xl sm:text-4xl font-extrabold tracking-tight text-cyan-400 tabular-nums">{cPct}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Kehadiran</span>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-[1px] h-12 rounded-full bg-gradient-to-b from-indigo-500 to-transparent" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Scroll Down</span>
        </div>
      </section>

      {/* ══════════ INFO STRIP ══════════ */}
      <section className="relative z-10 border-y border-white/[0.08] bg-[#0A0712]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
            {[
              { icon: <CalendarDays className="w-5 h-5" />, label: "Tahun Pelaksanaan 2026", color: "text-indigo-400" },
              { icon: <MapPin className="w-5 h-5" />, label: venueAddress, color: "text-purple-400" },
              { icon: <Ticket className="w-5 h-5" />, label: "E-Ticket QR Code Otomatis", color: "text-cyan-400" },
              { icon: <Award className="w-5 h-5" />, label: "Apresiasi Genre Klaten", color: "text-amber-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-5 px-6 text-sm text-gray-400 font-semibold justify-center md:justify-start flex-1 hover:bg-white/[0.01] transition-all">
                <span className={item.color}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      {aboutSect && (
        <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#090710]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[130px] opacity-10 pointer-events-none" style={{ backgroundColor: primary }} />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-6 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                {aboutSect.name}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white mb-8 uppercase tracking-tight">
                {aboutSect.content?.heading || "Tentang Duta Genre"}
              </h2>
              <div className="text-gray-400 text-sm leading-relaxed space-y-4 prose-sm max-w-none [&_p]:text-gray-400 [&_strong]:text-white [&_a]:text-indigo-400"
                dangerouslySetInnerHTML={{ __html: aboutSect.content?.description || "Informasi seputar acara." }} />
              <div className="pt-6">
                <Link href="/daftar" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors group">
                  Daftar Tiket Pengunjung <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              {aboutSect.content?.imageUrl ? (
                <div className="relative group">
                  <div className="absolute -inset-1.5 rounded-3xl blur-2xl opacity-30 group-hover:opacity-40 transition-opacity" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
                  <img src={aboutSect.content.imageUrl} alt="Tentang" className="relative w-full aspect-[4/3] object-cover rounded-2xl border border-white/[0.1] shadow-2xl" />
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-3xl border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${primary}10, ${secondary}05)` }}>
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                  <div className="relative flex flex-col items-center gap-2">
                    <Laptop className="w-12 h-12 text-indigo-500/50" />
                    <span className="text-2xl font-black tracking-widest text-indigo-500/20 uppercase">DUTA GENRE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ RUNDOWN ══════════ */}
      <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#06040A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-300">
                <Clock3 className="w-3.5 h-3.5 text-indigo-400" />
                {rundownSect?.name || "Rundown Acara"}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight uppercase">JADWAL & TIMELINE</h2>
            </div>
            <p className="text-gray-400 text-sm max-w-sm border-l-2 border-indigo-500/30 pl-4">Rangkaian acara pemilihan Duta Genre Klaten 2026. Jadwal sewaktu-waktu dapat disesuaikan panitia.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rundownEvents.map((evt: any, i: number) => {
              const isFirst = i === 0;
              return (
                <div key={i} className="group relative p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all hover:-translate-y-1 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-extrabold tracking-tight tabular-nums px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      {evt.time}
                    </span>
                    {isFirst && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 animate-pulse">
                        Mulai
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base mb-2 group-hover:text-indigo-300 transition-colors">
                    {evt.title || evt.name}
                  </h3>
                  {(evt.desc || evt.description) && (
                    <p className="text-gray-400 text-xs leading-relaxed">{evt.desc || evt.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ GUEST STAR ══════════ */}
      {guestSect && (
        <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#090710]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                {guestSect.name}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">Bintang Tamu Acara</h2>
            </div>
            {!(guestSect.content?.stars?.length) ? (
              <div className="text-center py-20 rounded-3xl border border-white/[0.06] bg-white/[0.01] max-w-xl mx-auto backdrop-blur-md">
                <Sparkles className="w-8 h-8 text-indigo-500/50 mx-auto mb-4 animate-bounce" />
                <p className="text-gray-400 text-sm font-semibold">Bintang tamu spesial segera dirilis!</p>
                <p className="text-gray-400/50 text-xs mt-1">Pantau terus pembaharuan ticket & website.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(guestSect.content?.stars || []).map((star: any, i: number) => (
                  <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0E0C15] hover:border-white/20 transition-all hover:-translate-y-1.5 shadow-2xl">
                    {star.image ? (
                      <div className="relative aspect-square overflow-hidden">
                        <img src={star.image} alt={star.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C15] via-transparent to-transparent opacity-80" />
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-5xl font-black text-white/5 uppercase relative" style={{ background: `linear-gradient(135deg, ${accent}15, ${primary}10)` }}>
                        {star.name?.[0]}
                      </div>
                    )}
                    <div className="p-5 relative z-10 bg-[#0E0C15]">
                      <h4 className="font-extrabold text-white text-base tracking-tight mb-1">{star.name}</h4>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{star.role || "Special Guest"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ VENUE / LOKASI ══════════ */}
      <section className="py-28 sm:py-36 px-6 sm:px-10 relative bg-[#06040A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-indigo-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {lokasiSect?.name || "Venue & Lokasi"}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight uppercase">LOKASI PELAKSANAAN</h2>
            </div>
            <p className="text-gray-400 text-sm max-w-sm border-l-2 border-indigo-500/30 pl-4">Akses rute peta digital menuju lokasi penyelenggaraan Apresiasi Duta Genre Kabupaten Klaten.</p>
          </div>

          {mapUrl ? (
            <div className="rounded-3xl overflow-hidden border border-white/[0.08] w-full h-[380px] sm:h-[500px] shadow-2xl relative">
              <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0E0B16] shadow-2xl relative">
              <div className="h-64 sm:h-80 flex flex-col items-center justify-center gap-4 relative overflow-hidden" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${primary}15, transparent)` }}>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-xl shadow-indigo-500/25 border border-indigo-400/30" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="text-center relative px-4">
                  <h3 className="font-extrabold text-white text-2xl uppercase tracking-tight">Kabupaten Klaten</h3>
                  <p className="text-gray-400 text-sm mt-1.5">{venueAddress}</p>
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] bg-white/[0.01]">
                <p className="text-gray-400 text-xs sm:text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" />Lokasi di Klaten. Petunjuk jalan lengkap tersedia.</p>
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
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 block mb-2">{sponsorSect?.name || "SPONSOR & MITRA STRATEGIS"}</span>
          <p className="text-gray-400 text-sm font-bold">Kolaborator & Pendukung Event</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#090710] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#090710] to-transparent" />
          <div className="flex marquee-track whitespace-nowrap">
            {marqueeItems.map((sp: any, i: number) => (
              <div key={i} className="inline-flex items-center justify-center px-10 py-4 mx-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                {typeof sp === "string" ? (
                  <span className="text-sm font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap">{sp}</span>
                ) : sp.logo ? (
                  <img src={sp.logo} alt={sp.name} className="h-6 object-contain opacity-55 hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-sm font-bold text-gray-400 hover:text-white transition-colors whitespace-nowrap">{sp.name || sp}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-28 sm:py-36 px-6 sm:px-10 bg-[#06040A]">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-20 border border-indigo-500/20" style={{ background: `linear-gradient(135deg, ${primary}12 0%, ${secondary}08 50%, ${accent}04 100%)` }}>
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: primary }} />
            <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full blur-[100px] opacity-15 pointer-events-none" style={{ backgroundColor: accent }} />
            <div className="relative">
              <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-6 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" /> Gratis · E-Ticket QR · Instant Check-In
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight uppercase mb-6">AMBIL TIKET GRATIS<br />SEKARANG JUGA</h2>
                  <p className="text-gray-400 text-sm max-w-md leading-relaxed">Dapatkan e-ticket QR Code secara langsung untuk menghadiri Apresiasi Pemilihan Duta Genre Kabupaten Klaten 2026.</p>
                </div>
                <div className="flex flex-col gap-4 shrink-0 w-full lg:w-auto">
                  <Link href="/daftar" className="group inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/25 w-full lg:w-auto border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                    <Ticket className="w-5 h-5" />
                    Registrasi Tiket Pengunjung
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/cek-qr" className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-sm font-bold text-white border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] transition-all w-full lg:w-auto backdrop-blur-md">
                    <QrCode className="w-5 h-5 text-indigo-400" />
                    Cek Status Tiket Anda
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.08] bg-[#040307] py-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[11px] shadow-md border border-white/10" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>DG</div>
            <p className="text-xs font-semibold text-gray-500">{copyright}</p>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-gray-500 font-bold">
            <span className="hover:text-gray-400 transition-colors">genreklaten.web.id</span>
            <span className="w-[1px] h-3 bg-white/10" />
            <Link href="/admin/login" className="hover:text-indigo-400 transition-colors">Portal Dashboard Admin</Link>
          </div>
        </div>
      </footer>

      {/* ── Popup ── */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
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