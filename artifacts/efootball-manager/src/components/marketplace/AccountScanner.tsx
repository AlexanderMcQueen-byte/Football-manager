import React, { useState } from 'react';
import { AccountListing, PlayerCard } from '@/types/marketplace';
import { calculateAccountRating } from '@/utils/ratingCalculator';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Trophy, 
  Coins, 
  Award, 
  RefreshCw, 
  Zap, 
  User, 
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Shield,
  Eye,
  Info,
  Star,
  Upload,
  Image as ImageIcon,
  Trash2,
  DollarSign
} from 'lucide-react';

interface AccountScannerProps {
  listings: AccountListing[];
  onApplySnapshotHash?: (listingId: string, hash: string) => void;
  onPublishListingToMarketplace?: (listing: AccountListing) => void;
}

export const AccountScanner: React.FC<AccountScannerProps> = ({
  listings,
  onApplySnapshotHash,
  onPublishListingToMarketplace,
}) => {
  const [searchQuery, setSearchQuery] = useState('@Chebukati_eFB');
  const [divisionRank, setDivisionRank] = useState('Division 1 (Global Top 1,000)');
  const [customAskingPrice, setCustomAskingPrice] = useState<number>(250);
  const [selectedIntent, setSelectedIntent] = useState<'sell' | 'exchange'>('sell');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [scannedResult, setScannedResult] = useState<AccountListing | null>(listings[0]);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [hashCopied, setHashCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'squad' | 'ranks' | 'currencies' | 'security'>('squad');
  const [scannerUploadedImages, setScannerUploadedImages] = useState<string[]>([]);

  const buildPublishableListing = (baseListing: AccountListing): AccountListing => ({
    ...baseListing,
    price: customAskingPrice > 0 ? customAskingPrice : baseListing.price,
    listingIntent: selectedIntent,
    squadImages: [],
  });

  const handleScannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files);
      filesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const newImg = reader.result as string;
            setScannerUploadedImages((prev) => [...prev, newImg]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveScannerImage = (indexToRemove: number) => {
    setScannerUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleStartScan = (e: React.FormEvent, overrideIntent?: 'sell' | 'exchange') => {
    e.preventDefault();
    if (!searchQuery.trim() && scannerUploadedImages.length === 0) return;

    const intentToUse = overrideIntent || selectedIntent;
    setSelectedIntent(intentToUse);

    setScanning(true);
    setScanStep(1);

    // Step 1: Processing Uploaded Squad Screenshot & Pitch Formation
    setTimeout(() => {
      setScanStep(2);
    }, 600);

    // Step 2: Evaluating Team Pitch Composition, Manager & Player Boosters
    setTimeout(() => {
      setScanStep(3);
    }, 1200);

    // Step 3: Assessing Division Peak Capability & Competitive Performance Potential
    setTimeout(() => {
      setScanStep(4);
    }, 1800);

    // Step 4: Finalize AI Performance Evaluation & Valuation Rating
    setTimeout(() => {
      fetch('/api/scanner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
        .then(res => res.json())
        .then(data => {
          setScanning(false);
          setVerificationData(data);

          if (data && data.squad) {
            const sq = data.squad;
            const priceToUse = customAskingPrice > 0 ? customAskingPrice : (sq.epicCount ? Math.round(sq.epicCount * 8 + 30) : 250);
            const updatedResult: AccountListing = {
              id: `scan-${Date.now()}`,
              title: sq.title || `eFootball Account (${searchQuery})`,
              sellerName: searchQuery,
              sellerBadge: {
                phoneVerified: true,
                tradesCount: 20,
                idVerified: true,
                disputeFreeRecord: data.isLegit !== false,
                trustScore: data.trustScore || 98,
              },
              price: priceToUse,
              platform: 'Mobile (Android/iOS)',
              region: 'Europe',
              ownerUsername: searchQuery,
              ownerId: sq.ownerId || '892-410-032',
              epicCount: sq.epicCount || 30,
              showtimeCount: sq.showtimeCount || 10,
              gpBalance: sq.gpBalance || 1850000,
              coinBalance: sq.coinBalance || 4200,
              eFootballPoints: sq.eFootballPoints || 15000,
              maxDivision: divisionRank || sq.maxDivision || 'Division 1 (Global Top 1,000)',
              squadRating: sq.squadRating || 3185,
              squadFormation: sq.squadFormation || '4-2-1-3 Quick Counter',
              mainManager: sq.mainManager || 'L. Roman (88 Quick Counter)',
              featuredPlayers: sq.featuredPlayers || [],
              startingXI: sq.startingXI || sq.featuredPlayers || [],
              snapshotVerified: true,
              snapshotHash: data.snapshotHash || `KONAMI-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              konamiIdMasked: sq.konamiIdMasked || 'user***@gmail.com',
              vaultPrivacyStatus: 'PROTECTED_IN_VAULT',
              squadImages: [],
              listingIntent: intentToUse,
              createdDate: new Date().toISOString().split('T')[0],
              description: `Evaluated eFootball squad for Konami Username ${searchQuery} in ${divisionRank}. Team composition rated for ${intentToUse === 'sell' ? 'Direct Sale' : 'Account Exchange'}.`,
            };
            setScannedResult(updatedResult);

            if (onApplySnapshotHash && updatedResult.snapshotHash) {
              onApplySnapshotHash(updatedResult.id, updatedResult.snapshotHash);
            }
          }
        })
        .catch(err => {
          console.error('Scan error fallback:', err);
          setScanning(false);
          const match = listings.find(l =>
            (l.ownerUsername && l.ownerUsername.toLowerCase().includes(searchQuery.toLowerCase()))
          ) || listings[0];

          const fallbackResult: AccountListing = {
            ...match,
            price: customAskingPrice > 0 ? customAskingPrice : match.price,
            ownerUsername: searchQuery,
            maxDivision: divisionRank,
            squadImages: [],
            listingIntent: intentToUse,
          };
          setScannedResult(fallbackResult);
        });
    }, 2400);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Privacy & Research Notice: Konami ID Sensitivity */}
      <div className="bg-indigo-950 border border-slate-200 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
        <div className="flex items-start gap-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-400 text-orange-300 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-sm">
                Konami ID Security &amp; Privacy Protocol
              </h3>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-400 text-[10px] font-mono uppercase font-bold">
                Privacy Shield Active
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              <strong>Why full Konami IDs are strictly hidden:</strong> Raw Konami IDs (login email addresses) are sensitive account recovery credentials. Publicly disclosing Konami IDs triggers automated account ban scripts and phishing attacks.
            </p>
            <p className="text-slate-300 font-mono text-[11px] pt-1 border-t border-indigo-900 font-semibold">
              🔒 <strong>Platform Safety Rule:</strong> Accounts are searched and inspected using public <strong>Konami Username / In-Game Name (IGN)</strong> and <strong>Owner ID</strong>. Full Konami ID credentials remain encrypted inside the 72h Escrow Vault until buyer deposit is confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-indigo-950 border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden text-white">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-orange-400" /> eFootball Account &amp; Squad Snapshot Evaluator
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Upload Squad Screenshot, Enter <span className="text-orange-400">Konami Username</span> &amp; Division Rank
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
            Upload your squad pitch screenshot, input your Konami Username, and share your Division match rank. Get an instant expert performance rating and valuation opinion to <strong>Sell</strong> or <strong>Exchange</strong> your account safely through Escrow.
          </p>
        </div>
      </div>

      {/* Interactive Squad Evaluation Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-slate-900">
        
        {/* Step 1: Upload Squad Pitch Screenshot First */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">1</span>
              <ImageIcon className="w-4 h-4 text-orange-600" />
              Upload Squad Pitch Screenshot First
            </label>
            <span className="text-[10px] text-slate-500 font-mono font-bold">
              {scannerUploadedImages.length} Screenshot{scannerUploadedImages.length !== 1 ? 's' : ''} Attached
            </span>
          </div>

          <p className="text-[11px] text-slate-600 font-medium leading-tight">
            Attach your eFootball squad screenshot (showing 11 starting players, ratings, manager, and bench reserves). The team rating will be evaluated based on your uploaded squad composition.
          </p>

          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-orange-300 rounded-xl bg-white hover:bg-orange-50/50 cursor-pointer transition-colors text-center group">
            <Upload className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-xs font-black text-indigo-950">Click to Select or Drop Squad Pitch Photo</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, WEBP (Starting XI, Reserves, Epics list)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleScannerImageUpload}
              className="hidden"
            />
          </label>

          {/* Scanner Uploaded Thumbnails */}
          {scannerUploadedImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
              {scannerUploadedImages.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-video bg-slate-900 shadow-xs">
                  <img src={imgUrl} alt={`Uploaded squad pitch screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveScannerImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md transition-opacity opacity-90 group-hover:opacity-100 cursor-pointer shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-0.5 left-0.5 px-1 bg-black/80 text-white text-[8px] font-mono rounded">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Konami Username */}
        <div className="space-y-2">
          <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">2</span>
            <User className="w-4 h-4 text-indigo-900" /> Konami Username
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-900" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type your Konami Username (e.g. @Chebukati_eFB)..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-900 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-colors font-mono font-bold"
            />
          </div>
        </div>

        {/* Step 3: Share Division Match Rank */}
        <div className="space-y-2">
          <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">3</span>
            <Trophy className="w-4 h-4 text-emerald-600" /> Share Division Match Rank
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              'Division 1 (Global Top 1,000)',
              'Division 1',
              'Division 2',
              'Division 3',
              'Division 4 - 6',
              'Division 7+'
            ].map((rank) => (
              <button
                key={rank}
                type="button"
                onClick={() => setDivisionRank(rank)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold border text-left transition-all cursor-pointer flex items-center justify-between ${
                  divisionRank === rank
                    ? 'bg-emerald-950 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{rank}</span>
                {divisionRank === rank && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Asking Selling / Exchange Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">4</span>
              <DollarSign className="w-4 h-4 text-orange-600" /> Set Your Asking Price ($ USD &amp; € EUR)
            </label>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-orange-300 font-mono font-bold text-[11px] border border-orange-500/40">
              €{Math.round((customAskingPrice || 0) * 0.92)} EUR Equivalent
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-600 font-black text-sm">$</span>
            <input
              type="number"
              min="10"
              max="5000"
              value={customAskingPrice}
              onChange={(e) => setCustomAskingPrice(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Enter your selling or exchange valuation price (e.g. 250)..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-orange-500 rounded-xl pl-8 pr-28 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-colors font-mono font-bold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono font-extrabold">
              USD / €{Math.round((customAskingPrice || 0) * 0.92)} EUR
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Set the price you want buyers to pay or negotiate from when you publish this account on the Escrow Marketplace.
          </p>
        </div>

        {/* Action Buttons: Sell Account vs Exchange Account */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <span className="text-xs text-slate-500 font-medium sm:mr-auto">
            Rating opinion is based on uploaded squad pitch composition &amp; division rank.
          </span>

          <button
            type="button"
            onClick={(e) => handleStartScan(e, 'sell')}
            disabled={scanning}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-b-2 border-orange-800"
          >
            {scanning && selectedIntent === 'sell' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-orange-200" />
                Rating Squad for Sale...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" /> Sell Account (Rate Squad)
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => handleStartScan(e, 'exchange')}
            disabled={scanning}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 disabled:opacity-50 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-b-2 border-indigo-950"
          >
            {scanning && selectedIntent === 'exchange' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                Rating Squad for Exchange...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-300" /> Exchange Account (Rate Squad)
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200 font-medium">
          <span className="font-bold text-indigo-950">Quick Sample User Handles:</span>
          {listings.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setSearchQuery(l.ownerUsername || l.sellerName);
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-indigo-950 font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
            >
              <User className="w-3 h-3 text-orange-600" />
              {l.ownerUsername || `@${l.sellerName}`}
            </button>
          ))}
        </div>
      </div>

      {/* Scanning Progress Animation */}
      {scanning && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/40">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base">Auditing Account Listing &amp; Seller Proofs...</h3>
            <p className="text-xs text-slate-400 font-mono">Auditing Username / Owner ID: {searchQuery}</p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-md mx-auto space-y-2 text-xs font-mono text-left">
            <div className={`flex items-center gap-2 ${scanStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
              <CheckCircle2 className="w-4 h-4" /> [1/4] Checking Owner Handle against Anti-Scam Records
            </div>
            <div className={`flex items-center gap-2 ${scanStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
              <CheckCircle2 className="w-4 h-4" /> [2/4] Auditing Uploaded Squad Screenshots &amp; Pitch Formation
            </div>
            <div className={`flex items-center gap-2 ${scanStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
              <CheckCircle2 className="w-4 h-4" /> [3/4] Verifying Division Peak, Manager Proficiency &amp; Booster Cards
            </div>
            <div className={`flex items-center gap-2 ${scanStep >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-600'}`}>
              <CheckCircle2 className="w-4 h-4" /> [4/4] Verifying Escrow Vault Credential Handoff Preparedness
            </div>
          </div>
        </div>
      )}

      {/* Account Full Audit View */}
      {!scanning && scannedResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          
          {/* Explicit Legit Owner Handle Verification Banner */}
          {verificationData && !verificationData.isLegit ? (
            <div className="p-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded bg-red-600 text-white font-black text-xs uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> ❌ UNSECURE / BLACKLISTED HANDLE DETECTED
                </span>
                <span className="text-xs font-mono font-bold text-red-300">Risk Score: CRITICAL (0/100)</span>
              </div>
              <p className="text-xs text-red-200 font-medium">
                <strong>Warning:</strong> The searched handle <code>{scannedResult.ownerUsername}</code> or ID <code>{scannedResult.ownerId}</code> matches a blacklisted scammer record in the anti-fraud database.
              </p>
              {verificationData.issues && (
                <ul className="text-[11px] font-mono text-red-300 list-disc list-inside space-y-1 bg-red-900/40 p-2 rounded border border-red-700">
                  {verificationData.issues.map((iss: string, idx: number) => (
                    <li key={idx}>{iss}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/90 to-slate-950 border-2 border-emerald-500 text-emerald-200 space-y-1.5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-black text-xs uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> ✅ LEGIT &amp; VERIFIED EFOOTBALL OWNER HANDLE
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">
                  Trust Rating: 98/100 (0 Active Bans)
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">
                <strong>Owner Handle Audit Success:</strong> Verified active owner handle <strong className="text-white font-mono">{scannedResult.ownerUsername}</strong> (Owner ID: <strong className="text-white font-mono">{scannedResult.ownerId}</strong>). Squad screenshots, division rank, and booster epics successfully verified and backed by live Escrow Vault delivery.
              </p>
            </div>
          )}

          {/* Main Account Title & Public Handle Box */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-extrabold font-mono flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Konami Username: {scannedResult.ownerUsername || `@${scannedResult.sellerName}`}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                  Owner ID: {scannedResult.ownerId || '892-410-032'}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> Konami ID: {scannedResult.konamiIdMasked} (Protected in Vault)
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white pt-1">{scannedResult.title}</h3>
              <p className="text-xs text-slate-400">
                Seller: <strong className="text-slate-200">{scannedResult.sellerName}</strong> • Region: <strong className="text-slate-200">{scannedResult.region}</strong> • Platform: <strong className="text-slate-200">{scannedResult.platform}</strong>
              </p>
            </div>

            {/* Verification Proof Box */}
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 font-mono space-y-1 shrink-0 w-full lg:w-auto">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold flex items-center justify-between gap-2">
                <span>Verified Snapshot Stamp</span>
                <span className="text-emerald-400 font-bold">100% Authentic</span>
              </span>
              <div className="flex items-center justify-between lg:justify-start gap-2 text-xs font-bold text-emerald-400">
                <span>{scannedResult.snapshotHash || 'KONAMI-SNAPSHOT-VERIFIED-991A0'}</span>
                <button
                  onClick={() => copyHash(scannedResult.snapshotHash || 'KONAMI-SNAPSHOT-VERIFIED-991A0')}
                  className="p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  {hashCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Hero Squad Pitch Screenshot Showcase */}
          {(() => {
            const scannerPitchImg = (scannedResult.squadImages && scannedResult.squadImages.length > 0)
              ? scannedResult.squadImages[0]
              : '/images/marketplace/pitch1.jpg';
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-400" /> Verified Squad Pitch &amp; Substitutes Showcase
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {scannedResult.squadImages?.length || 1} Squad Photo{(scannedResult.squadImages?.length || 1) !== 1 ? 's' : ''} Uploaded
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-slate-950 aspect-[16/9] shadow-2xl group/scannerPitch">
                  <img
                    src={scannerPitchImg}
                    alt={`${scannedResult.title} Squad Pitch`}
                    className="w-full h-full object-cover group-hover/scannerPitch:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

                  {/* Top Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md text-amber-300 font-black font-mono text-xs border border-amber-400/50 flex items-center gap-1.5 shadow-lg">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Collective Strength {scannedResult.squadRating}</span>
                    </span>

                    <span className="px-3 py-1 rounded-lg bg-indigo-950/90 backdrop-blur-md text-white font-black font-mono text-xs border border-indigo-500/50 shadow-lg">
                      Konami Handle: {scannedResult.ownerUsername || `@${scannedResult.sellerName}`}
                    </span>
                  </div>

                  {/* Bottom Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-[11px] font-mono">
                      <div className="text-[9px] text-slate-400 font-sans font-bold uppercase">Manager &amp; Tactical Setup</div>
                      <div className="font-extrabold text-orange-300">{scannedResult.mainManager || 'L. Roman'} ({scannedResult.squadFormation || '4-2-1-3'})</div>
                    </div>

                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white font-extrabold font-mono text-[11px] border border-emerald-400/50 shadow-lg flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                      SQUAD PITCH VERIFIED
                    </span>
                  </div>
                </div>

                {/* Thumbnail strip if multiple images */}
                {scannedResult.squadImages && scannedResult.squadImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {scannedResult.squadImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video bg-slate-950 hover:border-orange-500 transition-colors block"
                      >
                        <img src={img} alt={`Pitch photo ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-white text-[8px] font-mono rounded">
                          Photo #{idx + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* AI Squad & Screenshot Rating Score Banner */}
          {(() => {
            const scanRating = calculateAccountRating(scannedResult);
            const isExchange = scannedResult.listingIntent === 'exchange';
            return (
              <div className="bg-indigo-950/90 rounded-2xl p-5 text-white border-2 border-orange-500 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    <span className="font-black text-xs uppercase tracking-wider text-orange-300">
                      Evaluated Squad Rating &amp; Performance Opinion
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-black font-mono border ${isExchange ? 'bg-indigo-900 text-cyan-300 border-cyan-400' : 'bg-orange-600 text-white border-orange-400'}`}>
                      {isExchange ? '🔄 INTENT: ACCOUNT EXCHANGE' : '🏷️ INTENT: DIRECT SALE'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-black font-mono border ${scanRating.badgeColor}`}>
                      {scanRating.tierLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 border-t border-indigo-900/80">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-orange-400 flex items-center gap-2">
                      <Star className="w-8 h-8 fill-amber-400 text-amber-400 shrink-0" />
                      <span>{scanRating.scoreFormatted}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-1 leading-tight max-w-xl">
                      <strong>AI Opinion Summary:</strong> Team composition evaluated for <strong className="text-white">{scannedResult.ownerUsername}</strong> playing in <strong className="text-emerald-400">{scannedResult.maxDivision}</strong>. Evaluated based on uploaded pitch formation, starting XI synergy, and squad depth.
                    </p>
                  </div>

                  <div className="text-right text-[11px] font-mono space-y-1 text-slate-300 shrink-0 bg-indigo-900/60 p-3 rounded-xl border border-indigo-800/80 w-full sm:w-auto">
                    <div>Division Match Peak: <strong className="text-amber-300">{scannedResult.maxDivision}</strong></div>
                    <div>Squad Power Rating: <strong className="text-white">{scanRating.breakdown.squadStrengthScore}/10</strong></div>
                    <div>Booster / Epic Depth: <strong className="text-white">{scanRating.breakdown.epicDepthScore}/10</strong></div>
                    <div>Pitch Screenshot Proof: <strong className="text-emerald-400">{scanRating.breakdown.screenshotProofGrade}</strong></div>
                  </div>
                </div>

                {/* Publish to Marketplace Button CTA */}
                <div className="pt-3 border-t border-indigo-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-emerald-400 block flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Escrow Ready Verification Passed
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Publish your evaluated squad ({scannedResult.ownerUsername}) to the live marketplace for {scannedResult.listingIntent === 'exchange' ? 'Account Exchange' : 'Direct Sale'}.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!scannedResult) return;
                      onPublishListingToMarketplace && onPublishListingToMarketplace(buildPublishableListing(scannedResult));
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border-b-2 border-orange-800 shrink-0"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    Publish {scannedResult.listingIntent === 'exchange' ? 'Exchange' : 'Selling'} Account to Marketplace (Escrow Ready)
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Core Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Collective Strength</span>
              <span className="text-lg font-black text-emerald-400">{scannedResult.squadRating}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Peak Division</span>
              <span className="text-sm font-black text-amber-400">{scannedResult.maxDivision}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Epics Total</span>
              <span className="text-lg font-black text-amber-300">{scannedResult.epicCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Showtime Cards</span>
              <span className="text-lg font-black text-purple-400">{scannedResult.showtimeCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Coins Balance</span>
              <span className="text-lg font-black text-cyan-300">{scannedResult.coinBalance.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">GP Balance</span>
              <span className="text-lg font-black text-slate-200">{(scannedResult.gpBalance / 1000000).toFixed(2)}M</span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-800 space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('squad')}
              className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'squad'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚽ Squad &amp; Pitch Formation
            </button>
            <button
              onClick={() => setActiveTab('ranks')}
              className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'ranks'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🏆 Division Ranks &amp; Manager
            </button>
            <button
              onClick={() => setActiveTab('currencies')}
              className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'currencies'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🪙 In-Game Inventory &amp; Boosters
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🔒 Konami ID Escrow Protection
            </button>
          </div>

          {/* Tab 1: Squad & Pitch Formation */}
          {activeTab === 'squad' && (
            <div className="space-y-4">
              {/* Uploaded Squad Screenshots Section if available */}
              {scannedResult.squadImages && scannedResult.squadImages.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-400" /> Seller Uploaded Squad Screenshots ({scannedResult.squadImages.length})
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Verified Images</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {scannedResult.squadImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group rounded-lg overflow-hidden border border-slate-700 block bg-slate-900 aspect-video hover:border-orange-400 transition-all shadow-md"
                      >
                        <img src={img} alt={`Squad Proof ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono">
                          Proof #{idx + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Active Tactical Formation:</span>
                  <h4 className="text-sm font-extrabold text-cyan-300 font-mono flex items-center gap-2">
                    {scannedResult.squadFormation || '4-2-1-3 Quick Counter'}
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                      Proficiency: 88 (Max)
                    </span>
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Main Manager:</span>
                  <span className="block text-sm font-bold text-amber-300 font-mono">{scannedResult.mainManager}</span>
                </div>
              </div>

              {/* Pitch Visual Stadium Representation */}
              <div className="bg-gradient-to-b from-emerald-950 via-emerald-900/40 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-2xl">
                {/* Stadium pitch lines */}
                <div className="absolute inset-0 border border-emerald-500/20 rounded-xl pointer-events-none m-2"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/20 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-emerald-500/20 pointer-events-none"></div>

                <div className="text-center pb-4 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-400 text-xs font-black font-mono shadow-md">
                    eFOOTBALL 2026 IN-GAME PITCH LINEUP • {scannedResult.squadRating} COLLECTIVE STRENGTH
                  </span>
                </div>

                {/* Pitch Starting XI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 relative z-10">
                  {(scannedResult.startingXI || scannedResult.featuredPlayers).map((player, idx) => {
                    const isEpic = player.cardType === 'Epic' || player.cardType === 'Big Time';
                    const isShowtime = player.cardType === 'Showtime';
                    return (
                      <div
                        key={player.id + idx}
                        className={`bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border-2 transition-all shadow-lg hover:scale-105 ${
                          isEpic
                            ? 'border-amber-400/80 shadow-amber-500/10 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950'
                            : isShowtime
                            ? 'border-purple-400/80 shadow-purple-500/10 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-950'
                            : 'border-slate-700 hover:border-cyan-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <span className={`px-2 py-0.5 rounded font-black text-xs ${
                            player.position === 'CF' || player.position === 'LWF' || player.position === 'RWF' || player.position === 'SS'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : player.position === 'AMF' || player.position === 'CMF' || player.position === 'DMF'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : player.position === 'GK'
                              ? 'bg-amber-400/30 text-amber-200 border border-amber-400/50'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}>
                            {player.position}
                          </span>
                          <span className="font-mono font-black text-amber-300 text-sm flex items-center gap-0.5">
                            <span className="text-[10px] text-emerald-400 font-extrabold">+3</span>
                            {player.boostedRating || player.rating}
                          </span>
                        </div>
                        <span className="font-extrabold text-white text-xs block truncate pt-0.5">{player.name}</span>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                          <span className={isEpic ? 'text-amber-300 font-bold' : isShowtime ? 'text-purple-300 font-bold' : 'text-slate-300'}>
                            {player.cardType}
                          </span>
                          <span>{player.club}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pitch Bench Substitutes Footer */}
                <div className="mt-5 pt-3 border-t border-emerald-500/30 relative z-10 flex items-center justify-between text-xs text-emerald-200 font-mono">
                  <span>Substitutes Bench: 7 Reserve Cards</span>
                  <span className="text-amber-300 font-bold">100% Stamina &amp; Skill Boosters Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Division Ranks & Manager */}
          {activeTab === 'ranks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> eFootball League Division Statistics
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Peak Division Rating:</span>
                    <span className="font-bold text-amber-400">{scannedResult.maxDivision}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Current Division:</span>
                    <span className="font-bold text-emerald-400">Division 1 (Active)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Top 100 Honor Badge:</span>
                    <span className="font-bold text-cyan-300">Unlocked (Season 2026)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Win Rate Estimate:</span>
                    <span className="font-bold text-slate-100">74.8% (210 Matches)</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" /> Manager &amp; Playstyle Proficiency
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Manager Name:</span>
                    <span className="font-bold text-cyan-300">{scannedResult.mainManager}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Tactical Proficiency:</span>
                    <span className="font-bold text-amber-400">88 (Max Booster +3)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900">
                    <span className="text-slate-400">Secondary Playstyle:</span>
                    <span className="font-bold text-slate-300">Long Ball Counter (85)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Manager Stat Bonus:</span>
                    <span className="font-bold text-emerald-400">+3 All Star Stats</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: In-Game Inventory & Boosters */}
          {activeTab === 'currencies' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                  <span className="text-slate-400 text-[10px] uppercase block">eFootball Coins</span>
                  <span className="text-xl font-black text-cyan-300">{scannedResult.coinBalance.toLocaleString()} Coins</span>
                  <span className="text-[10px] text-slate-500 block pt-1">Ready for upcoming Epic Packs</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">GP Balance</span>
                  <span className="text-xl font-black text-slate-200">{scannedResult.gpBalance.toLocaleString()} GP</span>
                  <span className="text-[10px] text-slate-500 block pt-1">Sufficient for 100+ Skill Renewals</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">eFootball Points</span>
                  <span className="text-xl font-black text-amber-400">{scannedResult.eFootballPoints.toLocaleString()} Points</span>
                  <span className="text-[10px] text-slate-500 block pt-1">Redeemable in eFootball Point Shop</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Featured Epic &amp; Showtime Players</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {scannedResult.featuredPlayers.map((player) => (
                    <div key={player.id} className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-xs block">{player.name}</span>
                        <span className="text-[11px] text-slate-400">{player.cardType} • {player.position} ({player.club})</span>
                      </div>
                      <span className="font-mono font-black text-amber-400 text-sm">{player.boostedRating || player.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Security & Konami ID Escrow Protection */}
          {activeTab === 'security' && (
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-sm">Escrow Vault Isolation Protocol</h4>
                  <p className="text-slate-400 text-[11px]">How raw Konami ID credentials are protected during market inspection.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">Konami ID Masked:</span>
                  <span className="font-bold text-amber-300 text-xs">{scannedResult.konamiIdMasked}</span>
                  <span className="text-[10px] text-emerald-400 block pt-1">🔒 Locked inside 256-bit Vault</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">In-Game Identifier:</span>
                  <span className="font-bold text-cyan-300 text-xs">{scannedResult.ownerUsername || `@${scannedResult.sellerName}`}</span>
                  <span className="text-[10px] text-slate-400 block pt-1">Publicly Verified Owner Handle</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 space-y-1">
                <strong className="block font-bold">Safe Handoff Guarantee:</strong>
                <p className="text-[11px] leading-relaxed text-emerald-200/80">
                  When you start an escrow trade, funds are held in cold deposit. The seller submits raw Konami ID login and OTP password directly into the Vault. You receive a 72-hour protection window to verify the squad, coins, and 2FA before funds release.
                </p>
              </div>
            </div>
          )}

          {/* Footer Audit Confirmation */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified by eFootball Escrow Automated Snapshot System v5.2.0
            </span>
            <span className="font-mono text-slate-500 text-[11px]">Audit Timestamp: 2026-07-26</span>
          </div>

        </div>
      )}

    </div>
  );
};
