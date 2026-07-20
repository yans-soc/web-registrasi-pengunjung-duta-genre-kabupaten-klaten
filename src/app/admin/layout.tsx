"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Scan, 
  Users, 
  UserCog, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  Loader2,
  Bell
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // If we are on the login page, render without layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const [admin, setAdmin] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [logo, setLogo] = useState<string>("");
  const [favicon, setFavicon] = useState<string>("");

  useEffect(() => {
    const fetchAdminSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.authenticated) {
          setAdmin(data.user);
        } else {
          // If auth check fails, redirect to login
          router.push("/admin/login");
        }
      } catch (err) {
        console.error("Error fetching admin session:", err);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    const fetchThemeSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings?.theme) {
          const parsed = JSON.parse(data.settings.theme);
          if (parsed.logo) setLogo(parsed.logo);
          if (parsed.favicon) setFavicon(parsed.favicon);
        }
      } catch (err) {
        console.error("Error fetching settings for layout:", err);
      }
    };

    fetchAdminSession();
    fetchThemeSettings();
  }, [router]);

  useEffect(() => {
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [favicon]);

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari sistem?")) return;
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/admin/login");
      } else {
        alert("Gagal logout. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, role: "ALL" },
    { name: "QR Scanner", href: "/admin/scanner", icon: Scan, role: "ALL" },
    { name: "Data Pengunjung", href: "/admin/visitors", icon: Users, role: "ALL" },
    { name: "Kelola Admin", href: "/admin/admins", icon: UserCog, role: "superadmin" },
    { name: "Pengaturan & Logs", href: "/admin/settings", icon: Settings, role: "ALL" },
  ];

  const filteredNavItems = navItems.filter(
    (item) => item.role === "ALL" || (admin && admin.role === item.role)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Memuat Sesi Admin...</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex">
      {/* Sidebar for Desktop - Styled like Purity UI */}
      <aside className="w-68 bg-white border-r border-slate-150 flex-col justify-between hidden md:flex shrink-0 p-5">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center gap-3 py-4 px-2 mb-6 border-b border-slate-100">
              {logo ? (
                <img src={logo} alt="Logo" className="w-9 h-9 object-contain rounded-xl" />
              ) : (
                <div className="w-9 h-9 bg-[#EA580C] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-[#EA580C]/10">
                  <Shield className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-xs font-black text-slate-800 tracking-wider leading-none uppercase truncate">DUTA GENRE KLATEN</h1>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">PURITY SYSTEM</span>
              </div>
            </div>

            {/* Navigation Links - Rounded card style with icon bg */}
            <nav className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black tracking-wide transition-all duration-300 ${
                      isActive 
                        ? "bg-white text-slate-800 shadow-xl shadow-slate-100 border border-slate-100" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive 
                        ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25" 
                        : "bg-slate-50 text-slate-500 border border-slate-100"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Help / Promo card & Footer Profile inside Sidebar */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            {/* Cute Help Card */}
            <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#EA580C] to-[#DC2626] text-white shadow-xl shadow-[#EA580C]/10">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-wider">Butuh Bantuan?</h4>
              <p className="text-[10px] text-orange-100 mt-1 leading-relaxed">
                Akses logs sistem atau kontak admin utama untuk bantuan sistem.
              </p>
              <Link 
                href="/admin/settings"
                className="inline-block mt-3 px-4 py-2 bg-white text-[#EA580C] text-[10px] font-black rounded-xl hover:bg-slate-50 hover:shadow-lg transition-all text-center w-full uppercase tracking-wider"
              >
                Buka Pengaturan
              </Link>
            </div>

            {/* User Profile Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#FFF8F2] text-[#EA580C] border border-[#EA580C]/20 font-black flex items-center justify-center text-xs uppercase shrink-0">
                  {admin.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-slate-800 truncate leading-none">{admin.name}</p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                    {admin.role.replace("_", " ")}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Floating Glassmorphic Top Navbar */}
        <header className="sticky top-4 z-40 bg-white/70 backdrop-blur-md border border-white/40 shadow-sm mx-4 md:mx-6 my-4 rounded-3xl p-4 flex items-center justify-between transition-all print:hidden">
          {/* Breadcrumbs & Title */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 tracking-wider">
              <span>Pages</span>
              <span>/</span>
              <span className="text-slate-700 capitalize font-bold">
                {filteredNavItems.find(item => item.href === pathname)?.name || "Portal"}
              </span>
            </div>
            <h2 className="text-sm font-black text-slate-800 tracking-tight mt-1 capitalize">
              {filteredNavItems.find(item => item.href === pathname)?.name || "Portal Admin"}
            </h2>
          </div>

          {/* Right Header Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 text-slate-500 hover:bg-slate-100 border border-slate-150 rounded-xl md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Notification & Session Badges */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8F2] border border-[#EA580C]/20 rounded-xl text-[9px] font-black text-[#EA580C] uppercase tracking-widest">
                <Shield className="w-3 h-3" /> {admin.role.replace("_", " ")}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-600 font-black text-xs uppercase shadow-sm">
              {admin.name.slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Real Content Body */}
        <main className="flex-1 px-4 md:px-6 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer (Sidebar) - Styled matching Purity UI */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-full max-w-xs bg-white h-full p-6 shadow-2xl transition-transform duration-300">
            {/* Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl border border-slate-150"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Brand */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
              {logo ? (
                <img src={logo} alt="Logo" className="w-9 h-9 object-contain rounded-xl" />
              ) : (
                <div className="w-9 h-9 bg-[#EA580C] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-[#EA580C]/10">
                  <Shield className="w-4 h-4" />
                </div>
              )}
              <div>
                <h1 className="text-xs font-black text-slate-800 tracking-wider leading-none uppercase">GENRE KLATEN</h1>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">PURITY SYSTEM</span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-2 flex-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black tracking-wide transition-all duration-300 ${
                      isActive 
                        ? "bg-white text-slate-800 shadow-xl shadow-slate-100 border border-slate-100" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive 
                        ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/25" 
                        : "bg-slate-50 text-slate-500 border border-slate-100"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Profile & Logout */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF8F2] text-[#EA580C] border border-[#EA580C]/20 font-black flex items-center justify-center text-xs uppercase shrink-0">
                    {admin.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-800 leading-none">{admin.name}</p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                      {admin.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="p-2 bg-white hover:bg-rose-50 border border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}