import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  ShoppingCart, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/marketStore";
import { AccountListing, EscrowTrade } from "@/types/marketplace";

// Import copied components
import { Marketplace } from "@/components/marketplace/Marketplace";
import { EscrowWorkflow } from "@/components/marketplace/EscrowWorkflow";
import { AntiScamDashboard } from "@/components/marketplace/AntiScamDashboard";
import { AccountScanner } from "@/components/marketplace/AccountScanner";
import { NewsAndMeta } from "@/components/marketplace/NewsAndMeta";
import { SafetyVpnGuide } from "@/components/marketplace/SafetyVpnGuide";

// Modals
import { AccountInspectModal } from "@/components/marketplace/AccountInspectModal";
import { NegotiationChatModal } from "@/components/marketplace/NegotiationChatModal";
import { NewListingModal } from "@/components/marketplace/NewListingModal";
import { RateSellerModal } from "@/components/marketplace/RateSellerModal";
import { SellerAuthModal } from "@/components/marketplace/SellerAuthModal";
import { SellerPortalModal } from "@/components/marketplace/SellerPortalModal";

// Seed Data
const MOCK_LISTINGS: AccountListing[] = [
  {
    id: 'LIST-8801',
    title: 'God Squad 110+ Epics (Messi, Ronaldinho, Romario) - Div 1',
    sellerName: 'eFBMaster99',
    sellerAvatar: '',
    sellerBadge: {
      phoneVerified: true,
      tradesCount: 42,
      idVerified: true,
      disputeFreeRecord: true,
      trustScore: 99,
      averageRating: 4.9,
      totalReviews: 28,
    },
    price: 350,
    platform: 'Mobile (Android/iOS)',
    region: 'Europe',
    ownerUsername: '@GodSquad_eFB',
    ownerId: '109-842-100',
    epicCount: 115,
    showtimeCount: 40,
    gpBalance: 12500000,
    coinBalance: 5400,
    eFootballPoints: 45000,
    maxDivision: 'Division 1 (Rank #204)',
    squadRating: 3210,
    squadFormation: '4-2-1-3 Quick Counter',
    mainManager: 'L. Roman (88 QC)',
    featuredPlayers: [
      { id: '1', name: 'L. Messi', rating: 105, position: 'RWF', cardType: 'Epic', club: 'Barcelona' },
      { id: '2', name: 'Ronaldinho', rating: 104, position: 'AMF', cardType: 'Epic', club: 'AC Milan' },
      { id: '3', name: 'P. Vieira', rating: 103, position: 'DMF', cardType: 'Epic', club: 'Arsenal' }
    ],
    snapshotVerified: true,
    konamiIdMasked: 'mas***99@gmail.com',
    vaultPrivacyStatus: 'PROTECTED_IN_VAULT',
    squadImages: ['/images/marketplace/pitch1.jpg', '/images/marketplace/pitch1.jpg'],
    accountRatingScore: 9.6,
    listingIntent: 'sell',
    createdDate: new Date().toISOString(),
    description: 'Selling my main account since day 1. All top tier epics included.',
  },
  {
    id: 'LIST-4402',
    title: 'Great Starter Account - 25 Epics (Cruyff, Neymar) 12K Coins',
    sellerName: 'SafeTrader_Alex',
    sellerBadge: {
      phoneVerified: true,
      tradesCount: 15,
      idVerified: false,
      disputeFreeRecord: true,
      trustScore: 92,
      averageRating: 4.5,
      totalReviews: 10,
    },
    price: 85,
    platform: 'PlayStation 5',
    region: 'North America',
    ownerUsername: '@Alex_PS5_eFB',
    ownerId: '422-109-883',
    epicCount: 25,
    showtimeCount: 5,
    gpBalance: 4000000,
    coinBalance: 12500,
    eFootballPoints: 12000,
    maxDivision: 'Division 3',
    squadRating: 3080,
    mainManager: 'G. Zeitzler (87 LBC)',
    featuredPlayers: [
      { id: '4', name: 'J. Cruyff', rating: 103, position: 'SS', cardType: 'Epic', club: 'Barcelona' },
      { id: '5', name: 'Neymar Jr', rating: 102, position: 'LWF', cardType: 'Epic', club: 'Santos' }
    ],
    snapshotVerified: true,
    konamiIdMasked: 'ale***77@hotmail.com',
    listingIntent: 'sell',
    createdDate: new Date().toISOString(),
    description: 'Perfect starter with lots of coins saved for upcoming packs.',
  }
];

