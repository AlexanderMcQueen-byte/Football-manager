import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Trophy, Users, LayoutDashboard, Menu, X, Gamepad2, LogIn, LogOut, Crown, User, UserCog, MessageSquare, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, isLoggedIn, isPaid, logout } = useAuth();

  const publicNavItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  ];

  const creatorNavItems = [
    { href: "/tournaments/new", label: "New Tournament", icon: Trophy },
    { href: "/players", label: "Players", icon: Users },
  ];

  const navItems = (isAdmin || isPaid) ? [...publicNavItems, ...creatorNavItems] : publicNavItems;

  const isHome = location === "/";

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/soccer-theme/bg_1.jpg`}
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/95" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/20 blur-[120px]" />
      </div>

      {/* Top navigation */}
      <aside className={cn(
        "w-full flex flex-col md:flex-row transition-all duration-300 z-40 overflow-hidden",
        isHome
          ? "absolute top-0 left-0 bg-transparent border-transparent"
          : "sticky top-0 sidebar-bg",
        isMobileMenuOpen ? "max-h-[700px]" : "max-h-20 md:max-h-24"
      )}>
        <div className="absolute inset-0 pitch-overlay pointer-events-none" />
        <div className="absolute -top-16 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Logo */}
        <div className="relative p-4 flex items-center justify-between gap-3 border-b md:border-b-0 md:border-r border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e3669a] via-[#c14d7f] to-[#713450] flex items-center justify-center shadow-lg shadow-primary/30">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-black text-[19px] leading-none text-white tracking-tight soccer-theme-heading">FOOTBALL</h1>
              <span className="text-xs text-primary font-gaming font-semibold tracking-widest">MANAGER</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Nav items */}
        <nav className={cn(
          "relative flex-1 px-1.5 py-3 flex flex-col md:flex-row md:items-center gap-1 overflow-y-auto md:overflow-x-auto",
          !isMobileMenuOpen && "hidden md:flex"
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={cn(
                   "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group whitespace-nowrap",
                  isActive
                    ? "nav-active"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
                )}>
                  <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", isActive && "text-primary")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
                </div>
              </Link>
            );
          })}

          {/* Pricing link always visible for non-admin */}
          {!isAdmin && (
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group whitespace-nowrap",
                location === "/pricing"
                  ? "nav-active"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
              )}>
                <Crown className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/pricing" && "text-primary")} />
                <span className="font-medium text-sm">Pricing</span>
                {location === "/pricing" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
              </div>
            </Link>
          )}

          {/* Contact / Inquiries — visible to everyone */}
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            <div className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group whitespace-nowrap",
              location === "/contact"
                ? "nav-active"
                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
            )}>
              <MessageSquare className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/contact" && "text-primary")} />
              <span className="font-medium text-sm">Contact</span>
              {location === "/contact" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
            </div>
          </Link>

          {/* Admin-only: User Management */}
          {isAdmin && (
            <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group whitespace-nowrap",
                location === "/admin/users"
                  ? "nav-active"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
              )}>
                <UserCog className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/admin/users" && "text-primary")} />
                <span className="font-medium text-sm">User Management</span>
                {location === "/admin/users" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
              </div>
            </Link>
          )}

          {/* Admin-only: Inquiries */}
          {isAdmin && (
            <Link href="/admin/inquiries" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group whitespace-nowrap",
                location === "/admin/inquiries"
                  ? "nav-active"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
              )}>
                <MessageSquare className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/admin/inquiries" && "text-primary")} />
                <span className="font-medium text-sm">Inquiries</span>
                {location === "/admin/inquiries" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
              </div>
            </Link>
          )}
        </nav>

        {/* Auth section */}
        <div className={cn(
          "relative p-2 border-t md:border-t-0 md:border-l border-white/5 flex items-center gap-1 shrink-0",
          !isMobileMenuOpen && "hidden md:flex"
        )}>
          {isLoggedIn ? (
            <button
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent transition-all duration-200 group text-sm font-medium whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent transition-all duration-200 group cursor-pointer text-sm font-medium whitespace-nowrap">
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                  Sign In
                </div>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-all duration-200 cursor-pointer text-sm font-medium whitespace-nowrap">
                  <User className="w-4 h-4 shrink-0" />
                  Create Account
                </div>
              </Link>
            </>
          )}
          <p className="hidden lg:block text-[10px] font-gaming text-zinc-700 tracking-widest uppercase text-center px-2">
            Football · Friendly Manager
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 relative z-10 w-full", isHome && "pt-0")}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>

    </div>
  );
}
