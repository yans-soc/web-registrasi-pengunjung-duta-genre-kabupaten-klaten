"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users, CheckCircle, ArrowRight, QrCode, Ticket,
  MapPin, CalendarDays, Star, Clock3, X, Sparkles,
  ChevronRight, Award, ShieldCheck, Heart, Music, Zap
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

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.12 });
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
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

  useReveal();

  const heroTitle = hero?.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026";
  const heroSubtitle = hero?.subtitle || "E-Ticketing Pengunjung Resmi";
  const heroDesc = hero?.description || "Portal registrasi tiket pengunjung resmi untuk acara Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.";
  const heroBtnText = hero?.buttonText || "Daftar Tiket Sekarang";
  const heroBtnLink = hero?.buttonLink || "/daftar";
  const heroBgImage = hero?.bgImage || "";
  const heroOverlay = hero?.overlay !== undefined ? hero.overlay / 100 : 0.55;

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
    if (theme?.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = theme.favicon;
    }
  }, [theme?.favicon]);

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
    <div className="min-h-screen bg-[#FFF9FC] text-[#1F1F1F] overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif" }}>

      {/* ── Announcement Bar ── */}
      {announcement?.enabled && showAnn && (
        <div className="relative z-50 flex items-center justify-center gap-2 py-2.5 px-4 text-[11px] font-semibold tracking-wide text-white" style={{ background: "linear-gradient(90deg, #FF4FA3, #8B5CF6, #FFB347)", backgroundSize: "200% 100%", animation: "gradientShift 6s ease infinite" }}>
          <span className="blink-dot w-2 h-2 rounded-full bg-white/80 shrink-0" />
          <span>{announcement.text}</span>
          <button onClick={() => setShowAnn(false)} className="ml-3 w-5 h-5 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center shrink-0 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={`fixed left-0 right-0 z-40 transition-all duration-500 ${announcement?.enabled && showAnn ? "top-[36px]" : "top-0"}`}>
        <div className={`transition-all duration-500 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-pink-100/50 border-b border-pink-100" : "bg-transparent"}`}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-[11px] tracking-wider shadow-lg" style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                DG
              </div>
              <div className="hidden sm:block">
                <span className={`text-[11px] font-black tracking-[0.15em] uppercase leading-none block transition-colors ${scrolled ? "text-[#1F1F1F]" : "text-white"}`}>Duta Genre</span>
                <span className="text-[9px] font-semibold tracking-[0.12em] uppercase leading-none text-[#FF4FA3]">Kabupaten Klaten</span>
              </div>
            </div>
            {/* Nav Actions */}
            <div className="flex items-center gap-2">
              <Link href="/cek-qr" className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-pink-50 ${scrolled ? "text-[#1F1F1F]/60 hover:text-[#FF4FA3]" : "text-white/80 hover:text-white"}`}>
                <QrCode className="w-3.5 h-3.5" />
                Cek Tiket
              </Link>
              <Link href="/daftar" className="inline-flex items-center gap-1.5 text-[11px] font-bold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.03] active:scale-95 shadow-md shadow-pink-200" style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
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
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* BG */}
        {heroBgImage ? (
          <div className="absolute inset-0 z-0">
            <img src={heroBgImage} alt="" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(255,249,252,1) 0%, rgba(255,249,252,${heroOverlay}) 50%, rgba(255,79,163,0.15) 100%)` }} />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Warm gradient sky */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #FF4FA3 0%, #C84BED 30%, #7C3AED 60%, #1D4ED8 100%)" }} />
            {/* Noise */}
            <div className="absolute inset-0 noise" />
            {/* Blobs */}
            <div className="absolute top-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full opacity-30 blob-anim" style={{ background: "radial-gradient(circle, #FFB347 0%, #FF4FA3 50%, transparent 70%)" }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blob-anim" style={{ background: "radial-gradient(circle, #FFD84D 0%, #8B5CF6 60%, transparent 80%)", animationDelay: "-4s" }} />
            {/* Batik kawung pattern overlay */}
            <div className="absolute inset-0 batik-pattern opacity-[0.06]" />
            {/* Bottom fade to white */}
            <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: "linear-gradient(to top, #FFF9FC, transparent)" }} />
          </div>
        )}

        {/* Decorative floating shapes */}
        <div className="absolute right-[6%] top-[20%] hidden lg:flex flex-col items-center gap-3 select-none pointer-events-none">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center float-anim shadow-2xl">
            <Star className="w-9 h-9 text-yellow-300" fill="currentColor" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center float-anim shadow-xl" style={{ animationDelay: "-2s" }}>
            <Heart className="w-6 h-6 text-pink-200" fill="currentColor" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center float-anim shadow-xl" style={{ animationDelay: "-4s" }}>
            <Music className="w-5 h-5 text-purple-200" />
          </div>
        </div>

        {/* Hero year watermark */}
        <div className="absolute left-[4%] bottom-[15%] hidden xl:block select-none pointer-events-none">
          <span className="text-[200px] font-black leading-none" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.12)", color: "transparent" }}>26</span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full pt-32 pb-28 sm:pt-40 sm:pb-36">
          {/* Eyebrow pill */}
          <div className="fade-up-1 flex items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <span className="blink-dot w-1.5 h-1.5 rounded-full bg-yellow-300" />
              {heroSubtitle}
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </div>
          </div>

          {/* Main heading */}
          <h1 className="fade-up-2 font-black text-white leading-[0.95] tracking-tight mb-6 uppercase" style={{ fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)", textShadow: "0 4px 40px rgba(0,0,0,0.2)" }}>
            {(() => {
              const words = heroTitle.split(" ");
              const highlights = ["DUTA", "GENRE", "KLATEN", "2026"];
              return words.map((word: string, i: number) => (
                <span key={i}>
                  {highlights.includes(word.toUpperCase())
                    ? <span style={{ background: "linear-gradient(135deg, #FFD84D, #FFB347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{word}</span>
                    : word}
                  {" "}
                </span>
              ));
            })()}
          </h1>

          {/* Desc */}
          <p className="fade-up-3 text-white/75 text-base sm:text-lg max-w-xl leading-relaxed mb-10 font-medium">
            {heroDesc}
          </p>

          {/* CTAs */}
          <div className="fade-up-4 flex flex-wrap gap-4 mb-16">
            <Link
              href={heroBtnLink}
              className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-bold text-[#1F1F1F] transition-all hover:scale-[1.04] active:scale-[0.97] shadow-2xl shadow-yellow-400/40"
              style={{ background: "linear-gradient(135deg, #FFD84D, #FFB347)" }}
            >
              <Ticket className="w-4 h-4" />
              {heroBtnText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/cek-qr"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.3)" }}
            >
              <QrCode className="w-4 h-4" />
              Cek Status Tiket
            </Link>
          </div>

          {/* Stats bar */}
          <div className="fade-up-5">
            <div className="inline-grid grid-cols-3 divide-x divide-white/20 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)" }}>
              {[
                { ref: rReg, val: cReg, label: "Pendaftar", suffix: "" },
                { ref: rIn, val: cIn, label: "Hadir", suffix: "" },
                { ref: rPct, val: cPct, label: "Kehadiran", suffix: "%" },
              ].map((s, i) => (
                <div key={i} ref={s.ref} className="flex flex-col items-center justify-center px-6 py-4 sm:px-8 sm:py-5 gap-0.5">
                  <span className="ticker text-2xl sm:text-3xl font-black text-white leading-none">
                    {s.val.toLocaleString("id-ID")}{s.suffix}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-50 pointer-events-none z-10">
          <div className="w-5 h-8 rounded-full border-2 border-white/50 flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full bg-white/80" style={{ animation: "floatB 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INFO STRIP
      ══════════════════════════════════════ */}
      <section className="border-y border-pink-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-pink-100">
            {[
              { icon: <CalendarDays className="w-5 h-5" />, text: "2026", sub: "Tahun Pelaksanaan", color: "#FF4FA3" },
              { icon: <MapPin className="w-5 h-5" />, text: venueAddress.split(",")[0], sub: "Lokasi Acara", color: "#8B5CF6" },
              { icon: <Ticket className="w-5 h-5" />, text: "E-Ticket QR", sub: "Tiket Digital Gratis", color: "#FF4FA3" },
              { icon: <Award className="w-5 h-5" />, text: "Duta Genre", sub: "Apresiasi Klaten", color: "#FFB347" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center md:items-start gap-1.5 py-6 px-5 md:px-7 group hover:bg-pink-50/50 transition-colors">
                <span className="mb-1 p-2 rounded-xl" style={{ color: item.color, background: `${item.color}15` }}>{item.icon}</span>
                <span className="text-sm font-bold text-[#1F1F1F] truncate max-w-[150px]">{item.text}</span>
                <span className="text-[10px] text-[#1F1F1F]/40 font-medium">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ABOUT
      ══════════════════════════════════════ */}
      {aboutSect && (
        <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden bg-[#FFF9FC]">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none" style={{ background: "radial-gradient(circle, #FF4FA3 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              {/* Text */}
              <div className="reveal-left">
                <span className="section-eyebrow inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] mb-5 text-[#FF4FA3]">
                  {aboutSect.name}
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F1F1F] leading-[1.05] uppercase tracking-tight mb-6">
                  {aboutSect.content?.heading || "Tentang"}{" "}
                  <span className="grad-text-pink">Duta Genre</span>
                </h2>
                <div
                  className="text-[#1F1F1F]/60 text-sm leading-[1.9] space-y-4"
                  dangerouslySetInnerHTML={{ __html: aboutSect.content?.description || "Informasi seputar acara." }}
                />
                <Link href="/daftar" className="inline-flex items-center gap-2 mt-8 text-sm font-bold group text-[#FF4FA3] hover:opacity-80 transition-opacity">
                  Daftar Tiket Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              {/* Visual */}
              <div className="reveal-right relative">
                {aboutSect.content?.imageUrl ? (
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-pink-200/40">
                    <img src={aboutSect.content.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(255,79,163,0.3) 0%, transparent 60%)" }} />
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden flex items-center justify-center relative shadow-2xl shadow-pink-100/60" style={{ background: "linear-gradient(135deg, #FFE4F1 0%, #EDE9FE 100%)" }}>
                    <div className="absolute w-56 h-56 rounded-full border-2 border-dashed border-pink-200 spin-slow" />
                    <div className="absolute w-80 h-80 rounded-full border border-purple-100" style={{ animation: "spinSlow 35s linear infinite reverse" }} />
                    <div className="relative flex flex-col items-center gap-4 text-center">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <span className="text-2xl font-black uppercase tracking-wider" style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Duta Genre</span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1F1F1F]/30">Generasi Berencana Klaten</span>
                    </div>
                  </div>
                )}
                {/* Accent badge */}
                <div className="absolute -bottom-4 -right-4 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-white shadow-xl shadow-pink-300/40" style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                  Klaten 2026
                </div>
                {/* Floating tag */}
                <div className="absolute -top-4 -left-4 px-4 py-2 rounded-xl text-[10px] font-bold text-[#1F1F1F] shadow-lg float-anim" style={{ background: "linear-gradient(135deg, #FFD84D, #FFB347)" }}>
                  ✨ Gratis Masuk
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          RUNDOWN / TIMELINE
      ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F5F0FF 0%, #FFF9FC 100%)" }}>
        <div className="absolute inset-0 batik-pattern opacity-[0.04] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-16 text-center reveal">
            <span className="section-eyebrow inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] mb-5 text-[#8B5CF6]">
              {rundownSect?.name || "Rundown Acara"}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F1F1F] uppercase tracking-tight leading-[1.05]">
              Jadwal & <span className="grad-text-purple">Timeline</span> Acara
            </h2>
            <p className="text-[#1F1F1F]/40 text-sm max-w-md mx-auto mt-4 leading-relaxed">
              Susunan acara bersifat dinamis mengikuti kondisi hari pelaksanaan.
            </p>
          </div>

          {/* Timeline — vertical */}
          <div className="max-w-2xl mx-auto space-y-0">
            {rundownEvents.map((evt: any, i: number) => (
              <div key={i} className="reveal relative flex gap-5 pb-6" style={{ transitionDelay: `${i * 0.07}s` }}>
                {/* Connector line */}
                {i < rundownEvents.length - 1 && (
                  <div className="absolute left-[22px] top-[52px] bottom-0 w-[2px]" style={{ background: "linear-gradient(to bottom, #FF4FA340, transparent)" }} />
                )}
                {/* Number bubble */}
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-[11px] font-black shadow-lg" style={i === 0 ? { background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)", color: "white" } : { background: "white", border: "2px solid #FF4FA330", color: "#FF4FA3" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                {/* Content */}
                <div className="flex-1 bg-white rounded-2xl px-5 py-4 shadow-sm shadow-pink-100/50 border border-pink-50 hover:shadow-md hover:shadow-pink-100/70 transition-shadow">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg text-white" style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>
                      {evt.time}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1F1F1F] mb-0.5">{evt.title || evt.name}</h3>
                  {(evt.desc || evt.description) && (
                    <p className="text-xs text-[#1F1F1F]/40 leading-relaxed">{evt.desc || evt.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          GUEST STAR
      ══════════════════════════════════════ */}
      {guestSect && (
        <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden bg-[#FFF9FC]">
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(to right, transparent, #FF4FA340, transparent)" }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-14 text-center reveal">
              <span className="section-eyebrow inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] mb-5 text-[#FFB347]">
                {guestSect.name}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F1F1F] uppercase tracking-tight leading-[1.05]">
                Bintang Tamu <span className="grad-text-warm">Spesial</span>
              </h2>
            </div>

            {!(guestSect.content?.stars?.length) ? (
              <div className="relative rounded-3xl overflow-hidden p-14 text-center border border-orange-100 shadow-sm" style={{ background: "linear-gradient(135deg, #FFF8ED, #FFF3E6)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #FFB347, #FFD84D)" }}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#1F1F1F]/60 text-sm font-semibold">Bintang Tamu Segera Diumumkan</p>
                <p className="text-[#1F1F1F]/30 text-xs mt-1">Pantau terus pembaruan acara.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {(guestSect.content?.stars || []).map((star: any, i: number) => (
                  <div key={i} className="card-lift reveal-zoom rounded-3xl overflow-hidden border border-pink-100 bg-white shadow-md shadow-pink-50" style={{ transitionDelay: `${i * 0.08}s` }}>
                    {star.image ? (
                      <div className="relative aspect-square overflow-hidden">
                        <img src={star.image} alt={star.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(255,79,163,0.4) 0%, transparent 60%)" }} />
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-4xl font-black" style={{ background: "linear-gradient(135deg, #FFE4F1, #EDE9FE)" }}>
                        <span className="grad-text-pink text-5xl font-black">{star.name?.[0]}</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-[#1F1F1F] leading-snug">{star.name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-[#FFB347]">{star.role || "Special Guest"}</p>
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
      <section className="py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F0F5FF 0%, #FFF9FC 100%)" }}>
        <div className="absolute inset-0 batik-pattern opacity-[0.04] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-14 text-center reveal">
            <span className="section-eyebrow inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] mb-5 text-[#8B5CF6]">
              {lokasiSect?.name || "Venue & Lokasi"}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F1F1F] uppercase tracking-tight leading-[1.05]">
              Lokasi <span className="grad-text-purple">Pelaksanaan</span>
            </h2>
            <p className="text-[#1F1F1F]/40 text-sm max-w-sm mx-auto mt-4 leading-relaxed">
              Panduan rute menuju lokasi malam puncak Duta Genre Klaten 2026.
            </p>
          </div>

          {mapUrl ? (
            <div className="reveal-zoom rounded-3xl overflow-hidden border border-purple-100 shadow-2xl shadow-purple-100/40 h-[360px] sm:h-[480px]">
              <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="opacity-90 hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="reveal-zoom rounded-3xl overflow-hidden border border-purple-100 shadow-xl shadow-purple-50 bg-white">
              <div className="flex flex-col items-center justify-center gap-5 py-20 px-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #8B5CF6, #FF4FA3)" }}>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1F1F1F] uppercase tracking-tight">{venueAddress}</h3>
                  <p className="text-[#1F1F1F]/40 text-sm mt-1">Klaten, Jawa Tengah, Indonesia</p>
                </div>
              </div>
              <div className="px-6 py-5 border-t border-purple-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-purple-50/30">
                <p className="text-[#1F1F1F]/40 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Akses transportasi mudah dijangkau.
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold px-5 py-3 rounded-xl text-white transition-all hover:opacity-90 shadow-md shadow-purple-200/50"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #FF4FA3)" }}
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
      <section className="py-14 border-y border-pink-100 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-8 flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1F1F1F]/25 whitespace-nowrap">
            {sponsorSect?.name || "Mitra & Sponsor"}
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #FF4FA320, transparent)" }} />
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, white, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, white, transparent)" }} />
          <div className="flex marquee-track">
            {marqueeItems.map((sp: any, i: number) => (
              <div key={i} className="inline-flex items-center justify-center px-7 py-3 mx-3 rounded-2xl border border-pink-100 bg-pink-50/50 hover:bg-pink-100/70 hover:border-pink-200 transition-all shrink-0 cursor-default">
                {typeof sp === "string" ? (
                  <span className="text-[11px] font-bold text-[#1F1F1F]/40 hover:text-[#FF4FA3] transition-colors whitespace-nowrap uppercase tracking-widest">
                    {sp}
                  </span>
                ) : sp.logo ? (
                  <img src={sp.logo} alt={sp.name} className="h-5 object-contain opacity-40 hover:opacity-70 transition-opacity" />
                ) : (
                  <span className="text-[11px] font-bold text-[#1F1F1F]/40 hover:text-[#FF4FA3] transition-colors whitespace-nowrap uppercase tracking-widest">
                    {sp.name || sp}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 bg-[#FFF9FC] relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden noise">
            {/* BG gradient */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #FF4FA3 0%, #C84BED 35%, #8B5CF6 65%, #1D4ED8 100%)" }} />
            {/* Batik */}
            <div className="absolute inset-0 batik-pattern opacity-[0.08]" />
            {/* Blob */}
            <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-30 blob-anim" style={{ background: "radial-gradient(circle, #FFD84D, transparent 70%)" }} />
            <div className="absolute bottom-[-30%] left-[-10%] w-[350px] h-[350px] rounded-full opacity-20 blob-anim" style={{ background: "radial-gradient(circle, #FFB347, transparent 70%)", animationDelay: "-5s" }} />

            <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-between p-10 sm:p-16 lg:p-20">
              <div className="flex-1 max-w-xl reveal-left">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 px-4 py-2 rounded-full text-[#1F1F1F]" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)" }}>
                  <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  Gratis · QR Code · Instant Check-In
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.05] mb-5">
                  Ambil Tiket<br />
                  <span style={{ background: "linear-gradient(135deg, #FFD84D, #FFB347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Gratis</span>{" "}
                  Sekarang
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Dapatkan e-ticket QR Code untuk menghadiri Apresiasi Pemilihan Duta Genre Kabupaten Klaten 2026. Pendaftaran cepat, mudah, dan 100% gratis.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0 reveal-right">
                <Link
                  href="/daftar"
                  className="group w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4.5 rounded-2xl text-sm font-bold text-[#1F1F1F] transition-all hover:scale-[1.04] active:scale-[0.97] shadow-2xl shadow-yellow-400/30"
                  style={{ background: "linear-gradient(135deg, #FFD84D, #FFB347)", padding: "1rem 2rem" }}
                >
                  <Ticket className="w-4 h-4" />
                  Registrasi Tiket
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/cek-qr"
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl text-sm font-semibold text-white hover:text-white transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.3)", padding: "1rem 2rem" }}
                >
                  <QrCode className="w-4 h-4" />
                  Cek Status Tiket
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-pink-100 bg-white py-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-[10px] tracking-wider shadow-md shadow-pink-200/50" style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}>DG</div>
            <p className="text-[11px] text-[#1F1F1F]/35 font-medium">{copyright}</p>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-[#1F1F1F]/30 font-semibold">
            <span>genreklaten.web.id</span>
            <span className="w-px h-3 bg-pink-100" />
            <Link href="/admin/login" className="hover:text-[#FF4FA3] transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

      {/* ── Popup ── */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/40 max-w-sm w-full overflow-hidden border border-pink-100 relative">
            <button
              onClick={closePopup}
              className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-100 text-[#1F1F1F]/40 hover:text-[#FF4FA3] flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {popup.image && (
              <img src={popup.image} alt={popup.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-6">
              <h3 className="text-base font-black text-[#1F1F1F] mb-2 leading-tight">{popup.title}</h3>
              <p className="text-[#1F1F1F]/40 text-xs leading-relaxed mb-5">{popup.text}</p>
              {popup.buttonText && (
                <Link
                  href={popup.buttonLink || "#"}
                  onClick={closePopup}
                  className="flex w-full py-3.5 font-bold rounded-2xl text-center text-xs items-center justify-center gap-2 text-white transition-all hover:opacity-90 shadow-md shadow-pink-200/50"
                  style={{ background: "linear-gradient(135deg, #FF4FA3, #8B5CF6)" }}
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
