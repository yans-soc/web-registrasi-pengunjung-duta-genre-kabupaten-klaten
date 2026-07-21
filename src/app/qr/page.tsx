"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { Download, ArrowLeft, Printer, RefreshCw, AlertTriangle, Ticket, CheckCircle, Share2, Home } from "lucide-react";

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

    QRCode.toDataURL(
      qrPayload,
      {
        width: 320,
        margin: 2,
        color: {
          dark: "#0C0A09",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (err) {
          setError("Gagal menghasilkan QR Code.");
        } else {
          setQrUrl(url);
        }
      }
    );
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
      try {
        await navigator.share({ title: `Tiket ${name}`, url: shareUrl });
      } catch (e) {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-[#12100E] rounded-2xl border border-white/[0.08] p-10 text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mx-auto mb-5">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Tiket Tidak Valid</h3>
          <p className="text-xs text-white/40 mb-8 leading-relaxed">{error}</p>
          <Link
            href="/daftar"
            className="inline-flex items-center justify-center gap-2 w-full py-4 text-[#0C0A09] font-black rounded-xl text-xs uppercase tracking-wider transition-all hover:brightness-110 shadow-lg"
            style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}
          >
            <Ticket className="w-4 h-4" />
            Daftar Ulang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-6 relative z-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-[#F97316] transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      {/* Success badge */}
      <div className="flex items-center justify-center gap-2 print:hidden">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-wider">
          <CheckCircle className="w-3.5 h-3.5" />
          Pendaftaran Berhasil
        </div>
      </div>

      {/* ── Ticket Card (Boarding Pass style) ── */}
      <div
        id="ticket-card"
        className="bg-[#141210] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none"
      >
        {/* Header */}
        <div
          className="relative overflow-hidden text-white px-7 py-7 text-center print:text-black"
          style={{ background: "linear-gradient(135deg, #1A1816 0%, #12100E 100%)" }}
        >
          {/* Accent lines */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FBBF24] to-[#F97316]" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#F97316]/5 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#FBBF24]/5 rounded-full blur-xl" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 print:border-black/10 print:text-black/50">
              <Ticket className="w-3 h-3 text-[#F97316]" />
              E-Ticket Resmi
            </span>
            <h2 className="text-xl font-black tracking-tight uppercase">Duta Genre Klaten 2026</h2>
            <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1 print:text-black/40">Malam Puncak Pemilihan & Apresiasi</p>
          </div>
        </div>

        {/* Ticket tear line */}
        <div className="relative flex items-center bg-[#141210] print:bg-white">
          <div className="absolute -left-3.5 w-7 h-7 bg-[#0C0A09] rounded-full border-r border-white/[0.08] z-10 print:bg-white print:border-black" />
          <div className="flex-1 border-t-2 border-dashed border-white/[0.08] mx-4 print:border-black/20" />
          <div className="absolute -right-3.5 w-7 h-7 bg-[#0C0A09] rounded-full border-l border-white/[0.08] z-10 print:bg-white print:border-black" />
        </div>

        {/* QR + Info */}
        <div className="px-7 py-7 bg-[#141210] flex flex-col items-center print:bg-white">
          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-xl mb-6 shadow-inner flex items-center justify-center">
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code Ticket" className="w-48 h-48 rounded-lg" />
            ) : (
              <div className="w-48 h-48 rounded-lg flex flex-col items-center justify-center text-slate-300 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Generasi QR...</span>
              </div>
            )}
          </div>

          {/* Ticket code display */}
          <div className="w-full text-center mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 print:text-black/30">Kode Registrasi</p>
            <p
              className="text-3xl font-black tracking-tight uppercase"
              style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {code}
            </p>
          </div>

          {/* Ticket Token */}
          <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-center print:bg-slate-50 print:border-black/5">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mb-1 print:text-black/30">ID Token Keamanan</p>
            <p className="text-[10px] font-mono text-white/50 print:text-black/60">
              {uuid?.substring(0, 8)}...{uuid?.substring(24)}
            </p>
          </div>
        </div>

        {/* Ticket tear line */}
        <div className="relative flex items-center bg-[#141210] print:bg-white">
          <div className="absolute -left-3.5 w-7 h-7 bg-[#0C0A09] rounded-full border-r border-white/[0.08] z-10 print:bg-white print:border-black" />
          <div className="flex-1 border-t-2 border-dashed border-white/[0.08] mx-4 print:border-black/20" />
          <div className="absolute -right-3.5 w-7 h-7 bg-[#0C0A09] rounded-full border-l border-white/[0.08] z-10 print:bg-white print:border-black" />
        </div>

        {/* Ticket details footer */}
        <div className="px-7 py-6 bg-[#181614] border-t border-white/[0.03] print:bg-slate-50 print:border-t-black/10">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 print:text-black/30 mb-1">Nama Pengunjung</p>
              <p className="text-xs font-bold text-white uppercase print:text-black">{name}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 print:text-black/30 mb-1">Status Tiket</p>
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-[#FBBF24]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0" />
                PENDING VERIFIKASI
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] text-center print:border-black/10">
            <p className="text-[9px] text-white/30 leading-relaxed font-semibold print:text-black/45">
              Harap simpan/screenshot tiket ini. Tunjukkan kepada petugas di gerbang masuk.<br />
              <span className="text-[#FBBF24]">Satu tiket digital hanya berlaku untuk satu kali pemindaian.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3 print:hidden">
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white/[0.02] border border-white/[0.08] text-white/70 hover:text-white font-bold rounded-xl hover:bg-white/[0.05] hover:border-white/20 transition-all text-[10px] uppercase tracking-wider shadow-sm"
        >
          <Share2 className="w-4 h-4 text-[#F97316]" />
          {copied ? "Disalin!" : "Bagikan"}
        </button>
        <button
          onClick={handleDownload}
          disabled={!qrUrl}
          className="flex flex-col items-center justify-center gap-2 py-3.5 bg-white/[0.02] border border-white/[0.08] text-white/70 hover:text-white font-bold rounded-xl hover:bg-white/[0.05] hover:border-white/20 disabled:opacity-40 transition-all text-[10px] uppercase tracking-wider shadow-sm"
        >
          <Download className="w-4 h-4 text-[#FBBF24]" />
          Unduh QR
        </button>
        <button
          onClick={handlePrint}
          disabled={!qrUrl}
          className="flex flex-col items-center justify-center gap-2 py-3.5 text-[#0C0A09] font-black rounded-xl disabled:opacity-40 transition-all text-[10px] uppercase tracking-wider shadow-md"
          style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}
        >
          <Printer className="w-4 h-4" />
          Cetak Tiket
        </button>
      </div>

      {/* Bottom navbar info */}
      <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-wider text-white/30 print:hidden mt-2">
        <Link href="/" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Home className="w-3.5 h-3.5" />
          Beranda
        </Link>
        <span className="text-white/10">|</span>
        <Link href="/cek-qr" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Ticket className="w-3.5 h-3.5" />
          Cek Tiket Lain
        </Link>
      </div>
    </div>
  );
}

export default function QRPage() {
  return (
    <div className="min-h-screen bg-[#0C0A09] py-10 sm:py-16 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      <style jsx global>{`
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
        }
      `}</style>
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="absolute right-[-10%] top-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 bg-orange-500" />
      <div className="absolute left-[-10%] bottom-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 bg-amber-500" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-16 relative z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#0C0A09] shadow-lg" style={{ background: "linear-gradient(135deg, #FBBF24, #F97316)" }}>
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Memuat Tiket Anda...</p>
          </div>
        }
      >
        <TicketContent />
      </Suspense>
    </div>
  );
}
