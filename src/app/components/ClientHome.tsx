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
  const startedRef = useRef(false);
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const p = Math.min(elapsed / duration, 1);
        setCount(Math.floor(p * target));
        if (p < 1) requestAnimationFrame(tick);
        else setCount(target);
      };
      tick();
    }
  }, [target, duration]);
  return count;
}

const DEFAULT_RUNDOWN = [
  { time: "08.00", title: "Registrasi & Check-In", desc: "Pemeriksaan tiket pengunjung" },
  { time: "09.00", title: "Pembukaan & Sambutan", desc: "Panitia dan tamu undangan" },
  { time: "10.00", title: "Penampilan Peserta I", desc: "Ajang unjuk bakat Duta Genre Klaten" },
  { time: "12.00", title: "Ishoma", desc: "Istirahat, Sholat, Makan Siang" },
  { time: "13.00", title: "Penampilan Peserta II", desc: "Sesi tanya jawab & presentasi" },
  { time: "15.30", title: "Penjurian", desc: "Penilaian oleh dewan juri ahli" },
  { time: "17.00", title: "Malam Puncak & Penutupan", desc: "Penganugerahan pemenang Duta Genre Klaten 2026" },
];

const DEFAULT_SPONSORS = [
  "Pemkab Klaten", "BKKBN", "DP3AKB", "Dinas Kesehatan", "BPBD Klaten", "Partner Media",
];

