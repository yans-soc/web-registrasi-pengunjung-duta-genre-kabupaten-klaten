"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Trash2,
  RefreshCw,
  FileText,
  Clock,
  User,
  CheckCircle,
  Database,
  Palette,
  Layout,
  FileCode2,
  Image as ImageIcon,
  Lock,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Download,
  UploadCloud,
  AlertCircle,
  Copy,
  X,
  PlusCircle,
} from "lucide-react";

interface Log {
  id: number;
  action: string;
  details: string | null;
  createdAt: string;
  admin: {
    name: string;
    username: string;
    role: string;
  } | null;
}

interface FormField {
  id: number;
  label: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
  placeholder: string;
  options: string;
}

interface CustomSection {
  id: number;
  name: string;
  slug: string;
  isVisible: boolean;
  order: number;
  content: string; // JSON string
}

interface UploadRecord {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  created_at: string;
}

interface BackupFile {
  name: string;
  size: string;
  date: string;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>("logs");

  // General Settings States
  const [theme, setTheme] = useState({
    primary: "#EA580C",
    secondary: "#D97706",
    accent: "#f59e0b",
    background: "#f8fafc",
    text: "#0f172a",
    logo: "",
    favicon: "",
  });
  const [typography, setTypography] = useState({
    headingFont: "var(--font-geist-sans)",
    bodyFont: "var(--font-geist-sans)",
  });
  const [hero, setHero] = useState({
    enabled: true,
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    bgImage: "",
    overlay: 50,
  });
  const [popup, setPopup] = useState({
    enabled: false,
    title: "",
    text: "",
    image: "",
    buttonText: "",
    buttonLink: "",
  });
  const [announcement, setAnnouncement] = useState({
    enabled: false,
    text: "",
  });

  // Section States
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<CustomSection | null>(null);
  const [sectionContentEdit, setSectionContentEdit] = useState<string>("{}");

  // Form Field States
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [newField, setNewField] = useState({
    label: "",
    fieldName: "",
    fieldType: "text",
    required: false,
    placeholder: "",
    options: "",
  });

  // Media Library States
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Blacklist States
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [newBlacklistWord, setNewBlacklistWord] = useState("");

