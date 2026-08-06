import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Trophy, Users, LayoutDashboard, Menu, X, Gamepad2, LogIn, LogOut, Crown, User, UserCog, MessageSquare, ShoppingCart, ChevronDown, Search, Globe2, Download, Smartphone } from "lucide-react";
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
        "sticky top-0 z-40 w-full overflow-hidden border-b border-white/10 bg-[#151a20]/95 shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300",
        isMobileMenuOpen ? "max-h-[700px]" : "max-h-[124px] md:max-h-none"
      )}>
        <div className="absolute inset-0 pitch-overlay pointer-events-none" />
        <div className="absolute -top-16 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col md:flex-row">
          {/* Logo */}
          <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5 sm:px-6 md:border-b-0 md:border-r md:px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c4f6d3]/30 bg-[#c4f6d3]/10">
                <Gamepad2 className="h-4 w-4 text-[#c4f6d3]" />
              </div>
              <div>
                <h1 className="soccer-theme-heading font-display text-[16px] font-black leading-none tracking-tight text-white">FOOTBALL</h1>
                <span className="font-gaming text-[9px] font-semibold tracking-[0.2em] text-[#c4f6d3]">MANAGER</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-400 transition-colors hover:text-[#c4f6d3] md:hidden"
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Nav items */}
          <nav className={cn(
            "relative flex-1 flex-col gap-0 overflow-y-auto px-3 py-2 md:flex md:flex-row md:items-center md:overflow-x-auto",
            !isMobileMenuOpen && "hidden"
          )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={cn(
                    "flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200 group whitespace-nowrap",
                  isActive
                    ? "bg-white/[0.05] text-[#c4f6d3] md:border-b-[#c4f6d3]"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                )}>
                  <Icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110 shrink-0", isActive && "text-[#c4f6d3]")} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c4f6d3] shadow-[0_0_8px_rgba(196,246,211,0.8)]" />}
                </div>
              </Link>
            );
          })}

          {/* Pricing link always visible for non-admin */}
          {!isAdmin && (
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200 group whitespace-nowrap",
                location === "/pricing"
                  ? "bg-white/[0.05] text-[#c4f6d3] md:border-b-[#c4f6d3]"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              )}>
                <Crown className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/pricing" && "text-[#c4f6d3]")} />
                <span className="font-medium text-sm">Pricing</span>
                {location === "/pricing" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c4f6d3]" />}
              </div>
            </Link>
          )}

          {/* Contact / Inquiries — visible to everyone */}
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            <div className={cn(
              "flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200 group whitespace-nowrap",
              location === "/contact"
                ? "bg-white/[0.05] text-[#c4f6d3] md:border-b-[#c4f6d3]"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            )}>
              <MessageSquare className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/contact" && "text-[#c4f6d3]")} />
              <span className="font-medium text-sm">Contact</span>
              {location === "/contact" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c4f6d3]" />}
            </div>
          </Link>

          {/* Admin-only: User Management */}
          {isAdmin && (
            <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                  "flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200 group whitespace-nowrap",
                location === "/admin/users"
                    ? "bg-white/[0.05] text-[#c4f6d3] md:border-b-[#c4f6d3]"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              )}>
                  <UserCog className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/admin/users" && "text-[#c4f6d3]")} />
                <span className="font-medium text-sm">User Management</span>
                  {location === "/admin/users" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c4f6d3]" />}
              </div>
            </Link>
          )}

          {/* Admin-only: Inquiries */}
          {isAdmin && (
            <Link href="/admin/inquiries" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={cn(
                  "flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200 group whitespace-nowrap",
                location === "/admin/inquiries"
                    ? "bg-white/[0.05] text-[#c4f6d3] md:border-b-[#c4f6d3]"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              )}>
                  <MessageSquare className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110 shrink-0", location === "/admin/inquiries" && "text-[#c4f6d3]")} />
                <span className="font-medium text-sm">Inquiries</span>
                  {location === "/admin/inquiries" && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c4f6d3]" />}
              </div>
            </Link>
          )}
          </nav>

          {/* Auth section */}
          <div className={cn(
            "relative flex shrink-0 items-center gap-2 border-t border-white/5 p-2 md:border-l md:border-t-0",
            !isMobileMenuOpen && "hidden md:flex"
          )}>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex cursor-pointer items-center gap-1.5 rounded-md bg-[#c4f6d3] px-3 py-2 text-xs font-bold text-[#18211d] transition-colors hover:bg-[#d9fbe2]">
                <Crown className="h-3.5 w-3.5" />
                <span>{isPaid ? "Pro Plan" : "Get Pro"}</span>
              </div>
            </Link>
           <div className="relative">
             <button
               onClick={() => setIsAccountMenuOpen((open) => !open)}
               className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200",
                 isAccountMenuOpen
                    ? "border-[#c4f6d3]/50 bg-[#c4f6d3]/15 text-[#c4f6d3]"
                    : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-[#c4f6d3]/40 hover:text-[#c4f6d3]"
               )}
               aria-expanded={isAccountMenuOpen}
               aria-haspopup="menu"
             >
               <User className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Sign in</span>
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
            <p className="hidden px-2 text-center font-gaming text-[9px] uppercase tracking-widest text-zinc-600 lg:block">
              Football · Friendly Manager
            </p>
          </div>
        </div>

        {/* eFHUB-inspired secondary strip */}
        <div className="relative hidden h-14 overflow-hidden border-t border-white/5 md:block">
          <img
            src={`${import.meta.env.BASE_URL}images/marketplace/pitch1.jpg`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151a20] via-[#151a20]/90 to-[#bff3cf]/45" />
          <div className="absolute -left-8 top-0 h-full w-52 -skew-x-12 bg-[#c4f6d3]/20" />
          <div className="absolute right-[18%] top-0 h-full w-20 skew-x-12 bg-[#c4f6d3]/15" />
          <div className="relative mx-auto flex h-full max-w-[1440px] items-center gap-5 px-6 lg:px-8">
            <div className="flex shrink-0 items-center gap-2 text-white">
              <Smartphone className="h-5 w-5 text-[#c4f6d3]" />
              <span className="font-display text-sm font-black tracking-tight">eFOOTBALL</span>
              <span className="font-gaming text-xs font-bold tracking-[0.2em] text-[#c4f6d3]">MOBILE</span>
            </div>
            <Link href="/marketplace" className="min-w-0 max-w-xl flex-1">
              <div className="flex h-9 items-center gap-2 rounded-full border border-white/5 bg-[#20262d]/90 px-4 text-xs text-zinc-500 transition-colors hover:border-[#c4f6d3]/30 hover:text-zinc-300">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Search players &amp; managers...</span>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-3 text-zinc-400">
              <Globe2 className="h-3.5 w-3.5" />
              <Download className="h-3.5 w-3.5" />
              <Link href="/marketplace" className="hidden text-[10px] font-bold uppercase tracking-wider text-[#c4f6d3] lg:block">
                Browse accounts
              </Link>
            </div>
          </div>
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
