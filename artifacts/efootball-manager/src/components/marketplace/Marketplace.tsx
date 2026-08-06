import React, { useState, useMemo } from 'react';
import { AccountListing } from '@/types/marketplace';
import { calculateAccountRating } from '@/utils/ratingCalculator';
import { 
  ShieldCheck, 
  PhoneCall, 
  Award, 
  Coins, 
  Trophy, 
  Zap, 
  Search, 
  Filter, 
  CheckCircle2, 
  ExternalLink, 
  UserCheck, 
  AlertCircle,
  Eye,
  Lock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Flame,
  Star,
  Image as ImageIcon,
  X,
  MessageSquare
} from 'lucide-react';

interface MarketplaceProps {
  listings: AccountListing[];
  onSelectListingForEscrow: (listing: AccountListing) => void;
  onInspectAccount: (listing: AccountListing) => void;
  onOpenNegotiationChat?: (listing: AccountListing) => void;
  onRateSeller?: (sellerName: string) => void;
  publishedToast?: string | null;
  onDismissPublishedToast?: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  listings,
  onSelectListingForEscrow,
  onInspectAccount,
  onOpenNegotiationChat,
  onRateSeller,
  publishedToast,
  onDismissPublishedToast,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [minEpics, setMinEpics] = useState<number>(0);
  const [onlyVerifiedSellers, setOnlyVerifiedSellers] = useState<boolean>(false);
  const [onlySnapshotVerified, setOnlySnapshotVerified] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'epics_desc' | 'rating_desc'>('epics_desc');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'BOTH'>('BOTH');

