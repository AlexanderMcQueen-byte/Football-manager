import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Trophy, Users, LayoutDashboard, Menu, X, Gamepad2, LogIn, LogOut, Crown, User, UserCog, MessageSquare, ShoppingCart, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
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
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
          alt=""
        />
        <img
          src={`${import.meta.env.BASE_URL}images/soccer-theme/bg_2.jpg`}
          className="absolute inset-0 w-full h-full object-cover object-[65%_center] opacity-[0.09] mix-blend-screen"
          alt=""
        />
        <img
          src={`${import.meta.env.BASE_URL}images/soccer-theme/bg_3.jpg`}
          className="absolute inset-0 w-full h-full object-cover object-[35%_center] opacity-[0.08] mix-blend-screen"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/84" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(218_17%_14%_/_0.28)_72%,hsl(218_17%_14%_/_0.58)_100%)]" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
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
           <div className="relative">
             <button
               onClick={() => setIsAccountMenuOpen((open) => !open)}
               className={cn(
                 "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200",
                 isAccountMenuOpen
                   ? "border-primary/40 bg-primary/15 text-primary"
                   : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
               )}
               aria-expanded={isAccountMenuOpen}
               aria-haspopup="menu"
             >
               <User className="h-4 w-4 shrink-0" />
               <span className="hidden sm:inline">Account</span>
               <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isAccountMenuOpen && "rotate-180")} />
             </button>

             {isAccountMenuOpen && (
               <div className="absolute right-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-white/10 bg-[#171920]/95 p-1.5 shadow-2xl backdrop-blur-xl" role="menu">
                 {isLoggedIn ? (
                   <button
                     onClick={() => {
                       logout();
                       setIsAccountMenuOpen(false);
                       setIsMobileMenuOpen(false);
                     }}
                     className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                     role="menuitem"
                   >
                     <LogOut className="h-4 w-4" />
                     Sign Out
                   </button>
                 ) : (
                   <>
                     <Link href="/login" onClick={() => { setIsAccountMenuOpen(false); setIsMobileMenuOpen(false); }}>
                       <div className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white" role="menuitem">
                         <LogIn className="h-4 w-4" />
                         Sign In
                       </div>
                     </Link>
                     <Link href="/signup" onClick={() => { setIsAccountMenuOpen(false); setIsMobileMenuOpen(false); }}>
                       <div className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-primary transition-colors hover:bg-primary/10" role="menuitem">
                         <User className="h-4 w-4" />
                         Create Account
                       </div>
                     </Link>
                   </>
                 )}
               </div>
             )}
           </div>
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

       <footer className="relative z-10 border-t border-white/10 bg-[#11141b]/85 backdrop-blur-xl">
         <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
           <div>
             <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
               <div className="flex cursor-pointer items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e3669a] via-[#c14d7f] to-[#713450] shadow-lg shadow-primary/20">
                   <Gamepad2 className="h-5 w-5 text-white" />
                 </div>
                 <div>
                   <div className="soccer-theme-heading font-display text-lg font-black leading-none text-white">Football</div>
                   <div className="font-gaming text-[10px] font-semibold tracking-[0.28em] text-primary">Manager</div>
                 </div>
               </div>
             </Link>
             <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
               Organize tournaments, manage your players, and build your eFootball community in one place.
             </p>
             <div className="mt-5 flex flex-wrap gap-2">
               <Link href={isPaid ? "/tournaments/new" : "/pricing"}>
                 <div className="cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_18px_hsl(var(--primary)/0.3)]">
                   {isPaid ? "Create Tournament" : "Start Creating"}
                 </div>
               </Link>
               <Link href="/marketplace">
                 <div className="cursor-pointer rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/10">
                   Browse Marketplace
                 </div>
               </Link>
             </div>
           </div>

           <div>
             <h2 className="font-gaming text-xs font-bold uppercase tracking-[0.22em] text-primary">Navigate</h2>
             <div className="mt-4 space-y-2.5">
               {[
                 ["/", "Home"],
                 ["/marketplace", "Marketplace"],
                 ["/pricing", "Pricing"],
                 ["/contact", "Contact"],
               ].map(([href, label]) => (
                 <Link key={href} href={href}>
                   <div className="block cursor-pointer text-sm text-zinc-400 transition-colors hover:text-white">{label}</div>
                 </Link>
               ))}
             </div>
           </div>

           <div>
             <h2 className="font-gaming text-xs font-bold uppercase tracking-[0.22em] text-primary">Manager Tools</h2>
             <div className="mt-4 space-y-2.5">
               <Link href="/players">
                 <div className="block cursor-pointer text-sm text-zinc-400 transition-colors hover:text-white">Players</div>
               </Link>
               <Link href={isPaid ? "/tournaments/new" : "/pricing"}>
                 <div className="block cursor-pointer text-sm text-zinc-400 transition-colors hover:text-white">New Tournament</div>
               </Link>
               <Link href="/marketplace/scanner">
                 <div className="block cursor-pointer text-sm text-zinc-400 transition-colors hover:text-white">Account Scanner</div>
               </Link>
               <Link href="/marketplace/safety">
                 <div className="block cursor-pointer text-sm text-zinc-400 transition-colors hover:text-white">Safety Guide</div>
               </Link>
             </div>
           </div>

           <div>
             <h2 className="font-gaming text-xs font-bold uppercase tracking-[0.22em] text-primary">Account</h2>
             <p className="mt-4 text-sm leading-relaxed text-zinc-500">
               Join the community or sign in to manage your tournaments and account.
             </p>
             <div className="mt-4 flex flex-wrap gap-2">
               {isLoggedIn ? (
                 <button
                   onClick={() => void logout()}
                   className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-primary/30 hover:text-white"
                 >
                   Sign Out
                 </button>
               ) : (
                 <>
                   <Link href="/login">
                     <div className="cursor-pointer rounded-lg border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-primary/30 hover:text-white">
                       Sign In
                     </div>
                   </Link>
                   <Link href="/signup">
                     <div className="cursor-pointer rounded-lg bg-primary/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/25">
                       Create Account
                     </div>
                   </Link>
                 </>
               )}
             </div>
           </div>
         </div>

         <div className="border-t border-white/8">
           <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
             <span>© {new Date().getFullYear()} Football Manager</span>
             <span>Built for every match, every manager, every tournament</span>
           </div>
         </div>
       </footer>

    </div>
  );
}
