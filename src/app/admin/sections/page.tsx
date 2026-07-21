"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  Clock,
  Star,
  MapPin,
  Users,
  FileText,
  Image,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  GripVertical,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Section {
  id: number;
  slug: string;
  name: string;
  isVisible: boolean;
  order: number;
  content: any;
}

interface RundownEvent {
  time: string;
  title: string;
  description: string;
}

interface GuestStar {
  name: string;
  role: string;
  image: string;
}

interface Sponsor {
  name: string;
  logo: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const SLUG_ICON: Record<string, React.ReactNode> = {
  hero: <LayoutDashboard className="w-4 h-4" />,
  about: <FileText className="w-4 h-4" />,
  rundown: <Clock className="w-4 h-4" />,
  "guest-star": <Star className="w-4 h-4" />,
  lokasi: <MapPin className="w-4 h-4" />,
  sponsor: <Users className="w-4 h-4" />,
  footer: <Globe className="w-4 h-4" />,
};

const SLUG_LABEL: Record<string, string> = {
  hero: "Hero / Banner",
  about: "Tentang Acara",
  rundown: "Rundown / Jadwal",
  "guest-star": "Bintang Tamu",
  lokasi: "Lokasi & Venue",
  sponsor: "Sponsor & Partner",
  footer: "Footer",
};

function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border ${
        type === "success"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Section Content Editors ────────────────────────────────────────────────

function HeroEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const c = content || {};
  const set = (k: string, v: any) => onChange({ ...c, [k]: v });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Utama</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={c.title || ""}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Apresiasi & Pemilihan Duta Genre..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle / Badge</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={c.subtitle || ""}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="E-Ticketing Pengunjung Resmi"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          rows={3}
          value={c.description || ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Portal registrasi tiket pengunjung resmi..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Teks Tombol Utama</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={c.buttonText || ""}
            onChange={(e) => set("buttonText", e.target.value)}
            placeholder="Daftar Tiket Sekarang"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Link Tombol</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={c.buttonLink || ""}
            onChange={(e) => set("buttonLink", e.target.value)}
            placeholder="/daftar"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">URL Background Image</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={c.bgImage || ""}
            onChange={(e) => set("bgImage", e.target.value)}
            placeholder="https://... atau /uploads/..."
          />
          {c.bgImage && (
            <img src={c.bgImage} alt="preview" className="mt-2 rounded-lg w-full max-h-32 object-cover border border-slate-200" />
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Opacity Overlay (0–100)</label>
          <div className="flex items-center gap-2">
            <input
              type="range" min={0} max={100} step={5}
              className="flex-1"
              value={c.overlay ?? 50}
              onChange={(e) => set("overlay", Number(e.target.value))}
            />
            <span className="text-sm font-bold text-slate-700 w-8 text-right">{c.overlay ?? 50}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const c = content || {};
  const set = (k: string, v: any) => onChange({ ...c, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi (HTML diizinkan)</label>
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none font-mono"
          rows={6}
          value={c.description || ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="<p>Duta Genre adalah...</p>"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">URL Gambar</label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={c.imageUrl || ""}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://... atau /uploads/..."
        />
        {c.imageUrl && (
          <img src={c.imageUrl} alt="preview" className="mt-2 rounded-lg w-full max-h-36 object-cover border border-slate-200" />
        )}
      </div>
    </div>
  );
}

function RundownEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const events: RundownEvent[] = content?.events || [];

  const setEvents = (evts: RundownEvent[]) => onChange({ ...content, events: evts });

  const addEvent = () =>
    setEvents([...events, { time: "", title: "", description: "" }]);

  const removeEvent = (i: number) => setEvents(events.filter((_, idx) => idx !== i));

  const updateEvent = (i: number, field: keyof RundownEvent, val: string) => {
    const updated = events.map((e, idx) =>
      idx === i ? { ...e, [field]: val } : e
    );
    setEvents(updated);
  };

  const moveEvent = (i: number, dir: "up" | "down") => {
    const arr = [...events];
    const target = dir === "up" ? i - 1 : i + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[i], arr[target]] = [arr[target], arr[i]];
    setEvents(arr);
  };

  return (
    <div className="space-y-3">
      {events.map((evt, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Waktu</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={evt.time}
                onChange={(e) => updateEvent(i, "time", e.target.value)}
                placeholder="08.00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Judul Kegiatan</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={evt.title}
                onChange={(e) => updateEvent(i, "title", e.target.value)}
                placeholder="Registrasi & Check-In Peserta"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Keterangan (opsional)</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={evt.description}
              onChange={(e) => updateEvent(i, "description", e.target.value)}
              placeholder="Keterangan tambahan..."
            />
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button
              type="button"
              onClick={() => moveEvent(i, "up")}
              disabled={i === 0}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => moveEvent(i, "down")}
              disabled={i === events.length - 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => removeEvent(i)}
              className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEvent}
        className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-400 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Agenda
      </button>
    </div>
  );
}

function GuestStarEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const stars: GuestStar[] = content?.stars || [];

  const setStars = (s: GuestStar[]) => onChange({ ...content, stars: s });

  const addStar = () =>
    setStars([...stars, { name: "", role: "", image: "" }]);

  const removeStar = (i: number) => setStars(stars.filter((_, idx) => idx !== i));

  const updateStar = (i: number, field: keyof GuestStar, val: string) => {
    setStars(stars.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  return (
    <div className="space-y-3">
      {stars.map((star, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nama</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={star.name}
                onChange={(e) => updateStar(i, "name", e.target.value)}
                placeholder="Nama Bintang Tamu"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Peran / Deskripsi</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={star.role}
                onChange={(e) => updateStar(i, "role", e.target.value)}
                placeholder="Special Guest / Musisi"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">URL Foto</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={star.image}
                onChange={(e) => updateStar(i, "image", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          {star.image && (
            <img src={star.image} alt={star.name} className="mt-2 h-16 w-16 object-cover rounded-full border border-slate-200" />
          )}
          <button
            type="button"
            onClick={() => removeStar(i)}
            className="absolute top-3 right-3 p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addStar}
        className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-400 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Bintang Tamu
      </button>
    </div>
  );
}

function LokasiEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const c = content || {};
  const set = (k: string, v: any) => onChange({ ...c, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Nama / Label Venue</label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={c.venue || ""}
          onChange={(e) => set("venue", e.target.value)}
          placeholder="Gedung Pemkab Klaten"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          rows={2}
          value={c.address || ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Jl. Pemuda No.1, Klaten, Jawa Tengah"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Embed URL Google Maps
          <span className="ml-1 text-slate-400 font-normal">(gunakan link embed, bukan link biasa)</span>
        </label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={c.mapUrl || ""}
          onChange={(e) => set("mapUrl", e.target.value)}
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Cara mendapatkan: Buka Google Maps → Titik lokasi → Share → Embed a map → Copy URL dari src="..."
        </p>
        {c.mapUrl && (
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-36">
            <iframe src={c.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
          </div>
        )}
      </div>
    </div>
  );
}

function SponsorEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const sponsors: Sponsor[] = content?.sponsors || [];

  const setSponsors = (s: Sponsor[]) => onChange({ ...content, sponsors: s });

  const addSponsor = () => setSponsors([...sponsors, { name: "", logo: "" }]);

  const removeSponsor = (i: number) => setSponsors(sponsors.filter((_, idx) => idx !== i));

  const updateSponsor = (i: number, field: keyof Sponsor, val: string) => {
    setSponsors(sponsors.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  return (
    <div className="space-y-3">
      {sponsors.map((sp, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nama Sponsor</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={sp.name}
                onChange={(e) => updateSponsor(i, "name", e.target.value)}
                placeholder="Pemkab Klaten"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">URL Logo</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={sp.logo}
                onChange={(e) => updateSponsor(i, "logo", e.target.value)}
                placeholder="https://... atau /uploads/..."
              />
            </div>
          </div>
          {sp.logo && (
            <img src={sp.logo} alt={sp.name} className="mt-2 h-10 object-contain border border-slate-200 rounded-lg px-2 bg-white" />
          )}
          <button
            type="button"
            onClick={() => removeSponsor(i)}
            className="absolute top-3 right-3 p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addSponsor}
        className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-400 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Sponsor
      </button>
    </div>
  );
}

function FooterEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const c = content || {};
  const set = (k: string, v: any) => onChange({ ...c, [k]: v });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Teks Copyright</label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={c.copyright || ""}
          onChange={(e) => set("copyright", e.target.value)}
          placeholder="© 2026 Duta Genre Kabupaten Klaten. All Rights Reserved."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Teks Tambahan (opsional)</label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={c.extraText || ""}
          onChange={(e) => set("extraText", e.target.value)}
          placeholder="Sistem E-Ticketing — genreklaten.web.id"
        />
      </div>
    </div>
  );
}

// ── Dynamic editor router ──────────────────────────────────────────────────

function SectionContentEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (c: any) => void;
}) {
  const { slug, content } = section;

  if (slug === "hero") return <HeroEditor content={content} onChange={onChange} />;
  if (slug === "about") return <AboutEditor content={content} onChange={onChange} />;
  if (slug === "rundown") return <RundownEditor content={content} onChange={onChange} />;
  if (slug === "guest-star") return <GuestStarEditor content={content} onChange={onChange} />;
  if (slug === "lokasi") return <LokasiEditor content={content} onChange={onChange} />;
  if (slug === "sponsor") return <SponsorEditor content={content} onChange={onChange} />;
  if (slug === "footer") return <FooterEditor content={content} onChange={onChange} />;

  // Generic fallback: JSON editor
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">Konten (JSON)</label>
      <textarea
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        rows={10}
        value={typeof content === "object" ? JSON.stringify(content, null, 2) : content || "{}"}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {}
        }}
      />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminSectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
  };

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sections");
      const data = await res.json();
      if (data.success) setSections(data.sections);
    } catch {
      showToast("Gagal memuat data section.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Toggle visibility
  const toggleVisibility = async (sect: Section) => {
    try {
      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sect.id, isVisible: !sect.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        setSections((prev) =>
          prev.map((s) => (s.id === sect.id ? { ...s, isVisible: !s.isVisible } : s))
        );
        showToast(
          `Section "${sect.name}" ${!sect.isVisible ? "ditampilkan" : "disembunyikan"}.`
        );
      } else {
        showToast(data.error || "Gagal update visibilitas.", "error");
      }
    } catch {
      showToast("Koneksi gagal.", "error");
    }
  };

  // Reorder
  const reorder = async (sect: Section, dir: "up" | "down") => {
    const idx = sections.findIndex((s) => s.id === sect.id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === sections.length - 1) return;

    const arr = [...sections];
    const ti = dir === "up" ? idx - 1 : idx + 1;
    [arr[idx], arr[ti]] = [arr[ti], arr[idx]];

    const updates = arr.map((s, i) => ({ id: s.id, order: i + 1 }));
    try {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setSections(arr.map((s, i) => ({ ...s, order: i + 1 })));
      } else {
        showToast(data.error || "Gagal merubah urutan.", "error");
      }
    } catch {
      showToast("Koneksi gagal.", "error");
    }
  };

  // Start editing
  const startEdit = (sect: Section) => {
    setEditingId(sect.id);
    setEditContent(
      typeof sect.content === "string"
        ? JSON.parse(sect.content || "{}")
        : sect.content || {}
    );
  };

  // Save content
  const saveContent = async () => {
    if (editingId === null) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, content: editContent }),
      });
      const data = await res.json();
      if (data.success) {
        setSections((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, content: editContent } : s))
        );
        setEditingId(null);
        setEditContent(null);
        showToast("Konten section berhasil disimpan!");
      } else {
        showToast(data.error || "Gagal menyimpan.", "error");
      }
    } catch {
      showToast("Koneksi gagal.", "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent(null);
  };

  const editingSection = sections.find((s) => s.id === editingId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/settings")}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-black text-slate-900 text-base leading-none">Editor Section</h1>
              <p className="text-[10px] text-slate-400 mt-0.5">Kelola tampilan & konten halaman utama</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Lihat Halaman
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Info banner */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-xs text-orange-700 font-medium">
          💡 Atur urutan, visibilitas, dan konten setiap section halaman utama. Perubahan langsung tampil di website.
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">Belum ada section. Jalankan seed database terlebih dahulu.</p>
          </div>
        ) : (
          sections.map((sect, idx) => (
            <div
              key={sect.id}
              className={`bg-white rounded-2xl border transition-all duration-200 ${
                editingId === sect.id
                  ? "border-orange-300 shadow-lg shadow-orange-100/60"
                  : "border-slate-100 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Section header row */}
              <div className="flex items-center gap-3 px-5 py-4">
                {/* Drag hint */}
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Icon & name */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: sect.isVisible ? "#FFF7ED" : "#F8FAFC",
                    color: sect.isVisible ? "#EA580C" : "#94A3B8",
                  }}
                >
                  {SLUG_ICON[sect.slug] ?? <LayoutDashboard className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                      {SLUG_LABEL[sect.slug] || sect.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      {sect.slug}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sect.isVisible
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {sect.isVisible ? "Tampil" : "Tersembunyi"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Urutan #{sect.order}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => reorder(sect, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    title="Naik"
                  >
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => reorder(sect, "down")}
                    disabled={idx === sections.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    title="Turun"
                  >
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(sect)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      sect.isVisible
                        ? "hover:bg-amber-50 text-amber-500"
                        : "hover:bg-emerald-50 text-emerald-500"
                    }`}
                    title={sect.isVisible ? "Sembunyikan" : "Tampilkan"}
                  >
                    {sect.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => (editingId === sect.id ? cancelEdit() : startEdit(sect))}
                    className={`p-1.5 rounded-lg transition-colors ${
                      editingId === sect.id
                        ? "bg-slate-100 text-slate-500"
                        : "hover:bg-orange-50 text-orange-500"
                    }`}
                    title="Edit Konten"
                  >
                    {editingId === sect.id ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Pencil className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Inline editor panel */}
              {editingId === sect.id && editingSection && (
                <div className="border-t border-orange-100 px-5 py-5 bg-orange-50/30">
                  <SectionContentEditor
                    section={{ ...editingSection, content: editContent }}
                    onChange={setEditContent}
                  />

                  <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={saveContent}
                      disabled={saving}
                      className="px-5 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Simpan
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
