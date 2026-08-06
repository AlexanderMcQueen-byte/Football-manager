import React, { useState } from 'react';
import { AccountListing } from '@/types/marketplace';
import { calculateAccountRating } from '@/utils/ratingCalculator';
import { 
  X, 
  ShieldCheck, 
  Trophy, 
  Coins, 
  Sparkles, 
  Lock, 
  Award, 
  CheckCircle2,
  Copy,
  Check,
  Star,
  MessageSquare
} from 'lucide-react';

interface AccountInspectModalProps {
  listing: AccountListing | null;
  onClose: () => void;
  onStartEscrow: (listing: AccountListing) => void;
  onOpenNegotiationChat?: (listing: AccountListing) => void;
}

export const AccountInspectModal: React.FC<AccountInspectModalProps> = ({
  listing,
  onClose,
  onStartEscrow,
  onOpenNegotiationChat,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!listing) return null;

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-md flex items-center justify-center p-4 font-sans overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8 text-slate-900">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-indigo-950 text-white text-xs font-extrabold">
                {listing.platform} • {listing.region}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-orange-100 border border-orange-300 text-orange-800 text-xs font-bold font-mono">
                IGN: {listing.ownerUsername || `@${listing.sellerName}`}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 text-xs font-mono font-bold">
                ID: {listing.ownerId || '892-410-032'}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold font-mono">
                SNAPSHOT VERIFIED
              </span>
            </div>
            <h2 className="text-xl font-black text-indigo-950">{listing.title}</h2>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-indigo-950 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price & Seller Banner */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-950 flex items-center justify-center font-extrabold text-orange-400 text-sm">
              {listing.sellerName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                {listing.sellerName}
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Seller Trust Score: <strong className="text-emerald-700 font-bold">{listing.sellerBadge.trustScore}%</strong> ({listing.sellerBadge.tradesCount} Trades)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-indigo-950 font-mono">${listing.price} <span className="text-sm text-slate-500">/ €{Math.round(listing.price * 0.92)}</span></span>
            <span className="text-[10px] text-slate-500 font-bold block">Platform Escrow Included</span>
          </div>
        </div>

        {/* Hero Visual Squad Pitch Screenshot Showcase */}
        {(() => {
          const mainPitchImg = (listing.squadImages && listing.squadImages.length > 0)
            ? listing.squadImages[0]
            : '/images/marketplace/pitch1.jpg';
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-500" /> Live Squad Pitch &amp; Bench Proof
                </h4>
                <span className="text-[10px] font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {listing.squadImages?.length || 1} Verified Pitch Photo{(listing.squadImages?.length || 1) !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-900 bg-slate-950 aspect-[16/9] shadow-xl group/heroPitch">
                <img
                  src={mainPitchImg}
                  alt={`${listing.title} Squad pitch view`}
                  className="w-full h-full object-cover group-hover/heroPitch:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

                {/* Top Overlay: Konami Username & Collective Strength */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 font-black font-mono text-xs border border-amber-400/50 flex items-center gap-1.5 shadow-lg">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Collective Strength {listing.squadRating}</span>
                  </span>

                  <span className="px-3 py-1 rounded-lg bg-indigo-950/90 backdrop-blur-md text-white font-black font-mono text-xs border border-indigo-500/50 shadow-lg">
                    Konami: {listing.ownerUsername || `@${listing.sellerName}`}
                  </span>
                </div>

                {/* Bottom Overlay: Manager & Formation */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-[11px] font-mono">
                    <div className="text-[9px] text-slate-300 font-sans font-bold">MANAGER &amp; FORMATION</div>
                    <div className="font-extrabold text-orange-300">{listing.mainManager || 'L. Roman'} ({listing.squadFormation || '4-2-1-3'})</div>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-emerald-600/90 backdrop-blur-md text-white font-extrabold font-mono text-[11px] border border-emerald-400/50 shadow-lg flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                    PITCH VERIFIED
                  </span>
                </div>
              </div>

              {/* Thumbnail strip if multiple squad screenshots */}
              {listing.squadImages && listing.squadImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {listing.squadImages.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative rounded-lg overflow-hidden border border-slate-300 aspect-video bg-slate-900 hover:border-orange-500 transition-colors block"
                    >
                      <img src={img} alt={`Pitch shot ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-white text-[8px] font-mono rounded">
                        #{idx + 1}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* AI Squad & Screenshot Rating Banner */}
        {(() => {
          const ratingInfo = calculateAccountRating(listing);
          return (
            <div className="bg-indigo-950 rounded-2xl p-4 text-white border-2 border-orange-500 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <span className="font-black text-xs uppercase tracking-wider text-orange-300">
                    AI Squad &amp; Screenshot Rating
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-black font-mono border ${ratingInfo.badgeColor}`}>
                  {ratingInfo.tierLabel}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-3xl font-black font-mono text-orange-400 flex items-center gap-2">
                    <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                    <span>{ratingInfo.scoreFormatted}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                    Calculated from squad power ({listing.squadRating}), epics depth ({listing.epicCount}), &amp; {listing.squadImages?.length || 0} screenshot proof photo(s).
                  </p>
                </div>

                <div className="text-right text-[10px] font-mono space-y-0.5 text-slate-300">
                  <div>Squad Power: <strong className="text-white">{ratingInfo.breakdown.squadStrengthScore}/10</strong></div>
                  <div>Epic Depth: <strong className="text-white">{ratingInfo.breakdown.epicDepthScore}/10</strong></div>
                  <div>Proof Grade: <strong className="text-emerald-400">{ratingInfo.breakdown.screenshotProofGrade}</strong></div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Full Core Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
          <div className="bg-indigo-950 p-3 rounded-xl text-white">
            <span className="text-[10px] text-orange-300 uppercase block font-sans font-bold">Epics</span>
            <span className="text-lg font-black text-white">{listing.epicCount}</span>
          </div>
          <div className="bg-indigo-950 p-3 rounded-xl text-white">
            <span className="text-[10px] text-slate-300 uppercase block font-sans font-bold">Coin Balance</span>
            <span className="text-lg font-black text-orange-400">{listing.coinBalance.toLocaleString()}</span>
          </div>
          <div className="bg-indigo-950 p-3 rounded-xl text-white">
            <span className="text-[10px] text-slate-300 uppercase block font-sans font-bold">GP Balance</span>
            <span className="text-lg font-black text-slate-100">{(listing.gpBalance / 1000000).toFixed(2)}M</span>
          </div>
          <div className="bg-indigo-950 p-3 rounded-xl text-white">
            <span className="text-[10px] text-emerald-300 uppercase block font-sans font-bold">Squad Rating</span>
            <span className="text-lg font-black text-emerald-400">{listing.squadRating}</span>
          </div>
        </div>

        {/* Division & Manager */}
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs flex justify-between font-medium">
          <span className="text-slate-700">Peak Division: <strong className="text-indigo-950 font-bold">{listing.maxDivision}</strong></span>
          <span className="text-slate-700">Manager: <strong className="text-indigo-950 font-bold">{listing.mainManager}</strong></span>
        </div>

        {/* Featured Players Showcase */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" /> Extracted Booster Players
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {listing.featuredPlayers.map((player) => (
              <div key={player.id} className="bg-orange-50/70 p-2.5 rounded-xl border border-orange-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{player.name}</span>
                  <span className="text-[10px] text-slate-500 block">{player.cardType} • {player.position}</span>
                </div>
                <span className="font-mono font-black text-orange-700 text-sm">{player.boostedRating || player.rating}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof Stamp */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 font-semibold">Cryptographic Proof: {listing.snapshotHash || 'KONAMI-SNAPSHOT-VERIFIED-991A'}</span>
          <button
            onClick={() => copyHash(listing.snapshotHash || 'KONAMI-SNAPSHOT-VERIFIED-991A')}
            className="text-indigo-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedHash ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Description */}
        <div className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
          {listing.description}
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer border border-slate-300"
          >
            Close Inspector
          </button>

          {onOpenNegotiationChat && (
            <button
              onClick={() => {
                onClose();
                onOpenNegotiationChat(listing);
              }}
              className="py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-b-2 border-orange-800"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" /> Chat / Negotiate Price
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onStartEscrow(listing);
            }}
            className="py-3 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-all shadow-md border-b-2 border-orange-500 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-orange-400" /> Start Escrow (${listing.price})
          </button>
        </div>

      </div>
    </div>
  );
};
