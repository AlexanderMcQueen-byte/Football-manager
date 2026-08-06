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

       <footer className="relative z-10 border-t border-white/[0.04] bg-[#1f232b]/95 backdrop-blur-xl">
         <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-6 py-12 sm:grid-cols-4 sm:px-8 lg:py-14">
           <div>
             <h2 className="font-sans text-sm font-medium text-zinc-200">Navigate</h2>
             <div className="mt-4 space-y-2.5">
               {[
                 ["/", "Home"],
                 ["/marketplace", "Marketplace"],
                 ["/pricing", "Pricing"],
                 ["/contact", "Contact"],
               ].map(([href, label]) => (
                 <Link key={`${href}-${label}`} href={href}>
                   <div className="block cursor-pointer text-xs leading-5 text-zinc-500 transition-colors hover:text-zinc-200">{label}</div>
                 </Link>
               ))}
             </div>
           </div>

           <div>
             <h2 className="font-sans text-sm font-medium text-zinc-200">Tournament</h2>
             <div className="mt-4 space-y-2.5">
               {[
                 ["/players", "Players"],
                 [isPaid ? "/tournaments/new" : "/pricing", "New Tournament"],
                 ["/", "Active Tournaments"],
                 ["/", "Finished Tournaments"],
               ].map(([href, label]) => (
                 <Link key={`${href}-${label}`} href={href}>
                   <div className="block cursor-pointer text-xs leading-5 text-zinc-500 transition-colors hover:text-zinc-200">{label}</div>
                 </Link>
               ))}
             </div>
           </div>

           <div>
             <h2 className="font-sans text-sm font-medium text-zinc-200">Marketplace</h2>
             <div className="mt-4 space-y-2.5">
               {[
                 ["/marketplace", "Listings"],
                 ["/marketplace/escrow", "Escrow"],
                 ["/marketplace/scanner", "Scanner"],
                 ["/marketplace/meta", "Meta"],
                 ["/marketplace/safety", "Safety Guide"],
               ].map(([href, label]) => (
                 <Link key={`${href}-${label}`} href={href}>
                   <div className="block cursor-pointer text-xs leading-5 text-zinc-500 transition-colors hover:text-zinc-200">{label}</div>
                 </Link>
               ))}
             </div>
           </div>

           <div>
             <h2 className="font-sans text-sm font-medium text-zinc-200">Account</h2>
             <div className="mt-4 space-y-2.5">
               {isLoggedIn ? (
                 <button
                   onClick={() => void logout()}
                   className="block text-left text-xs leading-5 text-zinc-500 transition-colors hover:text-zinc-200"
                 >
                   Sign Out
                 </button>
               ) : (
                 <>
                   <Link href="/login">
                     <div className="block cursor-pointer text-xs leading-5 text-zinc-500 transition-colors hover:text-zinc-200">Sign In</div>
                   </Link>
                   <Link href="/signup">
                     <div className="block cursor-pointer text-xs leading-5 text-zinc-500 transition-colors hover:text-zinc-200">Create Account</div>
                   </Link>
                 </>
               )}
               <Link href="/pricing">
                 <div className="block cursor-pointer text-xs leading-5 text-zinc-500 transition-colors hover:text-zinc-200">
                   {isPaid ? "Pro Plan" : "Get Pro"}
                 </div>
               </Link>
             </div>
           </div>
         </div>

         <div className="pb-14 pt-1 text-center text-xs text-zinc-500">
           Copyright © {new Date().getFullYear()} All rights reserved | This template is made with{" "}
           <span className="text-zinc-400">♥</span> by{" "}
           <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
             <span className="cursor-pointer text-primary transition-colors hover:text-pink-300">Football Manager</span>
           </Link>
         </div>
       </footer>

    </div>
  );
}
