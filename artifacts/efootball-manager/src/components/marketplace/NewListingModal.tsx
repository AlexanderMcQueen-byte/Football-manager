import React, { useState } from 'react';
import { AccountListing, PlayerCard } from '@/types/marketplace';
import { calculateAccountRating } from '@/utils/ratingCalculator';
import { X, ShoppingCart, ShieldCheck, Image, Upload, Trash2, Star, Sparkles } from 'lucide-react';

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateListing: (newListing: AccountListing) => void;
}

export const NewListingModal: React.FC<NewListingModalProps> = ({
  isOpen,
  onClose,
  onCreateListing,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('Division 1 Top Squad | 30 Epics & 2,200 Coins');
  const [price, setPrice] = useState<number>(150);
  const [platform, setPlatform] = useState<AccountListing['platform']>('Mobile (Android/iOS)');
  const [region, setRegion] = useState<AccountListing['region']>('Europe');
  const [epicCount, setEpicCount] = useState<number>(18);
  const [showtimeCount, setShowtimeCount] = useState<number>(5);
  const [gpBalance, setGpBalance] = useState<number>(1500000);
  const [coinBalance, setCoinBalance] = useState<number>(2200);
  const [maxDivision, setMaxDivision] = useState('Division 1 (Rank #180)');
  const [squadRating, setSquadRating] = useState<number>(3160);
  const [mainManager, setMainManager] = useState('L. Roman (88 Quick Counter)');
  const [ownerUsername, setOwnerUsername] = useState('MyGameHandle_eFB');
  const [ownerId, setOwnerId] = useState('892-410-032');
  const [konamiEmail, setKonamiEmail] = useState('seller_konami@gmail.com');
  const [description, setDescription] = useState('Verified eFootball account with intact Booster Epics and Coins. Ready for immediate escrow transfer.');
  const [squadImages, setSquadImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files);
      filesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setSquadImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSquadImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const liveRating = calculateAccountRating({
    squadRating,
    epicCount,
    showtimeCount,
    squadImages: [],
    maxDivision,
    coinBalance,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const featuredPlayers: PlayerCard[] = [];

    const listing: AccountListing = {
      id: `ef-${Date.now().toString().slice(-4)}`,
      title: title || 'eFootball Account | Verified Epics & Coins',
      sellerName: 'You (Verified Seller)',
      sellerBadge: {
        phoneVerified: true,
        tradesCount: 15,
        idVerified: true,
        disputeFreeRecord: true,
        trustScore: 98,
      },
      price: price || 150,
      platform,
      region,
      ownerUsername: ownerUsername || 'MyGameHandle_eFB',
      ownerId: ownerId || '892-410-032',
      epicCount: epicCount || 18,
      showtimeCount: showtimeCount || 5,
      gpBalance: gpBalance || 1500000,
      coinBalance: coinBalance || 2200,
      eFootballPoints: 12000,
      maxDivision: maxDivision || 'Division 1 (Rank #180)',
      squadRating: squadRating || 3160,
      mainManager: mainManager || 'L. Roman (88 Quick Counter)',
      featuredPlayers,
      snapshotVerified: true,
      snapshotHash: `KONAMI-SNAPSHOT-VERIFIED-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      konamiIdMasked: konamiEmail ? `${konamiEmail.substring(0, 3)}****@gmail.com` : 'user****99@gmail.com',
      vaultPrivacyStatus: 'PROTECTED_IN_VAULT',
      squadImages: [],
      accountRatingScore: liveRating.score,
      createdDate: new Date().toISOString().split('T')[0],
      description: description || 'Clean eFootball account ready for escrow transfer. All epics intact.'
    };

    onCreateListing(listing);
    onClose();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-md flex items-center justify-center p-4 font-sans overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8 text-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-indigo-950 font-black text-base">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            List eFootball Account on Escrow Marketplace
          </div>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onClose(); }} 
            className="text-slate-400 hover:text-indigo-950 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          
          <div>
            <label className="font-extrabold text-slate-800 block mb-1">Listing Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Div 1 Top Squad | 30 Epics (Gullit, Big Time Messi) | 2,500 Coins"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-extrabold text-slate-800 block">Asking Price ($ USD)</label>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  €{Math.round((price || 0) * 0.92)} EUR
                </span>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-semibold"
              >
                <option value="Mobile (Android/iOS)">Mobile (Android/iOS)</option>
                <option value="PlayStation 5">PlayStation 5</option>
                <option value="PC (Steam)">PC (Steam)</option>
                <option value="Xbox">Xbox</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Epic Count</label>
              <input
                type="number"
                value={epicCount}
                onChange={(e) => setEpicCount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Coin Balance</label>
              <input
                type="number"
                value={coinBalance}
                onChange={(e) => setCoinBalance(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">GP Balance</label>
              <input
                type="number"
                value={gpBalance}
                onChange={(e) => setGpBalance(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-bold"
              />
            </div>
          </div>

          {/* Squad Screenshots Upload Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                <Image className="w-4 h-4 text-indigo-950" />
                Upload Squad Screenshots (Starting XI, Reserves, Epics List)
              </label>
              <span className="text-[10px] text-slate-500 font-mono font-semibold">
                {squadImages.length} Image{squadImages.length !== 1 ? 's' : ''} Added
              </span>
            </div>

            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-white hover:bg-indigo-50/50 cursor-pointer transition-colors text-center group">
              <Upload className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-xs font-bold text-indigo-950">Click or Drag Squad Photos to Upload</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, WEBP (Starting XI, Manager, Booster Epics)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Uploaded Thumbnails Grid */}
            {squadImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {squadImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-video bg-slate-900">
                    <img src={imgUrl} alt={`Squad screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md transition-opacity opacity-90 group-hover:opacity-100 cursor-pointer shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">
                Konami Username
              </label>
              <input
                type="text"
                value={ownerUsername}
                onChange={(e) => setOwnerUsername(e.target.value)}
                placeholder="Konami Username (e.g. @Chebukati_eFB)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">
                eFootball Owner ID
              </label>
              <input
                type="text"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="892-410-032"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Peak Division</label>
              <input
                type="text"
                value={maxDivision}
                onChange={(e) => setMaxDivision(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-semibold"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Main Manager</label>
              <input
                type="text"
                value={mainManager}
                onChange={(e) => setMainManager(e.target.value)}
                placeholder="e.g. L. Roman (88 Quick Counter)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1 flex items-center justify-between">
              <span>Konami ID Email (For Escrow Vault Delivery)</span>
              <span className="text-[10px] text-orange-600 font-mono font-bold">🔒 Escrow Vault Only</span>
            </label>
            <input
              type="email"
              value={konamiEmail}
              onChange={(e) => setKonamiEmail(e.target.value)}
              placeholder="konami_seller@gmail.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-900 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1">Account Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe player skills, manager boosters, or untethered social links..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-indigo-900 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Live AI Rating Preview Banner */}
          <div className="bg-indigo-950 rounded-2xl p-4 text-white border-2 border-orange-500 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span className="font-black text-xs uppercase tracking-wider text-orange-300">
                  AI Squad &amp; Screenshot Rating
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-black font-mono border ${liveRating.badgeColor}`}>
                {liveRating.tierLabel}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-3xl font-black font-mono text-orange-400 flex items-center gap-1.5">
                  <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                  <span>{liveRating.scoreFormatted}</span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                  Calculated from squad power ({squadRating}), epics count ({epicCount}), &amp; {squadImages.length} screenshot proof photo{squadImages.length !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="text-right text-[10px] font-mono space-y-0.5 text-slate-300">
                <div>Squad Power: <strong className="text-white">{liveRating.breakdown.squadStrengthScore}/10</strong></div>
                <div>Epic Depth: <strong className="text-white">{liveRating.breakdown.epicDepthScore}/10</strong></div>
                <div>Proof Grade: <strong className="text-emerald-400">{liveRating.breakdown.screenshotProofGrade}</strong></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0" />
            <span>Escrow Guarantee: Credentials &amp; 2FA OTP codes are submitted into the vault during live trade handoff.</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold transition-colors cursor-pointer shadow-md border-b-2 border-orange-500"
            >
              Publish Listing with Escrow
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
