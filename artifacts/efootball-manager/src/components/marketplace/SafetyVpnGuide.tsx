import React, { useState } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  ExternalLink, 
  Key, 
  Server,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const SafetyVpnGuide: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<'Europe' | 'Japan' | 'SouthAmerica' | 'NorthAmerica'>('Europe');

  const vpnLocations = {
    Europe: {
      location: 'Frankfurt, Germany or London, UK',
      riskLevel: 'LOW (Standard European Handover Pattern)',
      steps: [
        'Connect NordVPN / ExpressVPN to Frankfurt or London server.',
        'Clear eFootball app cache before opening login screen.',
        'Log in with Konami ID credentials provided in Step 2 Escrow.',
        'Keep VPN active for at least 72 hours of initial gameplay.'
      ]
    },
    Japan: {
      location: 'Tokyo, Japan',
      riskLevel: 'HIGH (Strict Konami Japan AI Oversight)',
      steps: [
        'Connect VPN strictly to Tokyo, Japan server.',
        'Ensure device timezone is set to JST (UTC+9).',
        'Authenticate Konami ID and download team data.',
        'Avoid changing Konami ID email for first 48 hours to prevent ban trigger.'
      ]
    },
    SouthAmerica: {
      location: 'São Paulo, Brazil or Buenos Aires, Argentina',
      riskLevel: 'LOW',
      steps: [
        'Connect VPN to São Paulo server.',
        'Open Konami ID portal and link secondary email.',
        'Log into eFootball and verify Division history.'
      ]
    },
    NorthAmerica: {
      location: 'New York, USA or Toronto, Canada',
      riskLevel: 'LOW',
      steps: [
        'Connect VPN to US East server.',
        'Launch eFootball app and complete transfer verification.'
      ]
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Massive Legal Disclaimer Banner */}
      <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200">
              Konami Terms of Service (ToS) Legal &amp; Risk Disclaimer
            </h2>
            <p className="text-xs text-amber-300 font-mono mt-0.5">
              Read carefully before initiating any Konami ID exchange
            </p>
          </div>
        </div>

        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed border-t border-amber-500/20 pt-3">
          <strong>Notice to all users:</strong> Trading, buying, or selling Konami eFootball™ user accounts is explicitly prohibited under Konami's Terms of Service. All account exchanges conducted through this platform are peer-to-peer (P2P) transfers executed strictly <strong>at your own risk</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-200">
            <strong>Konami Detection AI:</strong> Konami uses machine learning models to detect sudden IP jumps and geographical device handovers.
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-200">
            <strong>Platform Guarantee:</strong> Our Escrow Vault protects your money from scam sellers, but cannot override Konami's official terms.
          </div>
        </div>
      </div>

      {/* Interactive VPN Region Matcher Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-1">
              <Globe className="w-4 h-4" /> Anti-Ban AI Bypass Protocol
            </div>
            <h3 className="text-xl font-extrabold text-white">
              VPN Handover Region Matcher
            </h3>
            <p className="text-xs text-slate-400">
              Select the seller's original account region to view recommended VPN proxy locations.
            </p>
          </div>
        </div>

        {/* Region Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['Europe', 'Japan', 'SouthAmerica', 'NorthAmerica'] as const).map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                selectedRegion === reg
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {reg === 'SouthAmerica' ? 'South America' : reg === 'NorthAmerica' ? 'North America' : reg} Region
            </button>
          ))}
        </div>

        {/* Selected Region Guide Box */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Target VPN Server Location
              </span>
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {vpnLocations[selectedRegion].location}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono">
              Risk Level: {vpnLocations[selectedRegion].riskLevel}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Handover Protocol Steps
            </h4>

            <div className="space-y-2">
              {vpnLocations[selectedRegion].steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
