"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, CheckCircle, ArrowRight, QrCode, Ticket, MapPin, CalendarDays, Star, Clock3, X, Sparkles, ChevronRight } from "lucide-react";

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

  const primary = theme.primary || "#F97316";
  const secondary = theme.secondary || "#DC2626";
  const accent = theme.accent || "#FBBF24";

  const heroTitle = hero?.title || "Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026";
  const heroSubtitle = hero?.subtitle || "E-Ticketing Pengunjung Resmi";
  const heroDesc = hero?.description || "Portal registrasi tiket pengunjung resmi untuk acara Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.";
  const heroBtnText = hero?.buttonText || "Daftar Tiket Sekarang";
  const heroBtnLink = hero?.buttonLink || "/daftar";
  const heroBgImage = hero?.bgImage || "";
  const heroOverlay = hero?.overlay !== undefined ? hero.overlay / 100 : 0.7;

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
    <div className="min-h-screen bg-[#0C0A09] text-[#F5F0EB] overflow-x-hidden" style={{ fontFamily: typography.bodyFont || "inherit" }}>
      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .marquee-track { animation: marquee 28s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .fade-up-1 { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-2 { animation: fadeUp 0.8s 0.12s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-3 { animation: fadeUp 0.8s 0.24s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-4 { animation: fadeUp 0.8s 0.36s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-5 { animation: fadeUp 0.8s 0.48s cubic-bezier(0.16,1,0.3,1) both; }
        .live-dot { animation: blink 1.8s ease-in-out infinite; }
        h1,h2,h3,h4,h5,h6 { font-family: ${typography.headingFont || "inherit"} !important; }
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.045;
          mix-blend-mode: overlay;
        }
      `}</style>

      {/* ── Announcement ── */}
      {announcement?.enabled && showAnn && (
        <div className="relative z-50 flex items-center justify-center gap-2.5 py-2.5 px-4 text-xs font-semibold text-white" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}>
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span>{announcement.text}</span>
          <button onClick={() => setShowAnn(false)} className="ml-2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors">
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${announcement?.enabled && showAnn ? "mt-9" : "mt-0"} ${scrolled ? "bg-[#0C0A09]/95 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme.logo ? (
              <img src={theme.logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>DG</div>
            )}
            <span className="font-bold text-sm text-white/90 hidden sm:block">Duta Genre Klaten <span className="text-white/40">2026</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/cek-qr" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors">
              <QrCode className="w-3.5 h-3.5" /> Cek Tiket
            </Link>
            <Link href="/daftar" className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg text-[#0C0A09] transition-all hover:brightness-110 active:scale-95" style={{ background: `linear-gradient(135deg, ${accent}, ${primary})` }}>
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daftar</span>
              <span className="sm:hidden">Daftar Tiket</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 sm:pb-28 overflow-hidden">
        {/* Background */}
        {heroBgImage ? (
          <div className="absolute inset-0">
            <img src={heroBgImage} alt="" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,10,9,${heroOverlay + 0.15}) 0%, rgba(12,10,9,${heroOverlay}) 50%, rgba(12,10,9,${heroOverlay * 0.6}) 100%)` }} />
          </div>
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 100% 80% at 60% 100%, ${primary}22 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 0%, ${secondary}14 0%, transparent 50%), #0C0A09` }} />
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
            {/* Grain */}
            <div className="absolute inset-0 grain pointer-events-none" />
            {/* Orange blob */}
            <div className="absolute right-[-10%] top-[10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: primary }} />
            <div className="absolute left-[-5%] bottom-[5%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10" style={{ backgroundColor: accent }} />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-32">
          {/* Eyebrow */}
          <div className="fade-up-1 flex items-center gap-2 mb-6">
            <div className="live-dot w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">{heroSubtitle}</span>
          </div>

          {/* Title — large, left-aligned */}
          <h1 className="fade-up-2 text-[clamp(2.8rem,8vw,6.5rem)] font-black leading-[0.92] tracking-[-0.03em] text-white mb-8 max-w-4xl uppercase">
            {heroTitle}
          </h1>

          {/* Desc */}
          <p className="fade-up-3 text-white/50 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            {heroDesc}
          </p>

          {/* CTAs */}
          <div className="fade-up-4 flex flex-wrap gap-3 items-center mb-16">
            <Link href={heroBtnLink} className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-black text-[#0C0A09] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl" style={{ background: `linear-gradient(135deg, ${accent} 0%, ${primary} 100%)`, boxShadow: `0 0 40px ${primary}55` }}>
              <Ticket className="w-4 h-4" />
              {heroBtnText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/cek-qr" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white/80 border border-white/15 bg-white/[0.06] hover:bg-white/10 hover:text-white transition-all hover:scale-[1.02] backdrop-blur-sm">
              <QrCode className="w-4 h-4" />
              Cek Status Tiket
            </Link>
          </div>

          {/* Stats — horizontal inline */}
          <div className="fade-up-5 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div ref={rReg} className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tabular-nums text-white">{cReg.toLocaleString("id-ID")}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Pendaftar</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div ref={rIn} className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: accent }}>{cIn.toLocaleString("id-ID")}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Check-In</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div ref={rPct} className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: primary }}>{cPct}%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Hadir</span>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30">
          <div className="w-px h-10 rounded-full" style={{ background: `linear-gradient(to bottom, transparent, ${accent})` }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">scroll</span>
        </div>
      </section>

      {/* ══════════ INFO STRIP ══════════ */}
      <section className="border-y border-white/[0.07] bg-[#111009]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
            {[
              { icon: <CalendarDays className="w-4 h-4" />, label: "Tahun 2026" },
              { icon: <MapPin className="w-4 h-4" />, label: venueAddress },
              { icon: <Ticket className="w-4 h-4" />, label: "Tiket Digital Gratis" },
              { icon: <Star className="w-4 h-4" />, label: "genreklaten.web.id" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-2.5 py-4 px-6 text-sm text-white/40 font-medium flex-1">
                <span style={{ color: primary }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      {aboutSect && (
        <section className="py-24 sm:py-32 px-5 sm:px-8 bg-[#0E0C0A]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <span className="inline-block text-[10px] font-black uppercase tracking-[0.22em] mb-5 px-3 py-1.5 rounded-full border" style={{ color: primary, borderColor: `${primary}30`, backgroundColor: `${primary}10` }}>
                {aboutSect.name}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black leading-[0.95] tracking-tight text-white mb-6 uppercase">
                {aboutSect.content?.heading || "Tentang Duta Genre"}
              </h2>
              <div className="text-white/50 text-sm leading-relaxed space-y-3 prose-sm max-w-none [&_p]:text-white/50 [&_strong]:text-white/80 [&_a]:text-orange-400"
                dangerouslySetInnerHTML={{ __html: aboutSect.content?.description || "Informasi seputar acara." }} />
              <Link href="/daftar" className="inline-flex items-center gap-2 mt-8 text-sm font-bold transition-colors hover:text-white" style={{ color: primary }}>
                Daftar Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {aboutSect.content?.imageUrl ? (
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl blur-2xl opacity-30" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
                <img src={aboutSect.content.imageUrl} alt="Tentang" className="relative w-full aspect-[4/3] object-cover rounded-2xl border border-white/[0.08]" />
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-2xl border border-white/[0.08] overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}18, ${secondary}10)` }}>
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                <span className="text-8xl font-black opacity-10 uppercase text-white">DG</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ RUNDOWN ══════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8" style={{ background: "#0C0A09" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.22em] mb-3 block" style={{ color: primary }}>
                <Clock3 className="w-3 h-3 inline mr-1" />{rundownSect?.name || "Rundown Acara"}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight uppercase">Jadwal<br />Kegiatan</h2>
            </div>
            <p className="text-white/30 text-sm max-w-xs">Timeline lengkap hari pelaksanaan. Jadwal dapat berubah sewaktu-waktu.</p>
          </div>

          <div className="grid gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {rundownEvents.map((evt: any, i: number) => (
              <div key={i} className="group flex items-center gap-5 px-6 py-5 bg-[#0C0A09] hover:bg-white/[0.04] transition-colors">
                <span className="text-2xl sm:text-3xl font-black tabular-nums shrink-0 w-20 sm:w-24" style={{ color: i === 0 ? primary : "rgba(245,240,235,0.25)" }}>
                  {evt.time}
                </span>
                <div className="w-px self-stretch bg-white/[0.08] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white/85 text-sm sm:text-base group-hover:text-white transition-colors">{evt.title || evt.name}</p>
                  {(evt.desc || evt.description) && (
                    <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{evt.desc || evt.description}</p>
                  )}
                </div>
                {i === 0 && (
                  <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: `${primary}22`, color: primary }}>
                    Mulai
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ GUEST STAR ══════════ */}
      {guestSect && (
        <section className="py-24 sm:py-32 px-5 sm:px-8 bg-[#0E0C0A]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] mb-3 block" style={{ color: accent }}>
                <Star className="w-3 h-3 inline mr-1" />{guestSect.name}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight uppercase">Bintang Tamu</h2>
            </div>
            {!(guestSect.content?.stars?.length) ? (
              <div className="text-center py-16 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <p className="text-white/30 text-sm font-medium">Bintang tamu akan segera diumumkan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(guestSect.content?.stars || []).map((star: any, i: number) => (
                  <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#141210] hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl">
                    {star.image ? (
                      <img src={star.image} alt={star.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-4xl font-black text-white/10 uppercase" style={{ background: `linear-gradient(135deg, ${accent}18, ${primary}10)` }}>
                        {star.name?.[0]}
                      </div>
                    )}
                    <div className="p-4">
                      <p className="font-black text-white text-sm">{star.name}</p>
                      <p className="text-[11px] mt-0.5 font-medium" style={{ color: primary }}>{star.role || "Special Guest"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ VENUE / LOKASI ══════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 bg-[#0C0A09]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] mb-3 block" style={{ color: primary }}>
              <MapPin className="w-3 h-3 inline mr-1" />{lokasiSect?.name || "Venue & Lokasi"}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight uppercase">Lokasi Acara</h2>
          </div>

          {mapUrl ? (
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] w-full h-[360px] sm:h-[480px]">
              <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111009]">
              <div className="h-56 sm:h-72 flex flex-col items-center justify-center gap-4 relative overflow-hidden" style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${primary}18, transparent)` }}>
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-2xl" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 0 40px ${primary}55` }}>
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="text-center relative">
                  <p className="font-black text-white text-xl uppercase tracking-tight">Kabupaten Klaten</p>
                  <p className="text-white/40 text-sm mt-1">Jawa Tengah, Indonesia</p>
                </div>
              </div>
              <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
                <p className="text-white/40 text-sm"><MapPin className="w-4 h-4 inline mr-1.5" style={{ color: primary }} />Detail lokasi akan segera diumumkan</p>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:brightness-110"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                  Buka Google Maps
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ SPONSOR MARQUEE ══════════ */}
      <section className="py-16 border-y border-white/[0.06] bg-[#0E0C0A] overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 mb-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">{sponsorSect?.name || "Sponsor & Mitra"}</p>
          <p className="text-white/50 text-sm mt-1.5">Didukung oleh</p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #0E0C0A, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #0E0C0A, transparent)" }} />
          <div className="flex marquee-track whitespace-nowrap">
            {marqueeItems.map((sp: any, i: number) => (
              <div key={i} className="inline-flex items-center justify-center px-8 py-3 mx-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-colors">
                {typeof sp === "string" ? (
                  <span className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors whitespace-nowrap">{sp}</span>
                ) : sp.logo ? (
                  <img src={sp.logo} alt={sp.name} className="h-6 object-contain opacity-50 hover:opacity-100 transition-opacity" />
                ) : (
                  <span className="text-sm font-bold text-white/40 hover:text-white/70 transition-colors whitespace-nowrap">{sp.name || sp}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 bg-[#0C0A09]">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16" style={{ background: `linear-gradient(135deg, ${primary}22 0%, ${secondary}18 50%, ${accent}12 100%)`, border: `1px solid ${primary}30` }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ backgroundColor: primary }} />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-15" style={{ backgroundColor: accent }} />
            <div className="relative">
              <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-between">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] mb-5 px-3 py-1 rounded-full border" style={{ color: accent, borderColor: `${accent}30`, background: `${accent}12` }}>
                    <Sparkles className="w-3 h-3" /> Gratis · Resmi · Digital
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight uppercase mb-4">Siap Hadir?<br />Daftar Sekarang.</h2>
                  <p className="text-white/45 text-sm max-w-md leading-relaxed">Dapatkan tiket digital QR code resmi untuk menghadiri Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.</p>
                </div>
                <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
                  <Link href="/daftar" className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-black text-[#0C0A09] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl w-full lg:w-auto"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${primary})`, boxShadow: `0 0 40px ${primary}40` }}>
                    <Ticket className="w-4 h-4" />
                    Daftar Tiket Gratis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/cek-qr" className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold text-white/70 hover:text-white border border-white/15 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08] transition-all w-full lg:w-auto">
                    <QrCode className="w-4 h-4" />
                    Cek Status Tiket
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.07] bg-[#0A0807] py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-[#0C0A09] font-black text-[10px]" style={{ background: `linear-gradient(135deg, ${accent}, ${primary})` }}>DG</div>
            <p className="text-xs font-medium text-white/30">{copyright}</p>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-white/25 font-medium">
            <span>genreklaten.web.id</span>
            <span className="w-px h-3 bg-white/15" />
            <Link href="/admin/login" className="hover:text-white/50 transition-colors">Portal Admin</Link>
          </div>
        </div>
      </footer>

      {/* ── Popup ── */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#111009] rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/[0.1] relative">
            <button onClick={closePopup} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white/50 hover:text-white flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
            {popup.image && <img src={popup.image} alt={popup.title} className="w-full aspect-video object-cover opacity-80" />}
            <div className="p-6">
              <h3 className="text-lg font-black text-white mb-2 leading-tight">{popup.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">{popup.text}</p>
              {popup.buttonText && (
                <Link href={popup.buttonLink || "#"} onClick={closePopup}
                  className="flex w-full py-3.5 font-bold rounded-2xl text-center text-sm items-center justify-center gap-2 transition-all hover:brightness-110 text-[#0C0A09]"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${primary})` }}>
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
