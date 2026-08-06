import React, { useState, useMemo } from 'react';
import { ScammerRecord } from '@/types/marketplace';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  FileText, 
  UserX, 
  ShieldCheck, 
  X,
  ExternalLink,
  Shield,
  Plus
} from 'lucide-react';

interface AntiScamDashboardProps {
  blacklist: ScammerRecord[];
  onAddReport: (newReport: Omit<ScammerRecord, 'id' | 'dateReported' | 'verifiedByModerator' | 'status'>) => void;
  showReportModal: boolean;
  setShowReportModal: (show: boolean) => void;
}

export const AntiScamDashboard: React.FC<AntiScamDashboardProps> = ({
  blacklist,
  onAddReport,
  showReportModal,
  setShowReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // New report form state
  const [reportKonamiId, setReportKonamiId] = useState('');
  const [reportDiscord, setReportDiscord] = useState('');
  const [reportWhatsapp, setReportWhatsapp] = useState('');
  const [reportGameName, setReportGameName] = useState('');
  const [reportType, setReportType] = useState<ScammerRecord['scamType']>('Account Recovery Theft');
  const [reportAmount, setReportAmount] = useState<number>(100);
  const [reportEvidence, setReportEvidence] = useState('');

  const filteredBlacklist = useMemo(() => {
    return blacklist.filter(item => {
      const query = searchTerm.toLowerCase();
      return (
        item.konamiId.toLowerCase().includes(query) ||
        item.discordHandle.toLowerCase().includes(query) ||
        item.gameName.toLowerCase().includes(query) ||
        (item.whatsappNumber && item.whatsappNumber.includes(query)) ||
        item.scamType.toLowerCase().includes(query)
      );
    });
  }, [blacklist, searchTerm]);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReport({
      konamiId: reportKonamiId,
      discordHandle: reportDiscord,
      whatsappNumber: reportWhatsapp,
      gameName: reportGameName,
      scamType: reportType,
      stolenAmount: reportAmount,
      evidenceSummary: reportEvidence,
    });
    // Reset form
    setReportKonamiId('');
    setReportDiscord('');
    setReportWhatsapp('');
    setReportGameName('');
    setReportEvidence('');
    setShowReportModal(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="bg-indigo-950 border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-bold">
              <ShieldAlert className="w-4 h-4" /> Global Community Anti-Fraud Database
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Known Scammer <span className="text-orange-400">Blacklist &amp; IP Registry</span>
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
              Check Konami IDs, Discord tags, or phone numbers before trading. Our moderators manually verify all report evidence and permanently blacklist confirmed scammers across all platform services.
            </p>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-colors shadow-md flex items-center gap-2 shrink-0 cursor-pointer border-b-2 border-orange-800"
          >
            <Plus className="w-4 h-4" /> Report Scammer / Stolen Account
          </button>
        </div>
      </div>

      {/* Security Threat Alerts Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Threat #1: Password Recovery Scam
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Scammer sells account, waits 24h, then contacts Konami support with original creation email to pull back the Konami ID. <em className="text-indigo-950 font-bold">Solution: Our 72h Escrow Cooldown.</em>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
            <UserX className="w-4 h-4 text-rose-600" /> Threat #2: Discord Middleman Impersonators
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Scammers create fake Discord accounts copying official admin names. <em className="text-indigo-950 font-bold">Solution: Only trade directly inside our web app domain.</em>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-rose-600" /> Threat #3: Fake Bank Wire Receipts
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Buyers send fake wire transfer screenshots. <em className="text-indigo-950 font-bold">Solution: Never release credentials until our automated vault confirms actual funds locked.</em>
          </p>
        </div>

      </div>

      {/* Scammer Blacklist Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm text-slate-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-600" />
            Verified Blacklisted Entities ({filteredBlacklist.length} Records)
          </h3>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Konami ID, Discord, Phone..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-900 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none font-mono font-semibold"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-mono text-[11px] border-b border-slate-200 uppercase tracking-wider font-extrabold">
                <th className="p-3.5">Konami ID / Handle</th>
                <th className="p-3.5">Discord / WhatsApp</th>
                <th className="p-3.5">Scam Vector</th>
                <th className="p-3.5">Loss Amount</th>
                <th className="p-3.5">Evidence Summary</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredBlacklist.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                    No blacklisted scammers match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredBlacklist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono text-rose-700 font-black">
                      <div>{item.konamiId}</div>
                      <span className="text-[10px] text-slate-500 font-medium">{item.gameName}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-800 font-semibold">
                      <div>{item.discordHandle}</div>
                      {item.whatsappNumber && (
                        <span className="text-[10px] text-slate-500 block">{item.whatsappNumber}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {item.scamType}
                    </td>
                    <td className="p-3.5 font-mono font-black text-rose-700">
                      ${item.stolenAmount} USD
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs leading-relaxed text-[11px] font-medium">
                      {item.evidenceSummary}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-1 rounded bg-rose-100 border border-rose-300 text-rose-800 text-[10px] font-extrabold font-mono">
                        BLACKLISTED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Scammer Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-black text-base">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Report Scammer / Stolen Account
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-indigo-950 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Scammer Konami ID / Email
                </label>
                <input
                  type="text"
                  value={reportKonamiId}
                  onChange={(e) => setReportKonamiId(e.target.value)}
                  placeholder="e.g. fake_seller_2026@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Discord Tag
                  </label>
                  <input
                    type="text"
                    value={reportDiscord}
                    onChange={(e) => setReportDiscord(e.target.value)}
                    placeholder="e.g. ScammerTag#1234"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={reportWhatsapp}
                    onChange={(e) => setReportWhatsapp(e.target.value)}
                    placeholder="e.g. +1 555 123 456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Scam Category
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-semibold"
                  >
                    <option value="Account Recovery Theft">Account Recovery Theft</option>
                    <option value="Fake Middleman">Fake Middleman Impersonation</option>
                    <option value="Chargeback Scam">Chargeback Fraud</option>
                    <option value="Fake Payment Proof">Fake Payment Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Loss Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    value={reportAmount}
                    onChange={(e) => setReportAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Evidence Details &amp; Chat Logs
                </label>
                <textarea
                  rows={3}
                  value={reportEvidence}
                  onChange={(e) => setReportEvidence(e.target.value)}
                  placeholder="Provide details, imgur screenshot links, or conversation summary..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-900 placeholder-slate-400 font-medium"
                  required
                />
              </div>

              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-semibold">
                🛡️ Reports are reviewed by moderators within 2 hours. False reports result in permanent ban.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer shadow-md"
                >
                  Submit Blacklist Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
