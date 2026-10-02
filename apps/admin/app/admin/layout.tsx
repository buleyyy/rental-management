"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

type IconProps = { className?: string };
const ic = "h-[18px] w-[18px]";

const GridIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </svg>
);

const BuildingIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <rect x="4" y="3" width="16" height="18" rx="1" />
    <path d="M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M10 21v-3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V21" />
  </svg>
);

const UsersIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15 20a4.5 4.5 0 0 1 6-4.24" />
  </svg>
);

const FileSignatureIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M13 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8l-4-5Z" />
    <path d="M13 3v5h4" />
    <path d="M8 15.5c1-1 1.6-1.6 2.1-2.1.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4-.5.5-1.1 1.1-2.1 2.1H8v-1.4Z" />
  </svg>
);

const WalletIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <rect x="3" y="6" width="18" height="13" rx="1.5" />
    <path d="M3 10h18" />
    <path d="M15 14.5h3" />
  </svg>
);

const WrenchIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 4.6L4 16.2V20h3.8l5.3-5.3a4 4 0 0 0 4.6-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
  </svg>
);

const ReceiptIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M6 3h12v18l-2.5-1.5L13 21l-1.5-1.5L10 21l-2.5-1.5L6 21V3Z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

const CarIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M4 16V11l1.8-4.2A1.5 1.5 0 0 1 7.2 6h9.6a1.5 1.5 0 0 1 1.4.8L20 11v5" />
    <rect x="3" y="13" width="18" height="5" rx="1.2" />
    <circle cx="7.5" cy="18.5" r="1.4" />
    <circle cx="16.5" cy="18.5" r="1.4" />
  </svg>
);

const LogoutIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
    <path d="M13.5 16 18 12l-4.5-4M18 12H9" />
  </svg>
);

const PanelIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="M9.5 4.5v15" />
  </svg>
);

const InboxIcon = ({ className = ic }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
    <path d="M4 13.5 6.4 5.6A1.5 1.5 0 0 1 7.8 4.5h8.4a1.5 1.5 0 0 1 1.4 1.1L20 13.5" />
    <path d="M4 13.5V18a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-4.5h-4.2a1 1 0 0 0-.9.6 3.2 3.2 0 0 1-5.8 0 1 1 0 0 0-.9-.6H4Z" />
  </svg>
);

const SIDEBAR_KEY = "admin.sidebar";

const navItems: { href: string; label: string; icon: (p: IconProps) => ReactNode }[] = [
  { href: "/admin", label: "Dashboard", icon: GridIcon },
  { href: "/admin/properties", label: "Properties", icon: BuildingIcon },
  { href: "/admin/orders", label: "Orders", icon: InboxIcon },
  { href: "/admin/tenants", label: "Tenants", icon: UsersIcon },
  { href: "/admin/contracts", label: "Contracts", icon: FileSignatureIcon },
  { href: "/admin/payments", label: "Payments", icon: WalletIcon },
  { href: "/admin/maintenance", label: "Maintenance", icon: WrenchIcon },
  { href: "/admin/expenses", label: "Expenses", icon: ReceiptIcon },
  { href: "/admin/parking", label: "Parking", icon: CarIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  // Pulihkan pilihan sidebar terakhir (setelah mount, agar tidak mismatch hydration)
  useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_KEY) === "collapsed") setCollapsed(true);
    } catch {
      /* storage tidak tersedia: abaikan */
    }
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
    } catch {
      /* storage tidak tersedia: abaikan */
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname?.startsWith(href);
  };

  const currentLabel = navItems.find((item) => isActive(item.href))?.label ?? "Workspace";
  const userName = session?.user?.name || session?.user?.email || "Admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 ${collapsed ? "w-16" : "w-64"} bg-surface border-r border-border z-40 flex flex-col justify-between transition-[width] duration-200 motion-reduce:transition-none`}
      >
        <div className="flex flex-col">
          <div className={`h-16 flex items-center gap-3 border-b border-border ${collapsed ? "justify-center px-0" : "px-4"}`}>
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              RM
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold text-ink truncate tracking-tight">Rental Manager</span>
            )}
          </div>

          <nav className={`flex flex-col gap-0.5 pt-4 ${collapsed ? "px-2" : "px-3"}`}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center rounded-lg text-sm transition-colors ${
                    collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2"
                  } ${
                    active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-ink-muted font-medium hover:bg-surface-muted hover:text-ink"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active ? "text-primary-foreground" : "text-ink-faint group-hover:text-ink-muted"
                    }`}
                  />
                  <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`border-t border-border ${collapsed ? "p-2" : "p-3"}`}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors ${
              collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2"
            }`}
          >
            <LogoutIcon className="h-[18px] w-[18px] shrink-0 text-ink-faint" />
            <span className={collapsed ? "sr-only" : undefined}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header
        className={`fixed top-0 ${collapsed ? "left-16" : "left-64"} right-0 h-16 bg-surface border-b border-border z-30 px-6 flex items-center justify-between transition-[left] duration-200 motion-reduce:transition-none`}
      >
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            className="h-8 w-8 flex items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
          >
            <PanelIcon />
          </button>
          <span className="h-4 w-px bg-border" />
          <span>Rental Manager</span>
          <span className="text-ink-faint">/</span>
          <span className="text-ink font-semibold">{currentLabel}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-surface-strong flex items-center justify-center text-xs font-semibold text-ink shrink-0">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-ink truncate max-w-[140px]">{userName}</span>
              <span className="text-xs text-ink-muted">Owner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`${collapsed ? "ml-16" : "ml-64"} pt-16 min-h-screen bg-background transition-[margin] duration-200 motion-reduce:transition-none`}>
        <div className="p-6 lg:p-8 max-w-[1440px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
