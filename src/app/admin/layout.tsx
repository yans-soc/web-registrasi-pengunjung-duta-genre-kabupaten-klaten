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
  Bell,
  Layout,
  ChevronDown
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
    { name: "Editor Section", href: "/admin/sections", icon: Layout, role: "superadmin" },
    { name: "Pengaturan & Logs", href: "/admin/settings", icon: Settings, role: "ALL" },
  ];

  const filteredNavItems = navItems.filter(
    (item) => item.role === "ALL" || (admin && admin.role === item.role)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
          {logo ? (
            <img src={logo} alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
          ) : (
            <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wide">Duta Genre</h1>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-orange-600 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {admin.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{admin.name}</p>
              <span className="text-[10px] text-slate-400 uppercase">{admin.role.replace("_", " ")}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-sm font-bold text-gray-900 capitalize">
                  {filteredNavItems.find(item => item.href === pathname)?.name || "Dashboard"}
                </h2>
                <p className="text-xs text-gray-500">
                  {filteredNavItems.find(item => item.href === pathname)?.name || "Portal Admin"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-[10px] font-bold uppercase">
                <Shield className="w-3 h-3" /> {admin.role.replace("_", " ")}
              </span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                {admin.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
                ) : (
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm font-bold uppercase">Admin Panel</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-orange-600 text-white" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-slate-700">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
                  {admin.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{admin.name}</p>
                  <span className="text-[10px] text-slate-400 uppercase">{admin.role.replace("_", " ")}</span>
                </div>
                <button onClick={() => { setSidebarOpen(false); handleLogout(); }} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
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