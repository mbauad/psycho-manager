"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/sessoes", label: "Sessoes", icon: Calendar },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/financeiro", label: "Financeiro", icon: CreditCard },
  { href: "/relatorios", label: "Relatorios", icon: FileText },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">PM</div>
        <span className="sidebar-brand-text">PsychoManager</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <Icon />
              <span className="nav-item-label">{item.label}</span>
            </Link>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: 24 }}>Conta</div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="nav-item"
          style={{ width: "100%", border: "none", background: "none", textAlign: "left", cursor: "pointer" }}
        >
          <LogOut />
          <span className="nav-item-label">Sair</span>
        </button>
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar hidden md:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72 bg-[#1e3a5f]">
            <button
              type="button"
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button
              type="button"
              className="header-btn md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="header-right">
            <button type="button" className="header-btn" onClick={() => signOut({ callbackUrl: "/login" })} title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
            <div className="user-avatar">PM</div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}