export default function ClientHome({ theme, typography, hero, popup, announcement, sections, stats }: ClientHomeProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [showAnn, setShowAnn] = useState(true);
  const [scrolled, setScrolled] = useState(false);

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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closePopup = () => { setShowPopup(false); sessionStorage.setItem("popup_shown", "true"); };

  const cReg = useCountUp(stats.totalRegistered);
  const cIn = useCountUp(stats.totalCheckedIn);
  const cPct = useCountUp(stats.percentagePresent);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Announcement Bar */}
      {announcement?.enabled && showAnn && (
        <div className="relative z-50 flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium text-white bg-orange-600">
          <span>{announcement.text}</span>
          <button onClick={() => setShowAnn(false)} className="ml-2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed left-0 right-0 z-40 transition-all ${announcement?.enabled && showAnn ? "top-[32px]" : "top-0"}`}>
        <div className={`transition-all ${scrolled ? "bg-white shadow-md border-b border-gray-100" : "bg-transparent"}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">DG</div>
              <div className="hidden sm:block">
                <span className={`text-xs font-bold uppercase tracking-wide block ${scrolled ? "text-gray-900" : "text-white"}`}>Duta Genre</span>
                <span className="text-[9px] text-orange-500 font-medium uppercase tracking-wide">Kabupaten Klaten</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/cek-qr" className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-100 ${scrolled ? "text-gray-600" : "text-white/90"}`}>
                <QrCode className="w-4 h-4" /> Cek Tiket
              </Link>
              <Link href="/daftar" className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors">
                <Ticket className="w-4 h-4" /> Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean Design */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background */}
        {heroBgImage ? (
          <div className="absolute inset-0">
            <img src={heroBgImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />
        )}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-6">
                <Sparkles className="w-3 h-3" /> {heroSubtitle}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {heroTitle}
              </h1>
              
              <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed max-w-lg">
                {heroDesc}
              </p>

              <div className="flex flex-wrap gap-3 mb-12">
                <Link href={heroBtnLink} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors">
                  <Ticket className="w-4 h-4" /> {heroBtnText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/cek-qr" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                  <QrCode className="w-4 h-4" /> Cek Status Tiket
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{cReg.toLocaleString("id-ID")}</div>
                  <div className="text-xs text-gray-500 font-medium">Pendaftar</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{cIn.toLocaleString("id-ID")}</div>
                  <div className="text-xs text-gray-500 font-medium">Hadir</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{cPct}%</div>
                  <div className="text-xs text-gray-500 font-medium">Kehadiran</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl opacity-10" />
                <div className="absolute inset-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                      <Award className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Duta Genre</h3>
                    <p className="text-sm text-gray-500">Generasi Berencana</p>
                    <p className="text-xs text-gray-400 mt-1">Kabupaten Klaten 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: <CalendarDays className="w-5 h-5" />, text: "2026", sub: "Tahun Pelaksanaan" },
              { icon: <MapPin className="w-5 h-5" />, text: venueAddress.split(",")[0], sub: "Lokasi Acara" },
              { icon: <Ticket className="w-5 h-5" />, text: "E-Ticket QR", sub: "Tiket Digital Gratis" },
              { icon: <Award className="w-5 h-5" />, text: "Duta Genre", sub: "Apresiasi Klaten" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-5 px-4">
                <span className="text-orange-600">{item.icon}</span>
                <span className="text-sm font-semibold text-gray-900">{item.text}</span>
                <span className="text-xs text-gray-500">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      {aboutSect && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">{aboutSect.name}</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
                  {aboutSect.content?.heading || "Tentang"} Duta Genre
                </h2>
                <div className="text-gray-600 text-sm leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: aboutSect.content?.description || "Informasi seputar acara." }}
                />
                <Link href="/daftar" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-orange-600 hover:text-orange-700">
                  Daftar Tiket Sekarang <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                {aboutSect.content?.imageUrl ? (
                  <img src={aboutSect.content.imageUrl} alt="" className="w-full rounded-xl shadow-lg" />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Award className="w-16 h-16 text-orange-500 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-gray-700">Duta Genre Klaten</p>
                      <p className="text-xs text-gray-500">2026</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rundown Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">{rundownSect?.name || "Rundown Acara"}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Jadwal Acara</h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {rundownEvents.map((evt: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-16 text-sm font-bold text-orange-600">{evt.time}</div>
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">{evt.title || evt.name}</h3>
                  {(evt.desc || evt.description) && (
                    <p className="text-xs text-gray-500 mt-1">{evt.desc || evt.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Star Section */}
      {guestSect && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">{guestSect.name}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Bintang Tamu</h2>
            </div>

            {!guestSect.content?.stars?.length ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">Bintang Tamu Segera Diumumkan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {guestSect.content.stars.map((star: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {star.image ? (
                      <img src={star.image} alt={star.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                        <span className="text-3xl font-bold text-orange-500">{star.name?.[0]}</span>
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-900">{star.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{star.role || "Special Guest"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Location Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-600 text-xs font-bold uppercase tracking-wider">{lokasiSect?.name || "Lokasi"}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Lokasi Pelaksanaan</h2>
          </div>

          {mapUrl ? (
            <div className="rounded-xl overflow-hidden border border-gray-200 h-80 sm:h-96">
              <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">{venueAddress}</h3>
              <p className="text-sm text-gray-500 mt-1">Klaten, Jawa Tengah</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700">
                Buka Google Maps <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{sponsorSect?.name || "Mitra & Sponsor"}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {sponsors.map((sp: any, i: number) => (
              <div key={i} className="px-5 py-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {typeof sp === "string" ? sp : sp.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-orange-600 to-amber-600">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 sm:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Ambil Tiket Gratis Sekarang</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Dapatkan e-ticket QR Code untuk menghadiri acara Duta Genre Kabupaten Klaten 2026. Pendaftaran cepat dan mudah.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/daftar" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700">
                    <Ticket className="w-4 h-4" /> Registrasi Tiket
                  </Link>
                  <Link href="/cek-qr" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">
                    <QrCode className="w-4 h-4" /> Cek Status
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <Ticket className="w-32 h-32 text-orange-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">DG</div>
            <p className="text-xs text-gray-500">{copyright}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>genreklaten.web.id</span>
            <Link href="/admin/login" className="hover:text-orange-600">Admin</Link>
          </div>
        </div>
      </footer>

      {/* Popup */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden relative">
            <button onClick={closePopup} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
            {popup.image && <img src={popup.image} alt={popup.title} className="w-full aspect-video object-cover" />}
            <div className="p-5">
              <h3 className="text-base font-bold text-gray-900 mb-2">{popup.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{popup.text}</p>
              {popup.buttonText && (
                <Link href={popup.buttonLink || "#"} onClick={closePopup}
                  className="flex w-full py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg justify-center hover:bg-orange-700">
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