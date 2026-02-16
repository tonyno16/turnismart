"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  FileText,
  Calculator,
  ClipboardList,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const STORAGE_KEY = "turnismart-sidebar-collapsed";

function getManagerNavItems(): NavItem[] {
  return [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-5 shrink-0" /> },
    { href: "/schedule", label: "Programmazione", icon: <Calendar className="size-5 shrink-0" /> },
    { href: "/employees", label: "Dipendenti", icon: <Users className="size-5 shrink-0" /> },
    { href: "/locations", label: "Sedi", icon: <MapPin className="size-5 shrink-0" /> },
    { href: "/reports", label: "Report", icon: <FileText className="size-5 shrink-0" /> },
    { href: "/settings/accountant", label: "Commercialista", icon: <Calculator className="size-5 shrink-0" /> },
    { href: "/requests", label: "Richieste", icon: <ClipboardList className="size-5 shrink-0" /> },
    { href: "/settings", label: "Impostazioni", icon: <Settings className="size-5 shrink-0" /> },
    { href: "/profile", label: "Profilo", icon: <User className="size-5 shrink-0" /> },
  ];
}

function getEmployeeNavItems(): NavItem[] {
  return [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-5 shrink-0" /> },
    { href: "/my-schedule", label: "I miei turni", icon: <Calendar className="size-5 shrink-0" /> },
    { href: "/my-preferences", label: "Le mie preferenze", icon: <MapPin className="size-5 shrink-0" /> },
    { href: "/my-requests", label: "Le mie richieste", icon: <ClipboardList className="size-5 shrink-0" /> },
    { href: "/profile", label: "Profilo", icon: <User className="size-5 shrink-0" /> },
  ];
}

function getAccountantNavItems(): NavItem[] {
  return [
    { href: "/accountant", label: "Clienti", icon: <Users className="size-5 shrink-0" /> },
    { href: "/profile", label: "Profilo", icon: <Settings className="size-5 shrink-0" /> },
  ];
}

function getAdminNavItems(): NavItem[] {
  return [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="size-5 shrink-0" /> },
    { href: "/admin/organizations", label: "Organizzazioni", icon: <Users className="size-5 shrink-0" /> },
    { href: "/admin/analytics", label: "Analytics", icon: <FileText className="size-5 shrink-0" /> },
    { href: "/profile", label: "Profilo", icon: <User className="size-5 shrink-0" /> },
  ];
}

export function AppSidebar({
  userRole,
  className = "",
}: {
  userRole: "owner" | "manager" | "employee" | "accountant" | "admin";
  className?: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed, mounted]);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  const navItems =
    userRole === "owner" || userRole === "manager"
      ? getManagerNavItems()
      : userRole === "employee"
      ? getEmployeeNavItems()
      : userRole === "accountant"
      ? getAccountantNavItems()
      : userRole === "admin"
      ? getAdminNavItems()
      : getManagerNavItems();

  const toggleCollapsed = () => setCollapsed((c) => !c);

  const linkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    }`;

  const sidebarContent = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={linkClass(item.href)}
          onClick={() => setMobileOpen(false)}
        >
          {item.icon}
          {!collapsed && <span>{item.label}</span>}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Chiudi menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:z-auto ${
          collapsed ? "w-16" : "w-56"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${className}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-3 dark:border-zinc-800">
          {!collapsed && (
            <Link href="/dashboard" className="font-semibold text-zinc-900 dark:text-white">
              TurniSmart
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden rounded p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Chiudi menu"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden lg:flex rounded p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label={collapsed ? "Espandi sidebar" : "Comprimi sidebar"}
            >
              {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
            </button>
          </div>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg border border-zinc-300 bg-white p-2 shadow-sm lg:hidden dark:border-zinc-600 dark:bg-zinc-900"
        aria-label="Apri menu"
      >
        <Menu className="size-5" />
      </button>
    </>
  );
}