  // Backup States
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  // Logs and System States
  const [logs, setLogs] = useState<Log[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [resetConfirmInput, setResetConfirmInput] = useState<string>("");
  const [resetting, setResetting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Global loading
  const [loadingData, setLoadingData] = useState(true);

  // 1. Fetch data on load
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      // Fetch General Settings
      const settingsRes = await fetch("/api/admin/settings");
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        const setMap = settingsData.settings;
        if (setMap.theme) {
          const parsedTheme = JSON.parse(setMap.theme);
          setTheme({
            primary: parsedTheme.primary || "#EA580C",
            secondary: parsedTheme.secondary || "#D97706",
            accent: parsedTheme.accent || "#f59e0b",
            background: parsedTheme.background || "#f8fafc",
            text: parsedTheme.text || "#0f172a",
            logo: parsedTheme.logo || "",
            favicon: parsedTheme.favicon || "",
          });
        }
        if (setMap.typography) setTypography(JSON.parse(setMap.typography));
        if (setMap.hero) setHero(JSON.parse(setMap.hero));
        if (setMap.popup) setPopup(JSON.parse(setMap.popup));
        if (setMap.announcement) setAnnouncement(JSON.parse(setMap.announcement));
      }

      // Fetch Sections
      const sectionsRes = await fetch("/api/admin/sections");
      const sectionsData = await sectionsRes.json();
      if (sectionsData.success) {
        setSections(sectionsData.sections);
      }

      // Fetch Form Fields
      const fieldsRes = await fetch("/api/admin/form-fields");
      const fieldsData = await fieldsRes.json();
      if (fieldsData.success) {
        setFormFields(fieldsData.fields);
      }

      // Fetch Media Uploads
      const uploadsRes = await fetch("/api/admin/uploads");
      const uploadsData = await uploadsRes.json();
      if (uploadsData.success) {
        setUploads(uploadsData.uploads);
      }

      // Fetch Blacklist
      const blacklistRes = await fetch("/api/admin/blacklist");
      const blacklistData = await blacklistRes.json();
      if (blacklistData.success) {
        setBlacklist(blacklistData.blacklist);
      }

      // Fetch Backups
      fetchBackupList();

      // Fetch Logs
      fetchLogs();
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs);
      } else {
        setErrorMsg(data.error || "Gagal memuat log aktivitas.");
      }
    } catch (err) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchBackupList = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch("/api/admin/backup");
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Save General Settings Helper
  const saveSetting = async (key: string, value: any) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: JSON.stringify(value) }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Pengaturan ${key} berhasil disimpan!`);
      } else {
        alert(`Gagal menyimpan: ${data.error}`);
      }
    } catch (e) {
      alert("Kesalahan koneksi.");
    }
  };

  // Section Handlers
  const handleToggleSectionVisibility = async (sect: CustomSection) => {
    try {
      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sect.id, isVisible: !sect.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(sections.map((s) => (s.id === sect.id ? { ...s, isVisible: !s.isVisible } : s)));
      }
    } catch (e) {
      alert("Gagal memperbarui visibilitas.");
    }
  };

  const handleReorderSection = async (sect: CustomSection, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((s) => s.id === sect.id);
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sections.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...sections];
    // Swap
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Send update request (just saving the order key sequence)
    try {
      // Re-map orders
      const updates = reordered.map((s, idx) => ({ id: s.id, order: idx + 1 }));
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(reordered.map((s, idx) => ({ ...s, order: idx + 1 })));
      }
    } catch (e) {
      alert("Gagal merubah urutan.");
    }
  };

  const selectSectionForEdit = (sect: CustomSection) => {
    setSelectedSection(sect);
    setSectionContentEdit(JSON.stringify(JSON.parse(sect.content || "{}"), null, 2));
  };

  const handleSaveSectionContent = async () => {
    if (!selectedSection) return;
    try {
      // Validate JSON
      const parsed = JSON.parse(sectionContentEdit);
      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSection.id, content: JSON.stringify(parsed) }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Konten section berhasil disimpan!");
        setSections(sections.map((s) => (s.id === selectedSection.id ? { ...s, content: JSON.stringify(parsed) } : s)));
        setSelectedSection(null);
      } else {
        alert(data.error || "Gagal menyimpan konten.");
      }
    } catch (e) {
      alert("Kesalahan format JSON. Harap periksa kembali.");
    }
  };

  // Form Field Handlers
  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/form-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newField),
      });
      const data = await res.json();
      if (data.success) {
        setFormFields([...formFields, data.field]);
        setNewField({
          label: "",
          fieldName: "",
          fieldType: "text",
          required: false,
          placeholder: "",
          options: "",
        });
      } else {
        alert(data.error || "Gagal menambahkan field.");
      }
    } catch (e) {
      alert("Kesalahan koneksi.");
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus field formulir ini?")) return;
    try {
      const res = await fetch("/api/admin/form-fields", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setFormFields(formFields.filter((f) => f.id !== id));
      }
    } catch (e) {
      alert("Gagal menghapus field.");
    }
  };

  // Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploads([data.upload, ...uploads]);
      } else {
        alert(data.error || "Gagal mengunggah file.");
      }
    } catch (e) {
      alert("Kesalahan koneksi.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteUpload = async (id: number) => {
    if (!confirm("Hapus file media ini secara permanen?")) return;
    try {
      const res = await fetch("/api/admin/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setUploads(uploads.filter((u) => u.id !== id));
      } else {
        alert(data.error || "Gagal menghapus file.");
      }
    } catch (e) {
      alert("Kesalahan koneksi.");
    }
  };

  // Blacklist Handlers
  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlacklistWord.trim()) return;

    const updated = [...blacklist, newBlacklistWord.trim().toLowerCase()];
    try {
      const res = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklist: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setBlacklist(updated);
        setNewBlacklistWord("");
      }
    } catch (e) {
      alert("Gagal memperbarui blacklist.");
    }
  };

  const handleDeleteBlacklist = async (word: string) => {
    const updated = blacklist.filter((w) => w !== word);
    try {
      const res = await fetch("/api/admin/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklist: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setBlacklist(updated);
      }
    } catch (e) {
      alert("Gagal menghapus.");
    }
  };

  // Backup Handlers
  const handleCreateBackup = async () => {
    try {
      window.location.href = "/api/admin/backup";
    } catch (e) {
      alert("Gagal mengunduh file backup.");
    }
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Apakah Anda yakin ingin memulihkan database dari file ini? Semua data saat ini akan ditimpa!")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const backupData = JSON.parse(text);

        const res = await fetch("/api/admin/backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backup: backupData }),
        });

        const data = await res.json();
        if (data.success) {
          alert("Database berhasil dipulihkan!");
          window.location.reload();
        } else {
          alert(data.error || "Gagal memulihkan database.");
        }
      } catch (err) {
        alert("File backup tidak valid atau rusak.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmInput !== "HAPUS SEMUA DATA") {
      alert("Konfirmasi kata kunci salah.");
      return;
    }
    if (!confirm("Tindakan ini permanen! Seluruh data pengunjung akan dihapus.")) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset-data", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Data pengunjung berhasil di-reset.");
        setResetConfirmInput("");
        fetchLogs();
      } else {
        alert(data.error || "Gagal melakukan reset.");
      }
    } catch (err) {
      alert("Kesalahan koneksi.");
    } finally {
      setResetting(false);
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-sky-50 text-sky-705 border-sky-100";
      case "CREATE_ADMIN":
        return "bg-[#FFF8F2] text-[#EA580C] border-[#EA580C]/20";
      case "UPDATE_ADMIN":
        return "bg-amber-50 text-amber-705 border-amber-100";
      case "DELETE_ADMIN":
        return "bg-rose-50 text-rose-705 border-rose-100";
      case "RESET_DATA":
        return "bg-purple-50 text-purple-705 border-purple-100";
      case "MANUAL_CHECK_IN":
        return "bg-emerald-50 text-emerald-705 border-emerald-100";
      case "SCAN_CHECK_IN":
        return "bg-teal-50 text-teal-705 border-teal-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  if (loadingData) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C]" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Konfigurasi...</p>
      </div>
    );
  }

  if (errorMsg && logs.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-xl mx-auto mt-12 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-red-800 uppercase tracking-wider">Akses Ditolak</h2>
        <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
      </div>
    );
  }

  const tabs = [
    { id: "logs", name: "Logs & Sistem", icon: FileText },
    { id: "theme", name: "Tema & Desain", icon: Palette },
    { id: "popups", name: "Banner & Popup", icon: AlertCircle },
    { id: "sections", name: "Daftar Section", icon: Layout },
    { id: "form", name: "Form Builder", icon: FileCode2 },
    { id: "media", name: "Media Upload", icon: ImageIcon },
    { id: "security", name: "Database & Keamanan", icon: Lock },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan E-Ticketing</h1>
        <p className="text-sm text-slate-500">Konfigurasi tema, dynamic form, customize section landing page, blacklist, backup database, dan audit logs.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 scrollbar-none pb-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedSection(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all border-b-2 ${
                isActive
                  ? "border-[#EA580C] text-[#EA580C] bg-[#FFF8F2]/50"
                  : "border-transparent text-slate-500 hover:text-[#EA580C] hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* TABS CONTENT */}
      <div className="space-y-6">
        {/* TAB 1: LOGS & SISTEM */}
        {activeTab === "logs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#EA580C]" />
                  Kelola Event
                </h2>
                <p className="text-xs text-slate-500">
                  Sistem aktif. Semua pendaftaran dan log check-in disimpan secara aman dalam database MySQL.
                </p>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450 font-semibold uppercase tracking-wider">Status Database</span>
                    <span className="text-emerald-700 font-black flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Terhubung
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50/55 border border-red-100 rounded-2xl shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-black text-red-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Danger Zone
                </h2>
                <p className="text-xs text-red-700 leading-relaxed font-medium">
                  Tindakan di bawah ini akan <strong>menghapus secara permanen</strong> seluruh data pengunjung (status check-in, signature, dan logs pendaftaran).
                </p>

                <form onSubmit={handleResetData} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                      Ketik <strong>HAPUS SEMUA DATA</strong> untuk konfirmasi:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="HAPUS SEMUA DATA"
                      value={resetConfirmInput}
                      onChange={(e) => setResetConfirmInput(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-red-700 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetConfirmInput !== "HAPUS SEMUA DATA" || resetting}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors uppercase tracking-wider"
                  >
                    {resetting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    {resetting ? "Memproses Reset..." : "Reset Data Pengunjung"}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  100 Log Aktivitas Terbaru
                </h2>
                <button
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="p-2 border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 text-slate-600 rounded-xl transition-all"
                  title="Refresh Log"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-150 sticky top-0 z-10">
                        <th className="px-5 py-3">Waktu</th>
                        <th className="px-5 py-3">Pelaku</th>
                        <th className="px-5 py-3 text-center">Aksi</th>
                        <th className="px-5 py-3">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {loadingLogs ? (
                        <tr>
                          <td colSpan={4} className="py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <RefreshCw className="w-6 h-6 animate-spin text-[#EA580C]" />
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Memuat Log...</p>
                            </div>
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-slate-400 font-medium">
                            Belum ada log aktivitas tercatat.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors text-slate-650">
                            <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              {new Date(log.createdAt).toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {log.admin ? (
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800 flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" /> {log.admin.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-semibold uppercase">{log.admin.role === "SUPER_ADMIN" ? "Super Admin" : "Scanner"}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-medium">Sistem Otomatis</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${getActionBadgeClass(log.action)}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-medium text-slate-700 max-w-xs break-words">
                              {log.details || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEMA & DESAIN */}
        {activeTab === "theme" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Palette & Font */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-6">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#EA580C]" />
                Color Palette & Typography
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Warna Utama (Primary)</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={theme.primary}
                      onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.primary}
                      onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Warna Sekunder (Secondary)</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={theme.secondary}
                      onChange={(e) => setTheme({ ...theme, secondary: e.target.value })}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.secondary}
                      onChange={(e) => setTheme({ ...theme, secondary: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Warna Latar Belakang (Background)</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.background}
                      onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Logo Website (Dynamic Logo)</label>
                  <input
                    type="text"
                    value={theme.logo || ""}
                    onChange={(e) => setTheme({ ...theme, logo: e.target.value })}
                    placeholder="Contoh: /uploads/nama-file.png atau url luar"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Gunakan URL file dari tab media di bawah.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Favicon Website (.ico / .png)</label>
                  <input
                    type="text"
                    value={theme.favicon || ""}
                    onChange={(e) => setTheme({ ...theme, favicon: e.target.value })}
                    placeholder="Contoh: /uploads/favicon.ico atau url luar"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Gunakan URL favicon yang valid untuk tab browser.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Font Heading</label>
                  <select
                    value={typography.headingFont}
                    onChange={(e) => setTypography({ ...typography, headingFont: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="var(--font-geist-sans)">Geist Sans (Default Next.js)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                    <option value="'Poppins', sans-serif">Poppins</option>
                    <option value="'Inter', sans-serif">Inter</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    saveSetting("theme", theme);
                    saveSetting("typography", typography);
                  }}
                  className="px-5 py-2.5 bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#EA580C]/90 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Tampilan
                </button>
              </div>
            </div>

            {/* Hero Section Config */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#EA580C]" />
                Hero Section Customizer
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hero-enabled"
                    checked={hero.enabled}
                    onChange={(e) => setHero({ ...hero, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#EA580C]"
                  />
                  <label htmlFor="hero-enabled" className="text-xs font-bold text-slate-700">Aktifkan Hero Section</label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Utama (Title)</label>
                  <input
                    type="text"
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    placeholder="Contoh: Apresiasi & Pemilihan Duta Genre Klaten 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sub-judul (Badge/Subtitle)</label>
                  <input
                    type="text"
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    placeholder="Contoh: Registrasi Pengunjung Dibuka"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={3}
                    value={hero.description}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm resize-none"
                    placeholder="Tuliskan deskripsi lengkap acara..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teks Tombol Utama</label>
                    <input
                      type="text"
                      value={hero.buttonText}
                      onChange={(e) => setHero({ ...hero, buttonText: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link Tombol Utama</label>
                    <input
                      type="text"
                      value={hero.buttonLink}
                      onChange={(e) => setHero({ ...hero, buttonLink: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gambar Latar Belakang (URL)</label>
                    <input
                      type="text"
                      value={hero.bgImage}
                      onChange={(e) => setHero({ ...hero, bgImage: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700"
                      placeholder="/uploads/file.png atau link eksternal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kegelapan Overlay %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={hero.overlay}
                      onChange={(e) => setHero({ ...hero, overlay: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => saveSetting("hero", hero)}
                  className="px-5 py-2.5 bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#EA580C]/90 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Hero Config
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: POPUPS & ANNOUNCEMENTS */}
        {activeTab === "popups" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Announcement Banner */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Announcement Bar (Running Text)
              </h2>
              <p className="text-xs text-slate-500">
                Akan muncul di bagian paling atas halaman Landing Page & Registrasi Pengunjung.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="announce-enabled"
                    checked={announcement.enabled}
                    onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#EA580C]"
                  />
                  <label htmlFor="announce-enabled" className="text-xs font-bold text-slate-700">Aktifkan Running Text</label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isi Pesan Pengumuman</label>
                  <input
                    type="text"
                    value={announcement.text}
                    onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    placeholder="Contoh: Pendaftaran ditutup jam 19.00 WIB!"
                  />
                </div>

                <button
                  onClick={() => saveSetting("announcement", announcement)}
                  className="px-5 py-2.5 bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#EA580C]/90 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Pengumuman
                </button>
              </div>
            </div>

            {/* Modal Pop-up Banner */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#EA580C]" />
                Modal Pop-up Builder
              </h2>
              <p className="text-xs text-slate-500">
                Akan muncul dalam bentuk pop-up overlay pada saat pengunjung pertama kali membuka Landing Page.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popup-enabled"
                    checked={popup.enabled}
                    onChange={(e) => setPopup({ ...popup, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[#EA580C]"
                  />
                  <label htmlFor="popup-enabled" className="text-xs font-bold text-slate-700">Aktifkan Modal Pop-up</label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Pop-up (Title)</label>
                  <input
                    type="text"
                    value={popup.title}
                    onChange={(e) => setPopup({ ...popup, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gambar Pop-up (URL)</label>
                  <input
                    type="text"
                    value={popup.image}
                    onChange={(e) => setPopup({ ...popup, image: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    placeholder="/uploads/file.png atau link eksternal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isi Pesan Pop-up</label>
                  <textarea
                    rows={3}
                    value={popup.text}
                    onChange={(e) => setPopup({ ...popup, text: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teks Tombol Aksi</label>
                    <input
                      type="text"
                      value={popup.buttonText}
                      onChange={(e) => setPopup({ ...popup, buttonText: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link Tombol Aksi</label>
                    <input
                      type="text"
                      value={popup.buttonLink}
                      onChange={(e) => setPopup({ ...popup, buttonLink: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => saveSetting("popup", popup)}
                  className="px-5 py-2.5 bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#EA580C]/90 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan Pop-up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DAFTAR SECTION */}
        {activeTab === "sections" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* List Sections */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4 lg:col-span-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#EA580C]" />
                Urutan Section Landing Page
              </h2>
              <p className="text-xs text-slate-500">
                Ubah visibilitas, urutkan letak section di landing page dengan menaikkan/menurunkan posisi.
              </p>

              <div className="space-y-3 pt-2">
                {sections.map((sect, idx) => (
                  <div
                    key={sect.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      selectedSection?.id === sect.id
                        ? "border-[#EA580C] bg-[#FFF8F2]/50"
                        : sect.isVisible
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800">{sect.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{sect.slug}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleSectionVisibility(sect)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          sect.isVisible
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                            : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                        }`}
                        title={sect.isVisible ? "Sembunyikan Section" : "Tampilkan Section"}
                      >
                        {sect.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleReorderSection(sect, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-500"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleReorderSection(sect, "down")}
                        disabled={idx === sections.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-500"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => selectSectionForEdit(sect)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-[#FFF8F2] hover:bg-[#FEEAD6] text-[#EA580C] rounded-lg border border-[#EA580C]/20 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Editor Panel */}
            <div className="lg:col-span-2">
              {selectedSection ? (
                <div className="bg-white rounded-2xl border border-[#EA580C]/20 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Edit Konten: {selectedSection.name}
                      </h3>
                      <p className="text-xs text-slate-550">Format data dalam bentuk JSON. Pastikan struktur data valid.</p>
                    </div>
                    <button
                      onClick={() => setSelectedSection(null)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Struktur JSON Konten</label>
                    <textarea
                      rows={14}
                      value={sectionContentEdit}
                      onChange={(e) => setSectionContentEdit(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setSelectedSection(null)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveSectionContent}
                      className="px-5 py-2.5 bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#EA580C]/90 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Simpan Perubahan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400">
                  <Layout className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-550 mb-1">Pilih Section</h4>
                  <p className="text-xs">Klik tombol "Edit" pada daftar section sebelah kiri untuk menyesuaikan konten.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: FORM BUILDER */}
        {activeTab === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* List Current Form Fields */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4 lg:col-span-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Daftar Kolom Pendaftaran (Form Fields)
              </h2>
              <p className="text-xs text-slate-500">
                Berikut adalah kolom formulir yang akan diisi oleh pengunjung pada halaman registrasi tiket.
              </p>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-4 py-3">Label Form</th>
                      <th className="px-4 py-3">Nama Field (DB)</th>
                      <th className="px-4 py-3">Tipe Input</th>
                      <th className="px-4 py-3 text-center">Wajib (Required)</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {formFields.map((field) => (
                      <tr key={field.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3.5 text-slate-800 font-bold">{field.label}</td>
                        <td className="px-4 py-3.5 text-mono text-[10px] text-slate-500">{field.fieldName}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 border border-slate-200 uppercase tracking-wider text-slate-600">
                            {field.fieldType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {field.required ? (
                            <span className="text-rose-600 text-xs font-bold uppercase">Ya</span>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">Tidak</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {/* Protect critical fields from being deleted to prevent crashes (e.g. name, status) */}
                          {["name"].includes(field.fieldName) ? (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteField(field.id)}
                              className="text-rose-600 hover:text-rose-800"
                            >
                              Hapus
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add New Field Form */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4 lg:col-span-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#EA580C]" />
                Tambah Field Form
              </h2>

              <form onSubmit={handleAddField} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Label Kolom (Indonesian)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nomor WhatsApp"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Nama Kolom (CamelCase / Tanpa Spasi)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: whatsapp"
                    value={newField.fieldName}
                    onChange={(e) => setNewField({ ...newField, fieldName: e.target.value.replace(/[^a-zA-Z0-9]/g, "") })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Tipe Input</label>
                  <select
                    value={newField.fieldType}
                    onChange={(e) => setNewField({ ...newField, fieldType: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700"
                  >
                    <option value="text">Text (Biasa)</option>
                    <option value="number">Number (Angka)</option>
                    <option value="select">Dropdown (Pilihan)</option>
                    <option value="textarea">Textarea (Paragraf)</option>
                    <option value="date">Date (Tanggal)</option>
                  </select>
                </div>

                {newField.fieldType === "select" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Opsi Dropdown (Pisahkan Dengan Koma)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pria, Wanita"
                      value={newField.options}
                      onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Placeholder (Petunjuk)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Masukkan nomor whatsapp Anda..."
                    value={newField.placeholder}
                    onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required-field"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="w-4 h-4 rounded text-[#EA580C]"
                  />
                  <label htmlFor="required-field" className="text-xs font-bold text-slate-700">Wajib Diisi (Required)</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs rounded-xl shadow-md transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Tambah Kolom Baru
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: MEDIA UPLOAD */}
        {activeTab === "media" && (
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#EA580C]" />
                  Media Library
                </h2>
                <p className="text-xs text-slate-500">Unggah berkas gambar/sponsor/overlay, lalu salin URL nya ke Hero/Sponsor/Popup settings.</p>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4" />
                  {uploadingFile ? "Mengunggah..." : "Unggah Gambar"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingFile}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {uploads.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-350 rounded-2xl p-16 text-center text-slate-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-550 mb-1">Belum Ada File Media</h4>
                <p className="text-xs">Mulai unggah gambar latar belakang, logo sponsor, atau avatar bintang tamu di sini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {uploads.map((up) => (
                  <div key={up.id} className="group bg-slate-55 rounded-2xl overflow-hidden border border-slate-150 flex flex-col justify-between shadow-xs">
                    <div className="relative aspect-square w-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      <img src={up.fileUrl} alt={up.fileName} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-3 space-y-2 border-t border-slate-100 bg-white">
                      <p className="text-[10px] font-bold text-slate-800 truncate" title={up.fileName}>
                        {up.fileName}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold">
                        {(up.fileSize / 1024).toFixed(1)} KB
                      </p>

                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(up.fileUrl);
                            alert("Link media berhasil disalin ke clipboard!");
                          }}
                          className="flex-1 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[9px] font-bold text-slate-650 flex items-center justify-center gap-1 transition-all"
                        >
                          <Copy className="w-2.5 h-2.5" /> Salin URL
                        </button>
                        <button
                          onClick={() => handleDeleteUpload(up.id)}
                          className="p-1 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-600 transition-all"
                          title="Hapus Media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DATABASE & KEAMANAN */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Blacklist Management */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#EA580C]" />
                Blacklist & Proteksi Konten
              </h2>
              <p className="text-xs text-slate-500">
                Pencegah pendaftaran spam atau penggunaan kata tidak sopan pada kolom nama. Masukkan kata kasar atau domain email yang diblokir.
              </p>

              <form onSubmit={handleAddBlacklist} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Contoh: spammer, anjing, mailinator.com"
                  value={newBlacklistWord}
                  onChange={(e) => setNewBlacklistWord(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#EA580C] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#EA580C]/90 transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Blokir
                </button>
              </form>

              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Kata/Domain Diblokir ({blacklist.length})</label>
                {blacklist.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada kata terblokir.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {blacklist.map((word) => (
                      <span
                        key={word}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 font-bold border border-rose-100 rounded-full text-[10px] tracking-wide"
                      >
                        {word}
                        <button
                          type="button"
                          onClick={() => handleDeleteBlacklist(word)}
                          className="text-rose-400 hover:text-rose-700 font-bold"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Backup & Restore database */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-[#EA580C]" />
                Backup & Restore Database
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Pencadangan dinamis seluruh data pengaturan, section halaman utama, kolom formulir, data pengunjung, serta log aktivitas ke format file JSON terenkripsi/terkompresi. Anda dapat langsung mengunduh cadangan ini ke komputer lokal Anda dan memulihkannya kapan saja dengan mengunggah kembali file tersebut.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleCreateBackup}
                  className="w-full py-3 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4.5 h-4.5" /> Buat & Unduh Cadangan JSON
                </button>

                <label className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-center">
                  <UploadCloud className="w-4.5 h-4.5" /> Pulihkan dari File JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackupFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
