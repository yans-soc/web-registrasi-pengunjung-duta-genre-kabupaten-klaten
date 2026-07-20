"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Camera, 
  Keyboard, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  RefreshCw, 
  Search,
  Volume2,
  VolumeX
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminScanner() {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");

  // Manual code check-in state
  const [manualCode, setManualCode] = useState<string>("");
  const [manualSearchLoading, setManualSearchLoading] = useState<boolean>(false);
  const [manualVisitor, setManualVisitor] = useState<any | null>(null);
  const [manualError, setManualError] = useState<string>("");

  // Camera scanner state
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string>("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    visitor?: {
      name: string;
      ticketCode: string;
      checkInTime?: string;
      checkedInBy?: string;
    };
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const qrRegionId = "qr-reader-target";
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Beep sound generator
  const playBeep = (type: "success" | "error") => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error("Audio beep failed:", e);
    }
  };

  // Start Camera QR Scanner
  const startScanner = async () => {
    setScannerError("");
    setScanResult(null);
    setScanning(true);

    try {
      setTimeout(async () => {
        try {
          const html5Qrcode = new Html5Qrcode(qrRegionId);
          html5QrcodeRef.current = html5Qrcode;

          await html5Qrcode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            async (decodedText) => {
              // QR format: URL with params uuid, code, sig
              try {
                const url = new URL(decodedText);
                const uuid = url.searchParams.get("uuid");
                const code = url.searchParams.get("code");
                const sig = url.searchParams.get("sig");

                if (!uuid || !code || !sig) {
                  throw new Error("QR Code tidak valid atau format salah. Harus mengandung uuid, code, dan sig.");
                }

                await stopScanner();
                await handleApiCheckIn(uuid, code, sig);
              } catch (err: any) {
                await stopScanner();
                playBeep("error");
                setScanResult({
                  success: false,
                  message: err.message || "Teks QR Code bukan format tiket resmi.",
                });
              }
            },
            () => {} // verbose error ignored
          );
        } catch (err: any) {
          console.error("Scanner failed to start:", err);
          setScannerError("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
          setScanning(false);
        }
      }, 300);
    } catch (err: any) {
      setScannerError("Inisialisasi scanner gagal.");
      setScanning(false);
    }
  };

  // Stop Camera QR Scanner
  const stopScanner = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setScanning(false);
  };

  // Call Check-In API with uuid, uniqueCode, signature
  const handleApiCheckIn = async (uuid: string, uniqueCode: string, signature: string) => {
    try {
      const res = await fetch("/api/visitors/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, uniqueCode, signature }),
      });

      const data = await res.json();
      if (!res.ok) {
        playBeep("error");
        setScanResult({
          success: false,
          message: data.error || "Check-in gagal.",
          visitor: data.visitor,
        });
      } else {
        playBeep("success");
        setScanResult({
          success: true,
          message: "Check-in Berhasil!",
          visitor: data.visitor,
        });
      }
    } catch (err) {
      playBeep("error");
      setScanResult({
        success: false,
        message: "Koneksi internet bermasalah. Gagal check-in.",
      });
    }
  };

  // Manual Ticket Search
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setManualSearchLoading(true);
    setManualError("");
    setManualVisitor(null);

    try {
      const res = await fetch(`/api/visitors/search?q=${encodeURIComponent(manualCode)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pencarian gagal");
      }

      const match = data.results.find((v: any) => v.ticketCode === manualCode);
      if (!match) {
        throw new Error("Kode tiket tidak terdaftar.");
      }

      setManualVisitor(match);
    } catch (err: any) {
      setManualError(err.message || "Pengunjung tidak ditemukan.");
      playBeep("error");
    } finally {
      setManualSearchLoading(false);
    }
  };

  // Manual Check-In Submit using uuid + ticketCode + signature
  const handleManualCheckInSubmit = async () => {
    if (!manualVisitor) return;
    setManualSearchLoading(true);

    try {
      await handleApiCheckIn(manualVisitor.uuid, manualVisitor.ticketCode, manualVisitor.signature);
      setManualVisitor(null);
      setManualCode("");
    } catch (err) {
      console.error(err);
    } finally {
      setManualSearchLoading(false);
    }
  };

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tabs Menu */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-150 shadow-sm">
        <button
          onClick={() => {
            stopScanner();
            setScanResult(null);
            setActiveTab("camera");
          }}
          className={`flex-1 py-3 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "camera"
              ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Camera className="w-4 h-4" /> Scanner Kamera
        </button>
        <button
          onClick={() => {
            stopScanner();
            setActiveTab("manual");
          }}
          className={`flex-1 py-3 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "manual"
              ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/10"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Keyboard className="w-4 h-4" /> Input Manual
        </button>
      </div>

      {/* Camera Scanner Tab */}
      {activeTab === "camera" && (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 sm:p-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Kamera Scanner QR</h3>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors border border-slate-150"
              title={soundEnabled ? "Nonaktifkan suara" : "Aktifkan suara"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#EA580C]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Scanner Container */}
          <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-850 flex flex-col justify-center items-center">
            <div id={qrRegionId} className="w-full h-full object-cover"></div>

            {/* Inactive Overlay */}
            {!scanning && !scanResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/80 text-white gap-4">
                <div className="w-16 h-16 rounded-full bg-[#EA580C]/20 text-[#EA580C] border border-[#EA580C]/20 flex items-center justify-center">
                  <Camera className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold">Kamera Siap</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                    Tekan tombol di bawah untuk menyalakan kamera & scan QR Code
                  </p>
                </div>
                <button
                  onClick={startScanner}
                  className="px-6 py-2.5 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#EA580C]/20 transition-all uppercase tracking-wider"
                >
                  Mulai Scan
                </button>
              </div>
            )}

            {/* Error Message */}
            {scannerError && (
              <div className="absolute inset-x-4 bottom-4 bg-rose-950/90 text-rose-200 text-[10px] font-bold p-3.5 rounded-xl border border-rose-800 text-center flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" /> {scannerError}
              </div>
            )}
          </div>

          {/* Scanner Control buttons */}
          {scanning && (
            <button
              onClick={stopScanner}
              className="mt-6 px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
            >
              Matikan Kamera
            </button>
          )}

          {/* Scan Results Card overlay */}
          {scanResult && (
            <div className="w-full mt-6">
              {scanResult.success ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-950">{scanResult.message}</h4>
                  <p className="text-sm font-bold text-slate-700 mt-1">{scanResult.visitor?.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Kode Tiket: {scanResult.visitor?.ticketCode}</p>
                  
                  <button
                    onClick={startScanner}
                    className="mt-5 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all uppercase tracking-wider"
                  >
                    Scan Tiket Selanjutnya
                  </button>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-rose-950">{scanResult.message}</h4>
                  
                  {scanResult.visitor && (
                    <div className="mt-3 bg-white/60 rounded-xl p-3.5 border border-rose-100/50 text-left max-w-xs mx-auto">
                      <p className="text-xs font-bold text-slate-800">{scanResult.visitor.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kode: {scanResult.visitor.ticketCode}</p>
                      <div className="mt-2.5 pt-2 border-t border-rose-100 text-[10px] text-slate-500 font-medium space-y-1">
                        <p>Sudah check-in oleh: <span className="font-bold text-slate-700">{scanResult.visitor.checkedInBy || "Sistem"}</span></p>
                        <p>Pada: <span className="font-bold text-slate-700">{new Date(scanResult.visitor.checkInTime || "").toLocaleTimeString("id-ID")} WIB</span></p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={startScanner}
                    className="mt-5 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all uppercase tracking-wider"
                  >
                    Coba Scan Lagi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Input Tab */}
      {activeTab === "manual" && (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 sm:p-8">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">Verifikasi & Check-In Manual</h3>

          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Masukkan Kode Tiket (Contoh: GEN-XXXXXX)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={manualSearchLoading}
              className="px-5 bg-[#EA580C] text-white font-bold rounded-xl hover:bg-[#EA580C]/90 transition-colors disabled:bg-slate-300 flex items-center justify-center"
            >
              {manualSearchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>

          {manualError && (
            <p className="text-xs font-bold text-rose-600 mt-4 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/50">
              {manualError}
            </p>
          )}

          {/* Manual Search Result Visitor card */}
          {manualVisitor && (
            <div className="mt-6 border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50 p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-850 uppercase tracking-wide">Detail Pengunjung</h4>
                  <p className="text-base font-black text-[#EA580C] mt-1">{manualVisitor.name}</p>
                  <p className="text-xs text-slate-500 font-semibold">{manualVisitor.ticketCode}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  manualVisitor.status === "CHECKED_IN" || manualVisitor.status === "CHECKED IN"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}>
                  {manualVisitor.status === "CHECKED_IN" || manualVisitor.status === "CHECKED IN" ? "Hadir" : "Pending"}
                </span>
              </div>

              {(manualVisitor.status === "CHECKED_IN" || manualVisitor.status === "CHECKED IN") ? (
                <div className="p-4 bg-emerald-50 text-emerald-850 text-xs rounded-xl border border-emerald-100 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pengunjung sudah check-in dan masuk ke ruangan acara.</span>
                </div>
              ) : (
                <button
                  onClick={handleManualCheckInSubmit}
                  disabled={manualSearchLoading}
                  className="w-full py-3.5 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold rounded-xl shadow-lg shadow-[#EA580C]/10 hover:shadow-[#EA580C]/20 transition-all text-xs flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <UserCheck className="w-4 h-4" /> Lakukan Check-In Sekarang
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}