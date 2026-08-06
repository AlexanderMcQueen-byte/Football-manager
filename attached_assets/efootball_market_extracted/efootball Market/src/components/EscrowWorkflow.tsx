import React, { useState, useEffect } from 'react';
import { EscrowTrade, EscrowStep } from '../types';
import { calculateAccountRating } from '../utils/ratingCalculator';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  Unlock, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  DollarSign,
  User,
  Sparkles,
  Server,
  Zap,
  Globe,
  AlertCircle,
  Star
} from 'lucide-react';
import { CheckoutWrapper } from './CheckoutWrapper';

interface EscrowWorkflowProps {
  escrowTrade: EscrowTrade;
  onUpdateEscrowStep: (newStep: EscrowStep) => void;
  onToggleRevealCredentials: () => void;
  onTriggerDispute: (reason: string, details: string) => void;
  onResolveDispute: () => void;
  onOpenAccountScanner: () => void;
}

export const EscrowWorkflow: React.FC<EscrowWorkflowProps> = ({
  escrowTrade,
  onUpdateEscrowStep,
  onToggleRevealCredentials,
  onTriggerDispute,
  onResolveDispute,
  onOpenAccountScanner,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Account Recovery Attempt by Seller');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(escrowTrade.protectionPeriodRemainingSeconds);

  // Perspective View Switcher: BUYER vs SELLER
  const [activeRole, setActiveRole] = useState<'BUYER' | 'SELLER'>('BUYER');

  // Seller Credential Vault state
  const [sellerKonamiEmail, setSellerKonamiEmail] = useState(escrowTrade.sellerSubmittedEmail || escrowTrade.konamiId || 'chebukati_konami@gmail.com');
  const [sellerKonamiPassword, setSellerKonamiPassword] = useState(escrowTrade.sellerSubmittedPassword || escrowTrade.konamiPasswordFull || 'Konami_eFB2026#Secure!');
  const [credentialsSavedMsg, setCredentialsSavedMsg] = useState(escrowTrade.sellerCredentialsSubmitted ? 'Credentials currently saved in Escrow Vault' : '');

  // OTP Workflow state
  const [otpStatus, setOtpStatus] = useState<'NONE' | 'REQUESTED' | 'PROVIDED'>(escrowTrade.otpStatus || 'NONE');
  const [sellerOtpInput, setSellerOtpInput] = useState('819304');
  const [currentOtpCode, setCurrentOtpCode] = useState(escrowTrade.submittedOtpCode || '819304');

  // Countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSellerCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsSavedMsg('✅ Credentials successfully encrypted and saved to Escrow Vault!');
  };

  const handleRequestOtp = () => {
    setOtpStatus('REQUESTED');
  };

  const handleSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerOtpInput.trim()) return;
    setCurrentOtpCode(sellerOtpInput);
    setOtpStatus('PROVIDED');
  };

  const formatHours = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerDispute(disputeReason, disputeDetails);
    setShowDisputeModal(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Escrow Summary Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden text-slate-900">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-950 text-white">
                Live Escrow Session #{escrowTrade.tradeId}
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">
                Locked: {escrowTrade.vaultLockedAt}
              </span>
              {(() => {
                const rating = calculateAccountRating(escrowTrade.listing);
                return (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-black border font-mono ${rating.badgeColor}`}>
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>AI Rating: {rating.scoreFormatted}</span>
                  </span>
                );
              })()}
            </div>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight">
              {escrowTrade.listing.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Buyer: <strong className="text-indigo-950 font-bold">{escrowTrade.buyerName}</strong> • Seller: <strong className="text-indigo-950 font-bold">{escrowTrade.sellerName}</strong> • Amount: <strong className="text-orange-600 font-black font-mono">${escrowTrade.amount} USD</strong>
            </p>
          </div>

          {/* Vault Status Banner */}
          <div className="flex items-center gap-3 bg-indigo-950 text-white px-4 py-3 rounded-xl shrink-0 shadow-md border-b-2 border-orange-500">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] text-orange-300 font-extrabold uppercase tracking-wider block">Platform Vault</span>
              <span className="text-sm font-black text-white font-mono">
                ${escrowTrade.amount + escrowTrade.platformFee} USD SECURED
              </span>
            </div>
          </div>
        </div>

        {/* 4-Step Interactive Progress Bar */}
        <div className="pt-6">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Escrow Exchange Pipeline</span>
            <span className="text-orange-600 font-mono font-extrabold">Step {escrowTrade.currentStep} of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
            
            {/* Step 1 */}
            <div 
              onClick={() => onUpdateEscrowStep(1)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                escrowTrade.currentStep === 1
                  ? 'bg-indigo-950 border-orange-500 text-white shadow-md'
                  : escrowTrade.currentStep > 1
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center ${escrowTrade.currentStep === 1 ? 'bg-orange-500 text-indigo-950' : 'bg-slate-200 text-slate-800'}`}>
                  1
                </span>
                {escrowTrade.step1FundsSecured && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Step 1: Funds Secured</h4>
              <p className={`text-[11px] mt-1 ${escrowTrade.currentStep === 1 ? 'text-slate-200' : 'text-slate-500'}`}>Buyer deposits funds into platform vault</p>
            </div>

            {/* Step 2 */}
            <div 
              onClick={() => onUpdateEscrowStep(2)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                escrowTrade.currentStep === 2
                  ? 'bg-indigo-950 border-orange-500 text-white shadow-md'
                  : escrowTrade.currentStep > 2
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center ${escrowTrade.currentStep === 2 ? 'bg-orange-500 text-indigo-950' : 'bg-slate-200 text-slate-800'}`}>
                  2
                </span>
                {escrowTrade.step2CredentialsHandoff && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Step 2: Credential Handoff</h4>
              <p className={`text-[11px] mt-1 ${escrowTrade.currentStep === 2 ? 'text-slate-200' : 'text-slate-500'}`}>Encrypted Konami ID &amp; password unmask</p>
            </div>

            {/* Step 3 */}
            <div 
              onClick={() => onUpdateEscrowStep(3)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                escrowTrade.currentStep === 3
                  ? 'bg-indigo-950 border-orange-500 text-white shadow-md'
                  : escrowTrade.currentStep > 3
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center ${escrowTrade.currentStep === 3 ? 'bg-orange-500 text-indigo-950' : 'bg-slate-200 text-slate-800'}`}>
                  3
                </span>
                {escrowTrade.step3VerificationPassed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Step 3: Verification</h4>
              <p className={`text-[11px] mt-1 ${escrowTrade.currentStep === 3 ? 'text-slate-200' : 'text-slate-500'}`}>Automated scan player matching check</p>
            </div>

            {/* Step 4 */}
            <div 
              onClick={() => onUpdateEscrowStep(4)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                escrowTrade.currentStep === 4
                  ? 'bg-indigo-950 border-orange-500 text-white shadow-md'
                  : escrowTrade.step4FundsReleased
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center ${escrowTrade.currentStep === 4 ? 'bg-orange-500 text-indigo-950' : 'bg-slate-200 text-slate-800'}`}>
                  4
                </span>
                {escrowTrade.step4FundsReleased && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Step 4: Release &amp; Receipt</h4>
              <p className={`text-[11px] mt-1 ${escrowTrade.currentStep === 4 ? 'text-slate-200' : 'text-slate-500'}`}>Funds go to seller, ownership sealed</p>
            </div>

          </div>
        </div>
      </div>

      {/* Visualizer Section: "The Escrow Visualizer" (Prevents "I paid but no login" scam) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-indigo-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              The Escrow Platform Visualizer
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Money is held safely in the platform vault during transfer. Seller cannot withdraw until buyer verifies login.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-300">
            Zero Direct Transfers Allowed
          </span>
        </div>

        {/* Animated Visual diagram */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
            
            {/* Buyer Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-950 text-white font-bold mx-auto flex items-center justify-center text-lg">
                <User className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{escrowTrade.buyerName} (Buyer)</h4>
              <p className="text-xs text-slate-600 font-mono font-semibold">Deposited: ${escrowTrade.amount} USD</p>
              <div className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 text-[10px] font-bold border border-indigo-200">
                Protected by 72h Cooldown
              </div>
            </div>

            {/* Central Vault Box */}
            <div className="relative p-5 rounded-2xl bg-indigo-950 border-2 border-orange-500 shadow-xl space-y-3 text-white">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-500 text-indigo-950 text-[10px] font-black uppercase tracking-wider">
                Platform Vault Holding
              </div>
              <div className="w-14 h-14 rounded-full bg-orange-500/20 text-orange-400 mx-auto flex items-center justify-center border border-orange-500/40 animate-pulse">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="font-black text-sm text-white">Konami ID Vault Protection</h4>
              <p className="text-[11px] text-slate-200 font-mono leading-tight">
                Funds Frozen: ${escrowTrade.amount} USD<br />
                <span className="text-orange-400 font-bold">Release Condition: Buyer Approval</span>
              </p>
            </div>

            {/* Seller Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-indigo-950 text-white font-bold mx-auto flex items-center justify-center text-lg">
                <User className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{escrowTrade.sellerName} (Seller)</h4>
              <p className="text-xs text-slate-600 font-mono font-semibold">Pending Payout: ${escrowTrade.amount} USD</p>
              <div className="inline-block px-2 py-0.5 rounded bg-orange-50 text-orange-900 text-[10px] font-bold border border-orange-200">
                Konami ID Delivered
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Active Step Content Detail Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Active Step Interface */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Funds Secured Detail */}
          {escrowTrade.currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 text-orange-400 flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-black text-indigo-950">Step 1: Vault Deposit Confirmation</h3>
                  <p className="text-xs text-slate-500 font-medium">Buyer funds are securely locked in the platform Escrow account.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Listing Price:</span>
                  <span>${escrowTrade.amount}.00 USD</span>
                </div>
                <div className="flex justify-between text-slate-700 font-semibold">
                  <span>Platform Escrow Protection Fee:</span>
                  <span>${escrowTrade.platformFee}.00 USD</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-indigo-950 text-sm">
                  <span>Total Vault Deposit:</span>
                  <span>${escrowTrade.amount + escrowTrade.platformFee}.00 USD</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {escrowTrade.paymentStatus === 'SUCCEEDED' || escrowTrade.paymentStatus === 'RELEASED'
                    ? `Card payment secured and held in escrow. Seller can only withdraw after buyer approval or the ${Math.ceil(((escrowTrade.releaseEligibleAt ? new Date(escrowTrade.releaseEligibleAt).getTime() : Date.now() + 24 * 60 * 60 * 1000) - Date.now()) / (1000 * 60 * 60))}h auto-release window.`
                    : 'Awaiting buyer card payment before the vault can be activated.'}
                </span>
              </div>

              <CheckoutWrapper
                amount={escrowTrade.amount + escrowTrade.platformFee}
                tradeId={escrowTrade.tradeId}
              />

              <button
                onClick={() => onUpdateEscrowStep(2)}
                className="w-full py-3 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md border-b-2 border-orange-500"
              >
                Proceed to Step 2: Credential Handoff <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </div>
          )}

          {/* Step 2: Encrypted Credential Handoff & OTP Handoff Box */}
          {escrowTrade.currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950 text-orange-400 flex items-center justify-center font-black text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-indigo-950">Step 2: Credential &amp; 2FA OTP Handoff Vault</h3>
                    <p className="text-xs text-slate-500 font-medium">Seller submits credentials &amp; OTP; Buyer receives them in real-time.</p>
                  </div>
                </div>

                {/* Perspective Role Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveRole('BUYER')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeRole === 'BUYER'
                        ? 'bg-indigo-950 text-white shadow-sm font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-orange-400" />
                    Buyer View ({escrowTrade.buyerName})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRole('SELLER')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeRole === 'SELLER'
                        ? 'bg-orange-600 text-white shadow-sm font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    Seller Portal ({escrowTrade.sellerName})
                  </button>
                </div>
              </div>

              {/* VPN Warning Box for Handover AI Detection */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-amber-950">Escrow release policy</div>
                  <div className="rounded-full bg-white px-2 py-0.5 border border-amber-300 text-[10px] font-bold text-amber-800">
                    {escrowTrade.paymentStatus === 'SUCCEEDED' ? 'PAYMENT HELD' : 'AWAITING PAYMENT'}
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Funds stay locked until the buyer confirms the transfer or the 24-hour hold expires. The seller cannot withdraw early.
                </p>
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Globe className="w-4 h-4 text-amber-600" />
                  IMPORTANT: VPN Region Matching Recommended
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Konami's AI detects instant IP changes and triggers automatic account suspensions. Connect your VPN to the seller's original region before attempting login:
                </p>
                <div className="font-mono bg-white px-3 py-1.5 rounded border border-amber-300 text-amber-900 font-bold inline-block">
                  Target Region: {escrowTrade.vpnRecommendedRegion}
                </div>
              </div>

              {/* SELLER PERSPECTIVE FORM */}
              {activeRole === 'SELLER' && (
                <div className="bg-orange-50/80 rounded-2xl p-5 border-2 border-orange-300 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                      <Key className="w-4 h-4 text-orange-600" />
                      Seller Escrow Vault Control Panel
                    </h4>
                    <span className="px-2 py-0.5 bg-orange-200 text-orange-950 text-[10px] font-mono font-bold rounded">
                      SELLER PORTAL
                    </span>
                  </div>

                  {/* 1. Submit / Edit Konami Credentials */}
                  <form onSubmit={handleSaveSellerCredentials} className="bg-white p-4 rounded-xl border border-orange-200 space-y-3">
                    <div className="text-xs font-bold text-slate-800">
                      1. Submit Konami Account Email &amp; Password for Buyer
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Konami ID Email</label>
                        <input
                          type="email"
                          value={sellerKonamiEmail}
                          onChange={(e) => setSellerKonamiEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-orange-500"
                          placeholder="seller_konami@gmail.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Konami ID Password</label>
                        <input
                          type="text"
                          value={sellerKonamiPassword}
                          onChange={(e) => setSellerKonamiPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-orange-500"
                          placeholder="Password123!"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                      >
                        🔒 Save Credentials to Escrow Vault
                      </button>
                      {credentialsSavedMsg && (
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {credentialsSavedMsg}
                        </span>
                      )}
                    </div>
                  </form>

                  {/* 2. OTP Response Section */}
                  <div className="bg-white p-4 rounded-xl border border-orange-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-600" />
                        2. Konami 2FA One-Time Passcode (OTP) Dispatch
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        otpStatus === 'REQUESTED' 
                          ? 'bg-rose-100 text-rose-800 animate-pulse border border-rose-300' 
                          : otpStatus === 'PROVIDED' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        STATUS: {otpStatus}
                      </span>
                    </div>

                    {otpStatus === 'REQUESTED' && (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-950 font-bold space-y-1 animate-pulse">
                        <p className="flex items-center gap-1.5 text-rose-800 font-extrabold">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          URGENT: Buyer ({escrowTrade.buyerName}) is logging into Konami ID and requested your 2FA OTP Code!
                        </p>
                        <p className="text-[11px] font-normal text-rose-900">
                          Check your email ({sellerKonamiEmail}) for the 6-digit Konami verification passcode and enter it below.
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmitOtp} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={sellerOtpInput}
                          onChange={(e) => setSellerOtpInput(e.target.value)}
                          placeholder="e.g. 819304"
                          maxLength={8}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-black text-indigo-950 tracking-widest outline-none focus:border-orange-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm whitespace-nowrap"
                      >
                        Submit OTP to Buyer
                      </button>
                    </form>

                    {otpStatus === 'PROVIDED' && (
                      <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>OTP Code {currentOtpCode} sent to buyer vault! Buyer is completing account login.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BUYER PERSPECTIVE VIEW */}
              {activeRole === 'BUYER' && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-700" />
                      Encrypted Credentials Vault (Buyer View)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      🔒 Verified Seller Upload
                    </span>
                  </div>

                  {/* Konami ID Email */}
                  <div>
                    <label className="text-[10px] text-slate-600 uppercase tracking-wider block font-extrabold mb-1">
                      Konami ID Email / Username
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={sellerKonamiEmail}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-indigo-950 font-bold outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(sellerKonamiEmail, 'id')}
                        className="px-3 py-2 rounded-xl bg-indigo-950 text-white hover:bg-indigo-900 text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5 text-orange-400" />
                        {copiedField === 'id' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Password Field with Unmask */}
                  <div>
                    <label className="text-[10px] text-slate-600 uppercase tracking-wider block font-extrabold mb-1">
                      Konami ID Password
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type={escrowTrade.credentialsRevealed ? 'text' : 'password'}
                        readOnly
                        value={escrowTrade.credentialsRevealed ? sellerKonamiPassword : '••••••••••••••••'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-orange-700 font-extrabold outline-none"
                      />
                      <button
                        onClick={onToggleRevealCredentials}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0 border border-slate-300"
                      >
                        {escrowTrade.credentialsRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {escrowTrade.credentialsRevealed ? 'Hide' : 'Unmask'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(sellerKonamiPassword, 'pwd')}
                        className="px-3 py-2 rounded-xl bg-indigo-950 text-white hover:bg-indigo-900 text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5 text-orange-400" />
                        {copiedField === 'pwd' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Konami 2FA OTP Request & Receiver Section */}
                  <div className="p-4 bg-white border border-slate-300 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-500" />
                        Konami 2FA One-Time Passcode (OTP) Verification
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">Live Handoff</span>
                    </div>

                    {otpStatus === 'NONE' && (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-600 font-medium leading-tight">
                          If Konami security prompts for a 2FA email verification code during your login, request it directly from the seller below:
                        </p>
                        <button
                          onClick={handleRequestOtp}
                          className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer transition-colors shrink-0 shadow"
                        >
                          📩 Request OTP Code from Seller
                        </button>
                      </div>
                    )}

                    {otpStatus === 'REQUESTED' && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                          <span>Waiting for seller to submit 2FA OTP code... Notification sent to {escrowTrade.sellerName}.</span>
                        </div>
                        <button
                          onClick={() => setOtpStatus('PROVIDED')}
                          className="text-[10px] underline text-amber-800 hover:text-amber-950 cursor-pointer font-bold"
                        >
                          Simulate Receive Code
                        </button>
                      </div>
                    )}

                    {otpStatus === 'PROVIDED' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            2FA OTP Code Received from Seller!
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            Expires in 09:45
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={currentOtpCode}
                            className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-mono text-emerald-950 font-black tracking-widest outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(currentOtpCode, 'otp')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5 text-orange-300" />
                            {copiedField === 'otp' ? 'Copied!' : 'Copy OTP'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onOpenAccountScanner}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
                >
                  <Sparkles className="w-4 h-4 text-orange-500" /> Launch Live Konami Account Scanner
                </button>

                <button
                  onClick={() => onUpdateEscrowStep(3)}
                  className="w-full py-3 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md border-b-2 border-orange-500"
                >
                  Verify Squad &amp; Proceed to Step 3 <ArrowRight className="w-4 h-4 text-orange-400" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verification Check */}
          {escrowTrade.currentStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 text-orange-400 flex items-center justify-center font-black">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-black text-indigo-950">Step 3: Account Verification Audit</h3>
                  <p className="text-xs text-slate-500 font-medium">Automated verification comparing account inventory against listing claims.</p>
                </div>
              </div>

              {/* Checklist Results */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 font-mono text-xs font-bold">
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-800">42 Epic Cards Inventory Check:</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> MATCHED (42/42)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-800">eFootball Coin Balance Check (5,400):</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> MATCHED (5,400)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-800">GP Balance Audit (1.85M GP):</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> MATCHED (1,850,000)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-800">Division 1 Peak History Verification:</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> VERIFIED (Rank #42)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-800">Konami Security / Ban History Audit:</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> CLEAN RECORD
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-slate-800">Escrow release rule:</span>
                  <span className="text-amber-700 font-black">
                    {escrowTrade.paymentStatus === 'SUCCEEDED' ? 'Buyer approval or 24h auto-release' : 'Payment pending'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
                ✨ Account passed all 5 security verification filters. Ready for final release approval!
              </div>

              <button
                onClick={() => onUpdateEscrowStep(4)}
                className="w-full py-3 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md border-b-2 border-orange-500"
              >
                Approve Transfer &amp; Release Funds <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </div>
          )}

          {/* Step 4: Funds Released & Cryptographic Receipt */}
          {escrowTrade.currentStep === 4 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 text-orange-400 flex items-center justify-center font-black">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-black text-indigo-950">Step 4: Exchange Complete &amp; Funds Released</h3>
                  <p className="text-xs text-slate-500 font-medium">Ownership transfer completed. Funds released to seller wallet.</p>
                </div>
              </div>

              {/* Cryptographic Receipt Box */}
              <div className="bg-slate-50 rounded-xl p-5 border border-emerald-300 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-800 border-b border-slate-200 pb-2">
                  <span className="font-extrabold uppercase tracking-wider">Cryptographic Transfer Proof</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                
                <div className="space-y-1.5 text-slate-800 font-semibold">
                  <p>Transaction ID: <strong className="text-indigo-950">ESCROW-TX-9901-2026-0726</strong></p>
                  <p>Seller Payout Amount: <strong className="text-emerald-700 font-bold">${escrowTrade.amount}.00 USD</strong></p>
                  <p>Konami ID Transferred: <strong className="text-indigo-950">{escrowTrade.konamiId}</strong></p>
                  <p>Vault Lock Released At: <strong className="text-slate-600">{new Date().toLocaleString()}</strong></p>
                  <p className="text-[10px] text-slate-500 break-all pt-1">
                    Proof Hash: 0x8f2a991b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
                🎉 Congratulations! The eFootball account transfer is complete and protected by our 72-Hour Backup Dispute Policy.
              </div>
            </div>
          )}

        </div>

        {/* Right Column (1 Col): Squad Pitch Proof, Cooldown Timer & Dispute Control */}
        <div className="space-y-6">

          {/* Locked Squad Pitch Screenshot Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" /> Locked Squad Pitch Proof
              </h4>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ⚡ {escrowTrade.listing.squadRating} Rating
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 aspect-[16/9] shadow-inner group/escrowPitch">
              <img
                src={(escrowTrade.listing.squadImages && escrowTrade.listing.squadImages.length > 0)
                  ? escrowTrade.listing.squadImages[0]
                  : '/src/assets/images/efootball_squad_pitch_1_1785155635891.jpg'
                }
                alt="Escrow Squad Pitch View"
                className="w-full h-full object-cover group-hover/escrowPitch:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
                <span className="px-2 py-0.5 rounded bg-indigo-950/90 text-white font-mono font-extrabold border border-indigo-700/50">
                  Konami: {escrowTrade.listing.ownerUsername || `@${escrowTrade.sellerName}`}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white font-mono font-extrabold border border-emerald-400/50">
                  Formation: {escrowTrade.listing.squadFormation || '4-2-1-3'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 font-medium leading-tight pt-1">
              Cross-reference this starting lineup screenshot with the transferred Konami account upon login.
            </div>
          </div>
          
          {/* 72-Hour Protection Cooldown Clock */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950">72-Hour Protection Period</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-[10px] font-bold border border-orange-300">
                Funds Frozen
              </span>
            </div>

            <div className="bg-indigo-950 text-white rounded-xl p-4 text-center space-y-1 font-mono">
              <span className="text-[10px] text-orange-300 uppercase tracking-wider block font-sans font-bold">Remaining Cooldown Time</span>
              <div className="text-2xl font-black text-orange-400 tracking-tight">
                {formatHours(timerSeconds)}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              If the seller attempts to recover or alter password on this Konami ID during this period, hit <strong>Dispute</strong> immediately to freeze funds and trigger a full refund.
            </p>

            {/* Dispute Button */}
            {escrowTrade.isDisputed ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 space-y-2 text-rose-900">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Dispute Case Active (#{escrowTrade.tradeId})
                </div>
                <p className="text-[11px] font-semibold">
                  Reason: {escrowTrade.disputeReason}
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={onResolveDispute}
                    className="w-full py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Resolve &amp; Close Dispute
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Report Recovery / Trigger Dispute &amp; Instant Refund
              </button>
            )}
          </div>

          {/* Quick Security Checklist Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Buyer Safety Steps
            </h4>
            
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Link your own primary email immediately to the Konami ID.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Enable Two-Factor Authentication (2FA) with Google Authenticator.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Unlink any remaining Google/Apple or Game Center social links.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-black text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Trigger Escrow Dispute &amp; Freeze Funds
              </div>
              <button 
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-indigo-950 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Dispute Reason
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-900 font-semibold"
                >
                  <option value="Account Recovery Attempt by Seller">Seller attempted Konami ID email recovery</option>
                  <option value="Missing Epics / Fake Player Inventory">Epic players missing from account compared to listing</option>
                  <option value="Password Changed / Wrong Credentials">Invalid password or unable to log in</option>
                  <option value="Active Konami Suspension / Ban">Account was banned upon handover</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Evidence &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  placeholder="Describe the issue (e.g. Konami password reset email triggered, missing Gullit card...)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-indigo-900 placeholder-slate-400 font-medium"
                  required
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-semibold">
                🔒 Submitting this dispute immediately freezes the ${escrowTrade.amount} USD deposit in the platform vault and flags the seller account for moderator audit.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                >
                  Submit Dispute &amp; Freeze Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
