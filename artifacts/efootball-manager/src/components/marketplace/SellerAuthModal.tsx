import React, { useState } from 'react';
import { SellerAccount } from '@/types/marketplace';
import { 
  X, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  User, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Send,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface SellerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeller?: SellerAccount | null;
  onSellerAuthenticated?: (seller: SellerAccount) => void;
  onAuthenticatedSeller?: (seller: SellerAccount) => void;
}

export const SellerAuthModal: React.FC<SellerAuthModalProps> = ({
  isOpen,
  onClose,
  currentSeller,
  onSellerAuthenticated,
  onAuthenticatedSeller,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<'email_input' | 'otp_verify' | 'profile_setup'>('email_input');
  
  // Registration state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [username, setUsername] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSentCode, setOtpSentCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid, legitimate email address (e.g. seller@gmail.com).');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMsg('Please enter a password (at least 4 characters).');
      return;
    }

    setErrorMsg('');
    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code to email.');
      }

      setOtpSentCode(data.otpCode || '');
      setPreviewUrl(data.previewUrl || null);
      setSmtpConfigured(!!data.smtpConfigured);
      setIsSendingOtp(false);
      setStep('otp_verify');
      setOtpCode('');
    } catch (err: any) {
      console.error('Email send error:', err);
      setErrorMsg(err.message || 'Error sending verification code.');
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg('Please enter the verification code sent to your email.');
      return;
    }

    setErrorMsg('');
    setIsVerifyingOtp(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: otpCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setIsVerifyingOtp(false);
      const defaultName = username.trim() || email.split('@')[0] || 'Verified_Seller';
      setUsername(defaultName);
      setStep('profile_setup');
    } catch (err: any) {
      console.error('Verification error:', err);
      setErrorMsg(err.message || 'Failed to verify code.');
      setIsVerifyingOtp(false);
    }
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const newSeller: SellerAccount = {
      id: `seller-${Date.now()}`,
      email: email.trim(),
      username: username.trim(),
      phoneVerified,
      emailVerified: true,
      trustScore: 100,
      tradesCount: 1,
      averageRating: 5.0,
      totalReviews: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (onSellerAuthenticated) onSellerAuthenticated(newSeller);
    if (onAuthenticatedSeller) onAuthenticatedSeller(newSeller);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMsg('Please enter a valid seller email address.');
      return;
    }

    setErrorMsg('');
    const sellerHandle = loginEmail.split('@')[0] || 'VerifiedSeller';
    const existingSeller: SellerAccount = {
      id: `seller-login-${Date.now()}`,
      email: loginEmail.trim(),
      username: sellerHandle.includes('chebukati') ? 'Chebukati_eFootball' : sellerHandle,
      phoneVerified: true,
      emailVerified: true,
      trustScore: 99,
      tradesCount: 24,
      averageRating: 5.0,
      totalReviews: 18,
      createdAt: '2026-07-20',
    };

    if (onSellerAuthenticated) onSellerAuthenticated(existingSeller);
    if (onAuthenticatedSeller) onAuthenticatedSeller(existingSeller);
    onClose();
  };

  const handleDemoChebukatiLogin = () => {
    const chebukatiAccount: SellerAccount = {
      id: 'seller-chebukati-01',
      email: 'chebukati@efootball.app',
      username: 'Chebukati_eFootball',
      phoneVerified: true,
      emailVerified: true,
      trustScore: 100,
      tradesCount: 52,
      averageRating: 5.0,
      totalReviews: 32,
      createdAt: '2026-07-20',
    };

    if (onSellerAuthenticated) onSellerAuthenticated(chebukatiAccount);
    if (onAuthenticatedSeller) onAuthenticatedSeller(chebukatiAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-indigo-950 p-4 border-b border-indigo-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md border border-orange-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">
                Verified Seller Account Access
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                Legitimate Email Verification Required
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-around text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-center transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-orange-600 text-white font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Seller Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-center transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-indigo-600 text-white font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In Existing Account
          </button>
        </div>

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <>
            {/* Step 1: Email Address & Password Entry */}
            {step === 'email_input' && (
              <form onSubmit={handleSendEmailOtp} className="p-5 space-y-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Real Email Verification Required:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Create a seller account with a legitimate email address so buyers can send you inquiry messages, price offers, and Konami ID transfer OTPs.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Your Seller Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. myname@gmail.com or seller@efootball.app"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Set Seller Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer border-b-2 border-orange-800"
                >
                  {isSendingOtp ? (
                    <>Sending Email Code...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Verification Code to Email
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Enter Verification Code */}
            {step === 'otp_verify' && (
              <form onSubmit={handleVerifyOtp} className="p-5 space-y-4">
                <div className="bg-emerald-950/60 border border-emerald-800/80 p-3.5 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Verification Code Dispatched!
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    A 6-digit verification code has been sent directly to your email inbox: <strong className="text-amber-300 font-mono break-all">{email}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Please open your email app or inbox, copy the verification code, and enter it below. (Check spam/junk folder if not visible in main inbox).
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Enter Verification Code From Your Email
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 782-901"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none font-mono font-bold tracking-widest text-center"
                      required
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> {errorMsg}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email_input');
                      setErrorMsg('');
                    }}
                    className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Change Email
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifyingOtp ? (
                      <>Verifying Code...</>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Verify Email &amp; Continue
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Complete Seller Profile */}
            {step === 'profile_setup' && (
              <form onSubmit={handleCompleteRegistration} className="p-5 space-y-4">
                <div className="text-center py-2 space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400 text-orange-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-white text-sm">Create Public Seller Handle</h4>
                  <p className="text-xs text-slate-300">This handle will appear on your eFootball account listings.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Seller Username / IGN
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Chebukati_Official or MyName_eFootball"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Email: <strong className="text-emerald-400 font-mono">{email}</strong></span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer border-b-2 border-orange-800"
                >
                  Create Account &amp; Open Portal <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Seller Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. chebukati@efootball.app or your email..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none font-mono font-bold"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Log In to Seller Account
            </button>

            {/* Quick Demo Login */}
            <div className="pt-3 border-t border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-400 font-medium block">
                Quick Access Demo Account:
              </span>
              <button
                type="button"
                onClick={handleDemoChebukatiLogin}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                ⚡ Log In as Chebukati_eFootball (52 Trades, 5.0 ⭐)
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
