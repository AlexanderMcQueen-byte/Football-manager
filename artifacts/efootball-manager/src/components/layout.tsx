import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Trophy, Users, LayoutDashboard, Menu, X, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tournaments/new", label: "New Tournament", icon: Trophy },
    { href: "/players", label: "Players", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background to-background" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white text-glow">eFOOTBALL</span>
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
        "fixed md:sticky top-0 left-0 h-screen w-64 glass-card border-r border-y-0 border-l-0 border-white/5 flex flex-col transition-transform duration-300 z-40",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/20">
            <Gamepad2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl leading-none text-white tracking-tight">eFOOTBALL</h1>
            <span className="text-xs text-primary font-gaming font-semibold tracking-wider">MANAGER</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                )}>
                  <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
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
