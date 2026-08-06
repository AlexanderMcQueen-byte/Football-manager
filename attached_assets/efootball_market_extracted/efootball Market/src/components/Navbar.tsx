import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShoppingCart, 
  ShieldAlert, 
  Newspaper, 
  Search, 
  Shield, 
  Wallet, 
  Lock, 
  RefreshCw,
  Bell,
  AlertTriangle,
  Globe
} from 'lucide-react';

interface NavbarProps {
  activeEscrowStep: number;
  vaultTotal: number;
  userBalance: number;
  onOpenReportModal: () => void;
  onOpenNewListingModal: () => void;
  onOpenSellerPortal: () => void;
  currentSellerEmail?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeEscrowStep,
  vaultTotal,
  userBalance,
  onOpenReportModal,
  onOpenNewListingModal,
  onOpenSellerPortal,
  currentSellerEmail,
}) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 font-sans shadow-sm">
      {/* Top Warning Banner - ToS & Security */}
      <div className="bg-indigo-950 text-white px-4 py-1.5 text-xs flex items-center justify-between border-b border-orange-500/30">
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white font-extrabold text-[10px] uppercase tracking-wide">
              NOTICE
            </span>
            <span className="text-slate-100">
              <strong className="font-bold text-orange-400">Konami ToS Advisory:</strong> Always use our <strong>Escrow Vault</strong> &amp; <strong>VPN Region Matcher</strong> during account transfers.
            </span>
          </div>
          <Link 
            to="/safety"
            className="hidden sm:flex items-center gap-1 text-orange-300 hover:text-white underline text-xs shrink-0 font-semibold cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" /> VPN &amp; Handover Guide
          </Link>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name - TiHAN / Masai Dual Brand Style */}
          <div className="flex items-center gap-3">
            <Link 
              to="/"
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-950 shadow-md group-hover:bg-indigo-900 transition-colors border-2 border-orange-500">
                <ShieldCheck className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500 animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-indigo-950">
                    eFootball<span className="text-orange-600">Escrow</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded bg-orange-100 text-orange-700 border border-orange-300 uppercase tracking-wider">
                    v5.2.0 Meta
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">Secure Konami ID Escrow Portal</p>
              </div>
            </Link>
          </div>

          {/* Central Live Vault Status Indicator */}
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Lock className="w-3.5 h-3.5 text-indigo-900" />
              <span className="text-xs font-bold text-slate-700">Escrow Vault:</span>
            </div>
            <span className="text-xs font-black text-indigo-950 font-mono tracking-tight">
              ${vaultTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} LOCKED
            </span>
            <div className="h-3 w-px bg-slate-300" />
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" /> 0% Fraud Rate
            </span>
          </div>

          {/* User Wallet & Actions */}
          <div className="flex items-center gap-3">
            {/* Wallet Balance Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono text-slate-800">
              <Wallet className="w-3.5 h-3.5 text-indigo-900" />
              <span className="text-slate-600 hidden sm:inline font-semibold">Balance:</span>
              <span className="font-black text-indigo-950">${userBalance.toFixed(2)}</span>
            </div>

            {/* Seller Auth & Portal Button - Orange Accent */}
            <button
              onClick={onOpenSellerPortal}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 shadow-md border-b-2 cursor-pointer ${
                currentSellerEmail 
                  ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-800' 
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentSellerEmail ? 'Seller Portal ✓' : 'Seller Login / Register'}</span>
            </button>

            {/* List Account Button - Deep Navy with Red Accent */}
            <button
              onClick={onOpenNewListingModal}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md border-b-2 border-orange-500 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Sell Account</span>
            </button>

            {/* Report Scammer Button */}
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden md:inline">Report Scammer</span>
            </button>
          </div>

        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-3 overflow-x-auto no-scrollbar pt-2 border-t border-slate-200">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              path === '/'
                ? 'bg-indigo-950 text-white shadow'
                : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-orange-400" />
            Marketplace
          </Link>

          <Link
            to="/escrow"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 relative ${
              path === '/escrow'
                ? 'bg-indigo-950 text-white shadow'
                : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Escrow Exchange Center
            {activeEscrowStep > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-orange-500 text-white">
                Step {activeEscrowStep}/4 Active
              </span>
            )}
          </Link>

          <Link
            to="/scanner"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              path === '/scanner'
                ? 'bg-indigo-950 text-white shadow'
                : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-400" />
            Account Snapshot Scanner
          </Link>

          <Link
            to="/meta"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              path === '/meta'
                ? 'bg-indigo-950 text-white shadow'
                : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-4 h-4 text-amber-400" />
            Patch Notes &amp; Meta Tier List
          </Link>

          <Link
            to="/scammers"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              path === '/scammers'
                ? 'bg-orange-600 text-white shadow'
                : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Anti-Scam Blacklist
          </Link>

          <Link
            to="/safety"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              path === '/safety'
                ? 'bg-indigo-950 text-white shadow'
                : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4 text-orange-400" />
            Safety &amp; VPN Advisor
          </Link>
        </nav>
      </div>
    </header>
  );
};
