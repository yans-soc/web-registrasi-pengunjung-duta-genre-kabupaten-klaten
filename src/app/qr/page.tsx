"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { Download, ArrowLeft, Printer, RefreshCw, AlertTriangle } from "lucide-react";

function TicketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uuid = searchParams.get("uuid");
  const code = searchParams.get("code");
  const name = searchParams.get("name");
  const status = searchParams.get("status");
  const sig = searchParams.get("sig");

  const [qrUrl, setQrUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!uuid || !code || !name || !status || !sig) {
      setError("Parameter tiket tidak lengkap atau tidak valid.");
      return;
    }

    // QR payload per spec: URL with query params (uuid, code, sig) for scanner compatibility
    const origin = window.location.origin;
    const qrPayload = `${origin}/cek-qr?uuid=${encodeURIComponent(uuid)}&code=${encodeURIComponent(code)}&sig=${encodeURIComponent(sig)}`;

    QRCode.toDataURL(
      qrPayload,
      {
        width: 300,
        margin: 2,
        color: {
          dark: "#EA580C",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (err) {
          console.error("QR Code generation error:", err);
          setError("Gagal menghasilkan QR Code.");
        } else {
          setQrUrl(url);
        }
      }
    );
  }, [uuid, code, name, status, sig]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `Tiket-${code}-${name?.replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-[#DC2626] mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Tiket Tidak Valid</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Link
          href="/daftar"
          className="inline-block w-full py-3 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
          style={{ backgroundColor: "#EA580C" }}
        >
          Daftar Ulang
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#EA580C] font-medium transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
      </Link>

      {/* Ticket Container */}
      <div id="ticket-card" className="bg-white rounded-3xl shadow-xl border border-slate-150 overflow-hidden relative print:shadow-none print:border-none">
        {/* Ticket Header Banner - Orange theme */}
        <div className="bg-gradient-to-r from-[#EA580C] to-[#DC2626] text-white p-6 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#DC2626] rounded-full filter blur-xl opacity-20 -mr-6 -mt-6"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#EA580C] rounded-full filter blur-lg opacity-25 -ml-8 -mb-8"></div>
          
          <span className="bg-white/25 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block border border-white/35">
            E-TICKET RESMI
          </span>
          <h2 className="text-base font-extrabold tracking-tight uppercase">Duta Genre Klaten 2026</h2>
          <p className="text-[10px] text-white/80 font-medium mt-0.5">Apresiasi & Pemilihan Malam Puncak</p>
        </div>

        {/* Visitor Details */}
        <div className="p-8 flex flex-col items-center border-b border-dashed border-slate-200 relative">
          <div className="absolute -left-3 bottom-0 w-6 h-6 bg-[#FFF8F2] rounded-full border-r border-slate-200 transform translate-y-1/2 print:bg-white"></div>
          <div className="absolute -right-3 bottom-0 w-6 h-6 bg-[#FFF8F2] rounded-full border-l border-slate-200 transform translate-y-1/2 print:bg-white"></div>

          {/* QR Code Container */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-6 shadow-inner flex items-center justify-center">
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code Ticket" className="w-48 h-48 rounded-lg" />
            ) : (
              <div className="w-48 h-48 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Membuat QR...</span>
              </div>
            )}
          </div>

          {/* Unique Code - per spec */}
          <div className="text-center mb-3">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">UNIQUE CODE</span>
            <p className="text-xl font-black text-[#EA580C] tracking-tight mt-0.5">{code}</p>
          </div>

          {/* QR Token */}
          <div className="text-center">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">QR TOKEN</span>
            <p className="text-xs font-mono text-slate-600 mt-0.5">{uuid?.substring(0, 8)}...{uuid?.substring(24)}</p>
          </div>
        </div>

        {/* Ticket Details Footer */}
        <div className="bg-slate-50/50 px-8 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">NAMA PENGUNJUNG</span>
              <span className="text-sm font-bold text-slate-800 break-words block">{name}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">STATUS KEHADIRAN</span>
              <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                PENDING
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Tunjukkan QR Code ini pada panitia saat memasuki ruangan acara. <br />
              Satu QR Code hanya dapat digunakan satu kali.
            </p>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={handleDownload}
          disabled={!qrUrl}
          className="flex-1 py-3 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" /> Simpan QR
        </button>
        <button
          onClick={handlePrint}
          disabled={!qrUrl}
          className="flex-1 py-3 text-white font-bold rounded-xl hover:brightness-110 disabled:bg-slate-300 transition-colors text-sm flex items-center justify-center gap-2 shadow-lg"
          style={{ backgroundColor: "#EA580C" }}
        >
          <Printer className="w-4 h-4" /> Cetak Tiket
        </button>
      </div>
    </div>
  );
}

export default function QRPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#111827] py-12 px-6 flex flex-col justify-center items-center">
      <Suspense
        fallback={
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-medium">Memuat data tiket...</p>
          </div>
        }
      >
        <TicketContent />
      </Suspense>
    </div>
  );
}