  // Currency helper (1 USD = 0.92 EUR)
  const formatPrice = (usd: number) => {
    const eur = Math.round(usd * 0.92);
    if (currency === 'EUR') return `€${eur}`;
    if (currency === 'USD') return `$${usd}`;
    return `$${usd} / €${eur}`;
  };

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Search match
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ownerUsername && item.ownerUsername.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ownerId && item.ownerId.includes(searchTerm)) ||
        item.featuredPlayers.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Platform match
      if (selectedPlatform !== 'ALL' && !item.platform.includes(selectedPlatform)) {
        return false;
      }

      // Min Epics match
      if (item.epicCount < minEpics) return false;

      // Seller Verified Filter
      if (onlyVerifiedSellers && (!item.sellerBadge.phoneVerified || item.sellerBadge.tradesCount < 10)) {
        return false;
      }

      // Snapshot Verified Filter
      if (onlySnapshotVerified && !item.snapshotVerified) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'epics_desc') return b.epicCount - a.epicCount;
      if (sortBy === 'rating_desc') return b.squadRating - a.squadRating;
      return 0;
    });
  }, [listings, searchTerm, selectedPlatform, minEpics, onlyVerifiedSellers, onlySnapshotVerified, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Published Success Banner */}
      {publishedToast && (
        <div className="relative overflow-hidden rounded-2xl bg-emerald-950 border-2 border-emerald-400 p-4 sm:p-5 shadow-2xl text-white flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Listing Published Live!
                </span>
                <span className="text-emerald-300 text-xs font-semibold">Active on Escrow Marketplace</span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                "{publishedToast}" is now live and visible to buyers!
              </h4>
            </div>
          </div>

          <button
            onClick={onDismissPublishedToast}
            className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Marketplace Top Hero Banner - TiHAN / Masai Deep Navy Style */}
      <div className="relative overflow-hidden rounded-2xl bg-indigo-950 border-l-4 border-orange-500 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-orange-400" /> 100% Escrow Protected Konami ID Exchange
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            BUILD YOUR FUTURE IN EFOOTBALL™ <span className="text-orange-400">ACCOUNT TRADING</span>
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Trade verified eFootball accounts risk-free. Every account undergoes an automated <strong>Konami ID Snapshot Scan</strong> for player authenticity and funds remain frozen in our <strong>72-Hour Protection Vault</strong> until transfer is confirmed.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-200">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Verified Player Inventory</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Locked Platform Escrow</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
              <span>Instant Dispute &amp; Refund</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Konami Username (e.g. Chebukati), Epics, ID..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-900 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Platform Select */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-indigo-900"
            >
              <option value="ALL">All Platforms</option>
              <option value="Mobile">Mobile (iOS/Android)</option>
              <option value="PlayStation">PlayStation 5</option>
              <option value="PC">PC (Steam)</option>
              <option value="Xbox">Xbox</option>
            </select>

            {/* Min Epics Slider/Select */}
            <select
              value={minEpics}
              onChange={(e) => setMinEpics(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-indigo-900"
            >
              <option value={0}>Any Epic Count</option>
              <option value={10}>10+ Epics</option>
              <option value={20}>20+ Epics</option>
              <option value={30}>30+ Epics</option>
              <option value={40}>40+ Epics (God Squad)</option>
            </select>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-orange-50 border border-orange-300 text-orange-950 font-extrabold text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
            >
              <option value="BOTH">Currency: Both ($ USD &amp; € EUR)</option>
              <option value="USD">Currency: $ USD Only</option>
              <option value="EUR">Currency: € EUR Only</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-indigo-900"
            >
              <option value="epics_desc">Sort: Most Epics First</option>
              <option value="rating_desc">Sort: Highest Squad Rating</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Security Checkbox Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none hover:text-indigo-950 font-medium">
            <input
              type="checkbox"
              checked={onlyVerifiedSellers}
              onChange={(e) => setOnlyVerifiedSellers(e.target.checked)}
              className="accent-indigo-950 w-4 h-4 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Sellers Only (Phone Linked &amp; 10+ Trades)
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none hover:text-indigo-950 font-medium">
            <input
              type="checkbox"
              checked={onlySnapshotVerified}
              onChange={(e) => setOnlySnapshotVerified(e.target.checked)}
              className="accent-orange-600 w-4 h-4 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Konami Snapshot Verified Accounts
            </span>
          </label>
        </div>
      </div>

      {/* Listing Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-orange-500 mx-auto" />
          <h3 className="text-lg font-bold text-indigo-950">No matching accounts found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, lowering the Epic count threshold, or removing specific filter flags.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedPlatform('ALL');
              setMinEpics(0);
              setOnlyVerifiedSellers(false);
              setOnlySnapshotVerified(false);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredListings.map((listing) => {
            const ratingInfo = calculateAccountRating(listing);
            return (
              <div
                key={listing.id}
                className="group relative bg-white border border-slate-200/90 hover:border-orange-500 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                {/* Card Header: Title, Price & AI Score Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {listing.sellerName.includes('You') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black bg-orange-600 text-white shadow-xs uppercase tracking-wider animate-pulse">
                            ✨ YOUR LISTING
                          </span>
                        )}

                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-indigo-950 border border-slate-200">
                          {listing.platform} • {listing.region}
                        </span>

                        {/* AI Squad & Screenshot Score Badge (out of 10) */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-black border font-mono shadow-xs ${ratingInfo.badgeColor}`}>
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300 shrink-0" />
                          <span>AI Rating: {ratingInfo.scoreFormatted}</span>
                        </span>

                        {listing.squadImages && listing.squadImages.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-950">
                            <ImageIcon className="w-3 h-3 text-indigo-600" />
                            {listing.squadImages.length} Screenshot{listing.squadImages.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-indigo-950 text-base leading-snug group-hover:text-orange-600 transition-colors">
                        {listing.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-indigo-950 font-mono">{formatPrice(listing.price)}</div>
                      <span className="text-[10px] text-slate-500 font-semibold">Escrow Fee Included</span>
                    </div>
                  </div>

                {/* Squad Screenshot Pitch Preview Showcase */}
                {(() => {
                  const cardPitchImg = (listing.squadImages && listing.squadImages.length > 0)
                    ? listing.squadImages[0]
                    : '/images/marketplace/pitch1.jpg';
                  return (
                    <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 group/img aspect-[16/9] shadow-md">
                      <img
                        src={cardPitchImg}
                        alt={`${listing.title} Squad pitch view`}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                      
                      {/* Floating Squad Specs Badges on Pitch Screenshot */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-300 font-black font-mono text-[10px] border border-amber-500/40 shadow-xs">
                          ⚡ Collective Strength {listing.squadRating}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-950/80 backdrop-blur-md text-slate-200 font-bold font-mono text-[10px] border border-indigo-500/30">
                          {listing.squadFormation || '4-2-1-3'}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-indigo-950/90 text-white font-mono font-bold flex items-center gap-1 border border-indigo-700/50">
                          <ImageIcon className="w-3 h-3 text-orange-400" />
                          {listing.squadImages?.length || 1} Pitch Photo{(listing.squadImages?.length || 1) !== 1 ? 's' : ''}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white font-mono font-extrabold border border-emerald-400/50">
                          Rating: {ratingInfo.scoreFormatted}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Seller Trust & Security Badge Box */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-950 flex items-center justify-center font-extrabold text-orange-400 text-xs">
                        {listing.sellerName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{listing.sellerName}</span>
                    </div>

                    {/* Trust Score & Star Rating */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 text-amber-900 text-[11px] font-extrabold">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{listing.sellerBadge.averageRating || 5.0} ({listing.sellerBadge.totalReviews || 12})</span>
                      </div>

                      <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 text-[11px] font-extrabold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{listing.sellerBadge.trustScore}% Trust</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Badges Row & Rate Button */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] pt-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {listing.sellerBadge.phoneVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-700 font-semibold shadow-2xs">
                          <PhoneCall className="w-3 h-3 text-emerald-600" /> Verified Phone
                        </span>
                      )}

                      {listing.sellerBadge.tradesCount >= 10 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-indigo-200 text-indigo-900 font-semibold shadow-2xs">
                          <Award className="w-3 h-3 text-indigo-700" /> {listing.sellerBadge.tradesCount}+ Trades
                        </span>
                      )}
                    </div>

                    {onRateSeller && (
                      <button
                        onClick={() => onRateSeller(listing.sellerName)}
                        className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-[10px] transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Star className="w-3 h-3 text-amber-600 fill-amber-500" /> Rate Seller
                      </button>
                    )}
                  </div>
                </div>

                {/* Account Core Specs Grid */}
                <div className="grid grid-cols-4 gap-2 text-center bg-indigo-950 rounded-xl p-2.5 mb-4 text-white font-mono shadow-inner">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-orange-300 uppercase font-sans font-bold tracking-wider block">Epics</span>
                    <span className="text-sm font-black text-white">{listing.epicCount}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-300 uppercase font-sans font-bold tracking-wider block">Coins</span>
                    <span className="text-sm font-black text-orange-400">{listing.coinBalance.toLocaleString()}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-300 uppercase font-sans font-bold tracking-wider block">GP</span>
                    <span className="text-sm font-black text-slate-100">{(listing.gpBalance / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-emerald-300 uppercase font-sans font-bold tracking-wider block">Rating</span>
                    <span className="text-sm font-black text-emerald-400">{listing.squadRating}</span>
                  </div>
                </div>

                {/* Division & Manager */}
                <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-100 px-3 py-2 rounded-xl mb-4 border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold text-indigo-950">{listing.maxDivision}</span>
                  </div>
                  <div className="text-slate-600 font-semibold truncate max-w-[180px]">
                    Mgr: {listing.mainManager}
                  </div>
                </div>

                {/* Featured Players Showcase Chips */}
                <div className="space-y-1.5 mb-5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Featured Boosted Stars
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.featuredPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-xs flex items-center gap-1.5 font-bold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                        <span>{player.name}</span>
                        <span className="font-black text-orange-700 font-mono text-[11px]">
                          {player.boostedRating || player.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                {/* Snapshot Status Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-600 px-1 mb-1 gap-1">
                  <span className="flex items-center gap-1 text-indigo-950 font-mono font-bold">
                    <UserCheck className="w-3 h-3 text-indigo-700" /> IGN: {listing.ownerUsername || `@${listing.sellerName}`}
                  </span>
                  <span className="font-mono text-orange-700 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-orange-600" /> Konami ID Vault-Protected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => onInspectAccount(listing)}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-300"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-900" /> Inspect
                  </button>

                  {onOpenNegotiationChat && (
                    <button
                      onClick={() => onOpenNegotiationChat(listing)}
                      className="px-2.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer border-b-2 border-orange-800"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-300" /> Chat / Offer
                    </button>
                  )}

                  <button
                    onClick={() => onSelectListingForEscrow(listing)}
                    className="px-2.5 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white font-bold text-xs transition-all shadow-md border-b-2 border-orange-500 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-orange-400" /> Escrow ({formatPrice(listing.price)})
                  </button>
                </div>
              </div>

            </div>
          );
        })}
        </div>
      )}

    </div>
  );
};
