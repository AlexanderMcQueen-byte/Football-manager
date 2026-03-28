import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Trophy, Users, LayoutDashboard, Menu, X, Gamepad2, LogIn, LogOut, ShieldCheck, Eye, Crown, User, Zap, UserCog, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, isLoggedIn, isLoading, user, plan, isPaid, logout } = useAuth();

  const publicNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
  ];

  const creatorNavItems = [
    { href: "/tournaments/new", label: "New Tournament", icon: Trophy },
    { href: "/players", label: "Players", icon: Users },
  ];

  const navItems = (isAdmin || isPaid) ? [...publicNavItems, ...creatorNavItems] : publicNavItems;

  function planBadge() {
    if (isAdmin) return { icon: ShieldCheck, label: "Admin", color: "text-primary bg-primary/10 border-primary/20" };
    if (plan === "lifetime") return { icon: Trophy, label: "Lifetime", color: "text-amber-400 bg-amber-900/10 border-amber-500/20" };
    if (plan === "yearly") return { icon: Crown, label: "Pro Yearly", color: "text-primary bg-primary/10 border-primary/20" };
    if (plan === "monthly") return { icon: Zap, label: "Pro Monthly", color: "text-blue-400 bg-blue-900/10 border-blue-500/20" };
    if (user) return { icon: User, label: "Free Plan", color: "text-zinc-500 bg-white/[0.04] border-white/8" };
    return { icon: Eye, label: "Viewer", color: "text-zinc-500 bg-white/[0.04] border-white/8" };
  }

  const badge = planBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/stadium-crowd.png`}
          className="absolute inset-0 w-full h-full object-cover opacity-10"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/95" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">FOOTBALL</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-64 sidebar-bg flex flex-col transition-transform duration-300 z-40 overflow-hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="absolute inset-0 pitch-overlay pointer-events-none" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Logo */}
        <div className="relative p-6 hidden md:flex items-center gap-3 border-b border-white/5 pb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/30">
            <Gamepad2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl leading-none text-white tracking-tight">FOOTBALL</h1>
            <span className="text-xs text-primary font-gaming font-semibold tracking-widest">MANAGER</span>
          </div>
        </div>

        {/* Plan/role badge */}
        {!isLoading && (
          <div className="relative px-4 pt-4 pb-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border",
              badge.color
            )}>
              <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user ? user.displayName : badge.label}</span>
              <span className="ml-auto font-gaming shrink-0 opacity-70">{badge.label}</span>
            </div>
            {/* Upgrade nudge for free logged-in users */}
            {user && plan === "free" && (
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/15 transition-all cursor-pointer">
                  <Crown className="w-3 h-3" />
                  Upgrade to Create Tournaments
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav className="relative flex-1 px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                  isActive
                    ? "nav-active"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
                )}>
                  <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", isActive && "text-primary")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(145_80%_42%)]" />}
                </div>
              </Link>
            );
          })}

          {/* Pricing link always visible for non-admin */}
          {!isAdmin && (
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                location === "/pricing"
                  ? "nav-active"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
              )}>
                <Crown className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/pricing" && "text-primary")} />
                <span className="font-medium text-sm">Pricing</span>
                {location === "/pricing" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(145_80%_42%)]" />}
              </div>
            </Link>
          )}

          {/* Contact / Inquiries — visible to everyone */}
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
              location === "/contact"
                ? "nav-active"
                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
            )}>
              <MessageSquare className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/contact" && "text-primary")} />
              <span className="font-medium text-sm">Contact</span>
              {location === "/contact" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(145_80%_42%)]" />}
            </div>
          </Link>

          {/* Admin-only: User Management */}
          {isAdmin && (
            <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                location === "/admin/users"
                  ? "nav-active"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
              )}>
                <UserCog className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/admin/users" && "text-primary")} />
                <span className="font-medium text-sm">User Management</span>
                {location === "/admin/users" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(145_80%_42%)]" />}
              </div>
            </Link>
          )}

          {/* Admin-only: Inquiries */}
          {isAdmin && (
            <Link href="/admin/inquiries" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                location === "/admin/inquiries"
                  ? "nav-active"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent"
              )}>
                <MessageSquare className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/admin/inquiries" && "text-primary")} />
                <span className="font-medium text-sm">Inquiries</span>
                {location === "/admin/inquiries" && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(145_80%_42%)]" />}
              </div>
            </Link>
          )}
        </nav>

        {/* Auth section */}
        <div className="relative p-3 border-t border-white/5 space-y-1">
          {isLoggedIn ? (
            <button
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent transition-all duration-200 group text-sm font-medium"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
              Sign Out
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-white border border-transparent transition-all duration-200 group cursor-pointer text-sm font-medium">
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                  Sign In
                </div>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 transition-all duration-200 cursor-pointer text-sm font-medium">
                  <User className="w-4 h-4 shrink-0" />
                  Create Account
                </div>
              </Link>
            </>
          )}
          <p className="text-[10px] font-gaming text-zinc-700 tracking-widest uppercase text-center pt-1">
            Football · Friendly Manager
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full md:max-w-[calc(100vw-16rem)]">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