export default function MarketplacePage() {
  const [location, setLocation] = useLocation();
  const store = useStore();

  // Initialize data
  useEffect(() => {
    if (store.listings.length === 0) {
      store.setListings(MOCK_LISTINGS);
    }
  }, []);

  // Modals state
  const [inspectListing, setInspectListing] = useState<AccountListing | null>(null);
  const [chatListing, setChatListing] = useState<AccountListing | null>(null);
  const [rateSellerName, setRateSellerName] = useState<string | null>(null);
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  const [isSellerAuthModalOpen, setIsSellerAuthModalOpen] = useState(false);
  const [isSellerPortalOpen, setIsSellerPortalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [publishedToast, setPublishedToast] = useState<string | null>(null);

  // Helper actions
  const handleSelectListingForEscrow = (listing: AccountListing) => {
    store.setEscrowTrade({
      tradeId: `TRD-${Math.floor(Math.random() * 10000)}`,
      listing,
      buyerName: 'Current User', // Mock
      sellerName: listing.sellerName,
      amount: listing.price,
      platformFee: Math.round(listing.price * 0.05),
      currentStep: 1,
      step1FundsSecured: false,
      step2CredentialsHandoff: false,
      step3VerificationPassed: false,
      step4FundsReleased: false,
      konamiId: listing.konamiIdMasked.replace('***', 'real'), // mock
      konamiPasswordMasked: '********',
      konamiPasswordFull: 'efb_secure_pass_2024',
      credentialsRevealed: false,
      credentialsExpireInSeconds: 3600,
      vaultStatus: 'LOCKED_IN_VAULT',
      vaultLockedAt: new Date().toISOString(),
      protectionPeriodRemainingSeconds: 72 * 3600,
      isDisputed: false,
      verificationReport: {
        epicsMatch: true,
        coinsMatch: true,
        gpMatch: true,
        divisionMatch: true,
        noActiveBans: true,
      },
      vpnRecommendedRegion: listing.region,
      vpnConnected: false,
    });
    setLocation('/marketplace/escrow');
  };

  const handlePublishListing = (newListing: AccountListing) => {
    store.addListing(newListing);
    setPublishedToast(newListing.title);
    setTimeout(() => setPublishedToast(null), 5000);
  };

  const navItems = [
    { path: '/marketplace', label: 'Listings', icon: ShoppingCart },
    { path: '/marketplace/escrow', label: 'Escrow', icon: ShieldCheck },
    { path: '/marketplace/scanner', label: 'Scanner', icon: Search },
    { path: '/marketplace/meta', label: 'Meta', icon: TrendingUp },
    { path: '/marketplace/scammers', label: 'Scam Alerts', icon: ShieldAlert },
    { path: '/marketplace/safety', label: 'VPN Guide', icon: AlertTriangle },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Mini Top Bar */}
      <div className="bg-indigo-950 border border-orange-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="font-black text-lg leading-tight tracking-tight">eFootball Account Marketplace</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Secure Vault</span>
              <span>•</span>
              <span>100% Guaranteed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {store.sellerAccount ? (
            <button
              onClick={() => setIsSellerPortalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 text-xs font-bold transition-colors border border-slate-200"
            >
              Seller Portal
            </button>
          ) : (
            <button
              onClick={() => setIsSellerAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-100 text-xs font-bold transition-colors border border-indigo-700/50"
            >
              Become a Seller
            </button>
          )}

          <button
            onClick={() => setIsNewListingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Sell Account
          </button>
        </div>
      </div>

      {/* Horizontal Nav */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-white/5 scrollbar-hide">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location === item.path || (location.startsWith(item.path) && item.path !== '/marketplace');
          // Fix for root marketplace path matching
          const isExactRoot = location === '/marketplace' && item.path === '/marketplace';
          const isMatched = isActive || isExactRoot;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all border-b-2",
                isMatched
                  ? "bg-white/[0.04] text-orange-500 border-orange-500"
                  : "text-slate-400 border-transparent hover:bg-white/[0.02] hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-slate-50/5 rounded-2xl p-0 md:p-2">
        <Switch>
          <Route path="/marketplace/escrow">
            {store.escrowTrade ? (
              <EscrowWorkflow 
                escrowTrade={store.escrowTrade}
                onUpdateEscrowStep={(newStep) => {
                  store.setEscrowTrade((current) => current ? {
                    ...current,
                    currentStep: newStep,
                    step1FundsSecured: newStep >= 1 ? true : current.step1FundsSecured,
                    step2CredentialsHandoff: newStep >= 2 ? true : current.step2CredentialsHandoff,
                    step3VerificationPassed: newStep >= 3 ? true : current.step3VerificationPassed,
                    step4FundsReleased: newStep >= 4 ? true : current.step4FundsReleased,
                  } : current);
                }}
                onToggleRevealCredentials={() => {
                  store.setEscrowTrade((current) => current ? {
                    ...current,
                    credentialsRevealed: !current.credentialsRevealed,
                  } : current);
                }}
                onTriggerDispute={(reason, details) => {
                  store.setEscrowTrade((current) => current ? {
                    ...current,
                    isDisputed: true,
                    disputeReason: reason,
                    disputeDetails: details,
                    vaultStatus: 'FROZEN_FOR_DISPUTE',
                  } : current);
                }}
                onResolveDispute={() => {
                  store.setEscrowTrade((current) => current ? {
                    ...current,
                    isDisputed: false,
                    disputeProofSubmitted: false,
                    vaultStatus: 'LOCKED_IN_VAULT',
                  } : current);
                }}
                onOpenAccountScanner={() => setLocation('/marketplace/scanner')}
              />
            ) : (
              <div className="text-center py-12 space-y-4">
                <ShieldCheck className="w-16 h-16 text-indigo-800 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Active Escrow</h3>
                <p className="text-slate-400 text-sm">Select an account from the marketplace to begin.</p>
                <button
                  onClick={() => setLocation('/marketplace')}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm"
                >
                  Browse Market
                </button>
              </div>
            )}
          </Route>
          
          <Route path="/marketplace/scanner">
            <AccountScanner 
              listings={store.listings} 
              onPublishListingToMarketplace={handlePublishListing} 
            />
          </Route>
          <Route path="/marketplace/meta" component={NewsAndMeta} />
          <Route path="/marketplace/scammers">
            <AntiScamDashboard 
              blacklist={store.blacklist}
              onAddReport={(r) => store.addBlacklistReport({ ...r, id: `BL-${Date.now()}`, dateReported: new Date().toISOString(), verifiedByModerator: false, status: 'UNDER_INVESTIGATION' })}
              showReportModal={showReportModal}
              setShowReportModal={setShowReportModal}
            />
          </Route>
          <Route path="/marketplace/safety" component={SafetyVpnGuide} />

          <Route path="/marketplace">
            <Marketplace
              listings={store.listings}
              onSelectListingForEscrow={handleSelectListingForEscrow}
              onInspectAccount={setInspectListing}
              onOpenNegotiationChat={setChatListing}
              onRateSeller={setRateSellerName}
              publishedToast={publishedToast}
              onDismissPublishedToast={() => setPublishedToast(null)}
            />
          </Route>
        </Switch>
      </div>

      {/* Modals */}
      {inspectListing && (
        <AccountInspectModal
          listing={inspectListing}
          onClose={() => setInspectListing(null)}
          onStartEscrow={() => {
            setInspectListing(null);
            handleSelectListingForEscrow(inspectListing);
          }}
          onOpenNegotiationChat={() => {
            setInspectListing(null);
            setChatListing(inspectListing);
          }}
        />
      )}

      {chatListing && (
        <NegotiationChatModal
          listing={chatListing}
          isOpen={Boolean(chatListing)}
          onClose={() => setChatListing(null)}
          onStartEscrowWithAgreedPrice={(listing, agreedPrice) => {
            const updated = { ...listing, price: agreedPrice };
            setChatListing(null);
            handleSelectListingForEscrow(updated);
          }}
        />
      )}

      {isNewListingModalOpen && (
        <NewListingModal
          isOpen={isNewListingModalOpen}
          onClose={() => setIsNewListingModalOpen(false)}
          onCreateListing={(newListing) => {
            handlePublishListing(newListing);
            setIsNewListingModalOpen(false);
          }}
        />
      )}

      {rateSellerName && (
        <RateSellerModal
          isOpen={Boolean(rateSellerName)}
          sellerName={rateSellerName}
          onClose={() => setRateSellerName(null)}
          onSubmitReview={(review) => {
            store.addSellerReview(review);
            setRateSellerName(null);
            // Optionally show toast
          }}
        />
      )}

      {isSellerAuthModalOpen && (
        <SellerAuthModal
          isOpen={isSellerAuthModalOpen}
          onClose={() => setIsSellerAuthModalOpen(false)}
          onSellerAuthenticated={(acc) => {
            store.setSellerAccount(acc);
            setIsSellerAuthModalOpen(false);
            setIsSellerPortalOpen(true);
          }}
        />
      )}

      {isSellerPortalOpen && store.sellerAccount && (
        <SellerPortalModal
          isOpen={isSellerPortalOpen}
          sellerAccount={store.sellerAccount}
          listings={store.listings}
          reviews={store.sellerReviews}
          onClose={() => setIsSellerPortalOpen(false)}
          onOpenNewListingModal={() => {
            setIsSellerPortalOpen(false);
            setIsNewListingModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
