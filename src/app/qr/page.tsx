"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Download, ArrowLeft, Printer, RefreshCw, AlertTriangle,
  Ticket, CheckCircle, Share2, Home
} from "lucide-react";

const STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scalePop { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
  .fade-up { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-up-1 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.06s both; }
  .fade-up-2 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.14s both; }
  .fade-up-3 { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
  .pop { animation: scalePop 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
  .action-btn {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 6px; padding: 12px 8px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    color: rgba(255,255,255,0.6);
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
    cursor: pointer; transition: all 0.2s ease;
  }
  .action-btn:hover { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.25); color: rgba(255,255,255,0.9); }
  .action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .ticket-card { border: 2px solid #e5e7eb !important; box-shadow: none !important; }
  }
`;

function TicketContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");
  const code = searchParams.get("code");
  const name = searchParams.get("name");
  const status = searchParams.get("status");
  const sig = searchParams.get("sig");

  const [qrUrl, setQrUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!uuid || !code || !name || !status || !sig) {
      setError("Parameter tiket tidak lengkap atau tidak valid.");
      return;
    }
    const origin = window.location.origin;
    const qrPayload = `${origin}/cek-qr?uuid=${encodeURIComponent(uuid)}&code=${encodeURIComponent(code)}&sig=${encodeURIComponent(sig)}`;
    QRCode.toDataURL(qrPayload, { width: 320, margin: 2, color: { dark: "#0a0a0a", light: "#ffffff" } }, (err, url) => {
      if (err) setError("Gagal menghasilkan QR Code.");
      else setQrUrl(url);
    });
  }, [uuid, code, name, status, sig]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `Tiket-${code}-${name?.replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/cek-qr?uuid=${uuid}&code=${code}&sig=${sig}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Tiket ${name}`, url: shareUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-sm fade-up">
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center"
          style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 32px 80px -20px rgba(0,0,0,0.6)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <AlertTriangle className="w-7 h-7" style={{ color: "#f87171" }} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Tiket Tidak Valid</h3>
          <p className="text-xs text-white/40 mb-8 leading-relaxed font-medium">{error}</p>
          <Link href="/daftar"
            className="inline-flex items-center justify-center gap-2 w-full py-4 font-black rounded-xl text-xs uppercase tracking-wider text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
            <Ticket className="w-4 h-4" />
            Daftar Ulang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-5 relative z-10">
      {/* Back */}
      <Link href="/" className="no-print inline-flex items-center gap-2 text-xs font-bold text-white/35 hover:text-white/70 transition-colors fade-up">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      {/* Success badge */}
      <div className="no-print flex justify-center fade-up-1">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
          <CheckCircle className="w-3.5 h-3.5" />
          Pendaftaran Berhasil
        </div>
      </div>

      {/* ── Ticket Card ── */}
      <div
        id="ticket-card"
        className="ticket-card rounded-2xl overflow-hidden pop"
        style={{
          background: "rgba(10,8,18,0.95)",
          border: "1px solid rgba(124,58,237,0.15)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 100px -20px rgba(124,58,237,0.25), 0 40px 80px -30px rgba(0,0,0,0.7)"
        }}>
        {/* Header */}
        <div className="relative overflow-hidden px-7 py-7 text-center" style={{ background: "linear-gradient(160deg, #0f0d1f 0%, #0c0a1a 100%)" }}>
          {/* Gradient top line */}
          <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, #7C3AED, #1D4ED8)" }} />
          {/* Glow orbs */}
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] opacity-20" style={{ backgroundColor: "#7C3AED" }} />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-[60px] opacity-10" style={{ backgroundColor: "#1D4ED8" }} />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] mb-3"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.8)" }}>
              <Ticket className="w-3 h-3" />
              E-Ticket Resmi
            </span>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Duta Genre Klaten 2026</h2>
            <p className="text-white/35 text-[10px] uppercase tracking-wider mt-1 font-semibold">Malam Puncak Pemilihan & Apresiasi</p>
          </div>
        </div>

        {/* Tear line */}
        <div className="relative flex items-center" style={{ backgroundColor: "rgba(10,8,18,0.95)" }}>
          <div className="absolute -left-3.5 w-7 h-7 rounded-full z-10" style={{ backgroundColor: "#050408", border: "1px solid rgba(124,58,237,0.15)", borderLeft: "none" }} />
          <div className="flex-1 mx-4" style={{ borderTop: "2px dashed rgba(124,58,237,0.1)" }} />
          <div className="absolute -right-3.5 w-7 h-7 rounded-full z-10" style={{ backgroundColor: "#050408", border: "1px solid rgba(124,58,237,0.15)", borderRight: "none" }} />
        </div>

        {/* QR + code */}
        <div className="px-7 py-7 flex flex-col items-center" style={{ backgroundColor: "rgba(10,8,18,0.95)" }}>
          {/* QR wrapper */}
          <div className="p-3.5 bg-white rounded-2xl mb-6 shadow-lg" style={{ boxShadow: "0 0 0 1px rgba(124,58,237,0.2), 0 20px 40px rgba(0,0,0,0.4)" }}>
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code Ticket" className="w-48 h-48 rounded-xl block" />
            ) : (
              <div className="w-48 h-48 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50">
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: "#7C3AED" }} />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Generasi QR...</span>
              </div>
            )}
          </div>

          {/* Code */}
          <div className="w-full text-center mb-5">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 mb-1.5">Kode Registrasi</p>
            <p className="text-3xl font-black tracking-tight uppercase"
              style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {code}
            </p>
          </div>

          {/* UUID token */}
          <div className="w-full rounded-xl px-4 py-2.5 text-center"
            style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.1)" }}>
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">ID Token Keamanan</p>
            <p className="text-[10px] font-mono text-white/35">
              {uuid?.substring(0, 8)}...{uuid?.substring(24)}
            </p>
          </div>
        </div>

        {/* Tear line */}
        <div className="relative flex items-center" style={{ backgroundColor: "rgba(10,8,18,0.95)" }}>
          <div className="absolute -left-3.5 w-7 h-7 rounded-full z-10" style={{ backgroundColor: "#050408", border: "1px solid rgba(124,58,237,0.15)", borderLeft: "none" }} />
          <div className="flex-1 mx-4" style={{ borderTop: "2px dashed rgba(124,58,237,0.1)" }} />
          <div className="absolute -right-3.5 w-7 h-7 rounded-full z-10" style={{ backgroundColor: "#050408", border: "1px solid rgba(124,58,237,0.15)", borderRight: "none" }} />
        </div>

        {/* Footer details */}
        <div className="px-7 py-6" style={{ background: "rgba(5,4,12,0.8)", borderTop: "1px solid rgba(124,58,237,0.06)" }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Nama Pengunjung</p>
              <p className="text-xs font-bold text-white uppercase">{name}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Status Tiket</p>
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider" style={{ color: "#a78bfa" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#7C3AED" }} />
                PENDING VERIFIKASI
              </span>
            </div>
          </div>
          <div className="pt-4 text-center" style={{ borderTop: "1px solid rgba(124,58,237,0.08)" }}>
            <p className="text-[9px] text-white/25 leading-relaxed font-semibold">
              Harap simpan/screenshot tiket ini. Tunjukkan kepada petugas di gerbang masuk.<br />
              <span style={{ color: "#a78bfa" }}>Satu tiket digital hanya berlaku untuk satu kali pemindaian.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="no-print grid grid-cols-3 gap-3 fade-up-2">
        <button onClick={handleShare} className="action-btn">
          <Share2 className="w-4 h-4" style={{ color: "#7C3AED" }} />
          {copied ? "Disalin!" : "Bagikan"}
        </button>
        <button onClick={handleDownload} disabled={!qrUrl} className="action-btn">
          <Download className="w-4 h-4" style={{ color: "#6366f1" }} />
          Unduh QR
        </button>
        <button
          onClick={handlePrint}
          disabled={!qrUrl}
          className="flex flex-col items-center justify-center gap-1.5 py-3.5 font-black rounded-xl text-[9px] uppercase tracking-wider text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
          <Printer className="w-4 h-4" />
          Cetak
        </button>
      </div>

      {/* Nav links */}
      <div className="no-print flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-wider text-white/25 fade-up-3">
        <Link href="/" className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
          <Home className="w-3.5 h-3.5" />
          Beranda
        </Link>
        <span className="text-white/10">|</span>
        <Link href="/cek-qr" className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
          <Ticket className="w-3.5 h-3.5" />
          Cek Tiket Lain
        </Link>
      </div>
    </div>
  );
}

export default function QRPage() {
  return (
    <div className="min-h-screen bg-[#050408] py-10 sm:py-16 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      <style jsx global>{STYLES}</style>

      {/* Background glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-[0.1] pointer-events-none" style={{ backgroundColor: "#7C3AED" }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.07] pointer-events-none" style={{ backgroundColor: "#1D4ED8" }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#7C3AED20 1px, transparent 1px), linear-gradient(90deg, #7C3AED20 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-16 relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED, #1D4ED8)" }}>
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-white/35 font-bold uppercase tracking-wider">Memuat Tiket Anda...</p>
          </div>
        }
      >
        <TicketContent />
      </Suspense>
    </div>
  );
}
