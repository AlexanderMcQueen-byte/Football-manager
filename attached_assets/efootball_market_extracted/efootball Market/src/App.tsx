import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Marketplace } from './components/Marketplace';
import { EscrowWorkflow } from './components/EscrowWorkflow';
import { AccountScanner } from './components/AccountScanner';
import { NewsAndMeta } from './components/NewsAndMeta';
import { AntiScamDashboard } from './components/AntiScamDashboard';
import { SafetyVpnGuide } from './components/SafetyVpnGuide';
import { AccountInspectModal } from './components/AccountInspectModal';
import { NewListingModal } from './components/NewListingModal';
import { NegotiationChatModal } from './components/NegotiationChatModal';
import { RateSellerModal } from './components/RateSellerModal';
import { SellerAuthModal } from './components/SellerAuthModal';
import { SellerPortalModal } from './components/SellerPortalModal';
import { FootballPitch3D } from './components/FootballPitch3D';

import { AccountListing, EscrowTrade, ScammerRecord, EscrowStep, SellerAccount, SellerReview } from './types';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import * as api from './services/api';

export default function App() {
  const navigate = useNavigate();
  // Platform State from Zustand
  const { 
    listings, setListings, addListing,
    escrowTrade, setEscrowTrade,
    blacklist, setBlacklist, addBlacklistReport,
    userBalance, setUserBalance,
    vaultTotal, setVaultTotal,
    sellerAccount, setSellerAccount,
    sellerReviews, setSellerReviews, addSellerReview 
  } = useStore();

  // Modals & Banners (Keep local state for UI toggles)
  const [inspectedListing, setInspectedListing] = useState<AccountListing | null>(null);
  const [chatListing, setChatListing] = useState<AccountListing | null>(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState<boolean>(false);
  const [chatUserRole, setChatUserRole] = useState<'buyer' | 'seller'>('buyer');
  const [chatUserName, setChatUserName] = useState<string>('You (Buyer)');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showNewListingModal, setShowNewListingModal] = useState<boolean>(false);
  const [publishedSuccessToast, setPublishedSuccessToast] = useState<string | null>(null);

  // Seller Auth & Portal UI State
  const [showSellerAuthModal, setShowSellerAuthModal] = useState<boolean>(false);
  const [showSellerPortalModal, setShowSellerPortalModal] = useState<boolean>(false);

  // Buyer Rating Seller Modal
  const [showRateSellerModal, setShowRateSellerModal] = useState<boolean>(false);
  const [targetRatingSellerName, setTargetRatingSellerName] = useState<string>('Chebukati_eFootball');

  // Fetch initial data from Express backend
  useEffect(() => {
    api.fetchListings()
      .then(data => {
        if (data?.listings?.length > 0) setListings(data.listings);
      })
      .catch(err => console.log('Using local fallback for listings:', err));

    api.fetchEscrow()
      .then(data => {
        if (data?.trade) setEscrowTrade(data.trade);
        if (data?.vaultTotal) setVaultTotal(data.vaultTotal);
        if (data?.userBalance) setUserBalance(data.userBalance);
      })
      .catch(err => console.log('Using local fallback for escrow:', err));

    api.fetchBlacklist()
      .then(data => {
        if (data?.blacklist?.length > 0) setBlacklist(data.blacklist);
      })
      .catch(err => console.log('Using local fallback for blacklist:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) return;

    api.verifyPayment(reference)
      .then(data => {
        if (data?.success && escrowTrade) {
          setEscrowTrade({
            ...escrowTrade,
            paymentStatus: 'SUCCEEDED',
            paymentStatusMessage: 'Paystack payment confirmed and held in escrow',
            releaseEligibleAt: data.escrowHeldUntil || escrowTrade.releaseEligibleAt,
          });
        }
      })
      .catch(err => console.log('Unable to confirm Paystack payment:', err));
  }, [escrowTrade]);

  // Handlers
  const handleSelectListingForEscrow = (listing: AccountListing) => {
    const tradeId = `ESCROW-TRADE-${Math.floor(100000 + Math.random() * 900000)}`;

    api.createPaymentIntent(listing.price, tradeId, 'buyer@example.com')
      .then(payment => {
        return api.initiateEscrow(listing.id, 'You (Buyer)').then(data => {
          if (data?.trade) {
            const tradeWithPayment = {
              ...data.trade,
              paymentStatus: 'PENDING' as const,
              paymentIntentId: payment.paymentIntentId,
              paymentStatusMessage: 'Paystack checkout initialized. Complete the payment to secure funds in escrow.',
              releaseEligibleAt: payment.escrowHeldUntil,
            };
            setEscrowTrade(tradeWithPayment);
            setVaultTotal(prev => prev + listing.price);
          }
        });
      })
      .catch(() => {
        const newTrade: EscrowTrade = {
          tradeId,
          listing,
          buyerName: 'You (Buyer)',
          sellerName: listing.sellerName,
          amount: listing.price,
          platformFee: Math.max(10, Math.round(listing.price * 0.04)),
          currentStep: 1,
          step1FundsSecured: true,
          step2CredentialsHandoff: false,
          step3VerificationPassed: false,
          step4FundsReleased: false,
          konamiId: listing.konamiIdMasked,
          konamiPasswordMasked: '••••••••••••',
          konamiPasswordFull: `eFootball_${listing.epicCount}Epics#2026!`,
          oneTimePasscode: '819-304',
          credentialsRevealed: false,
          credentialsExpireInSeconds: 86400,
          vaultStatus: 'LOCKED_IN_VAULT',
          vaultLockedAt: `${new Date().toISOString().split('T')[0]} 12:00 UTC`,
          protectionPeriodRemainingSeconds: 259200,
          isDisputed: false,
          verificationReport: {
            epicsMatch: true,
            coinsMatch: true,
            gpMatch: true,
            divisionMatch: true,
            noActiveBans: true,
          },
          vpnRecommendedRegion: listing.region === 'Asia/Japan' ? 'Japan (Tokyo)' : 'Europe (Frankfurt)',
          vpnConnected: true,
          paymentStatus: 'PENDING',
          paymentIntentId: tradeId,
          paymentStatusMessage: 'Paystack checkout pending. Complete payment to secure funds in escrow.',
          releaseEligibleAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        setEscrowTrade(newTrade);
        setVaultTotal(prev => prev + listing.price);
      });

    navigate('/escrow');
  };

  const handleUpdateEscrowStep = (newStep: EscrowStep) => {
    api.advanceEscrowStep(newStep)
      .then(data => {
        if (data?.trade) setEscrowTrade(data.trade);
      })
      .catch(() => {
        setEscrowTrade(prev => {
          const updated = { ...prev, currentStep: newStep };
          if (newStep >= 1) updated.step1FundsSecured = true;
          if (newStep >= 2) updated.step2CredentialsHandoff = true;
          if (newStep >= 3) updated.step3VerificationPassed = true;
          if (newStep === 4) {
            updated.step4FundsReleased = true;
            updated.vaultStatus = 'RELEASED_TO_SELLER';
          }
          return updated;
        });
      });
  };

  const handleToggleRevealCredentials = () => {
    setEscrowTrade(prev => ({
      ...prev,
      credentialsRevealed: !prev.credentialsRevealed
    }));
  };

  const handleTriggerDispute = (reason: string, details: string) => {
    api.disputeEscrow(reason, details)
      .then(data => {
        if (data?.trade) setEscrowTrade(data.trade);
      })
      .catch(() => {
        setEscrowTrade(prev => ({
          ...prev,
          isDisputed: true,
          disputeReason: reason,
          disputeDetails: details,
          vaultStatus: 'FROZEN_FOR_DISPUTE'
        }));
      });
  };

  const handleResolveDispute = () => {
    api.resetEscrow()
      .then(data => {
        if (data?.trade) setEscrowTrade(data.trade);
      })
      .catch(() => {
        setEscrowTrade(prev => ({
          ...prev,
          isDisputed: false,
          vaultStatus: 'LOCKED_IN_VAULT'
        }));
      });
  };

  const handleAddReport = (newReport: Omit<ScammerRecord, 'id' | 'dateReported' | 'verifiedByModerator' | 'status'>) => {
    api.reportScammer(newReport)
      .then(data => {
        if (data?.record) setBlacklist(prev => [data.record, ...prev]);
      })
      .catch(() => {
        const record: ScammerRecord = {
          ...newReport,
          id: `scam-${Date.now().toString().slice(-4)}`,
          dateReported: new Date().toISOString().split('T')[0],
          verifiedByModerator: true,
          status: 'PERMANENTLY_BLACKLISTED'
        };
        setBlacklist(prev => [record, ...prev]);
      });
  };

  const handleCreateListing = (newListing: AccountListing) => {
    api.createListing(newListing)
      .then(data => {
        if (data?.listing) {
          setListings(prev => {
            const filtered = prev.filter(l => l.id !== data.listing.id);
            return [data.listing, ...filtered];
          });
        }
      })
      .catch(() => {
        setListings(prev => [newListing, ...prev]);
      });

    navigate('/');
    setPublishedSuccessToast(newListing.title);
  };

  const handleOpenNegotiationChat = (listing: AccountListing, role: 'buyer' | 'seller' = 'buyer') => {
    setChatListing(listing);
    setChatUserRole(role);
    setChatUserName(role === 'seller' ? 'You (Seller)' : 'You (Buyer)');
    setShowNegotiationModal(true);
  };

  const handleStartEscrowWithAgreedPrice = (listing: AccountListing, agreedPrice: number) => {
    const negotiatedListing: AccountListing = {
      ...listing,
      price: agreedPrice,
    };
    handleSelectListingForEscrow(negotiatedListing);
  };

  const handleOpenSellerPortalClick = () => {
    if (!sellerAccount) {
      setShowSellerAuthModal(true);
    } else {
      setShowSellerPortalModal(true);
    }
  };

  const handleOpenRateSellerModal = (sellerName: string) => {
    setTargetRatingSellerName(sellerName);
    setShowRateSellerModal(true);
  };

  const handleSubmitSellerReview = (newReview: SellerReview) => {
    setSellerReviews(prev => [newReview, ...prev]);

    // Update seller badge rating in listings
    setListings(prev =>
      prev.map(l => {
        if (l.sellerName === newReview.sellerName) {
          const currentCount = l.sellerBadge.totalReviews || 10;
          const currentAvg = l.sellerBadge.averageRating || 5.0;
          const newTotal = currentCount + 1;
          const newAvg = parseFloat(((currentAvg * currentCount + newReview.rating) / newTotal).toFixed(1));
          return {
            ...l,
            sellerBadge: {
              ...l.sellerBadge,
              averageRating: newAvg,
              totalReviews: newTotal,
            },
          };
        }
        return l;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950/20 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      
      {/* 3D Interactive Football Pitch Background */}
      <FootballPitch3D />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          activeEscrowStep={escrowTrade?.currentStep || 0}
          vaultTotal={vaultTotal}
          userBalance={userBalance}
          onOpenReportModal={() => setShowReportModal(true)}
          onOpenNewListingModal={() => setShowNewListingModal(true)}
          onOpenSellerPortal={handleOpenSellerPortalClick}
          currentSellerEmail={sellerAccount?.email}
        />

        {/* Main App Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <Routes>
          {/* Marketplace View */}
          <Route path="/" element={
            <Marketplace
              listings={listings}
              onSelectListingForEscrow={handleSelectListingForEscrow}
              onInspectAccount={(listing) => setInspectedListing(listing)}
              onOpenNegotiationChat={handleOpenNegotiationChat}
              onRateSeller={handleOpenRateSellerModal}
              publishedToast={publishedSuccessToast}
              onDismissPublishedToast={() => setPublishedSuccessToast(null)}
            />
          } />

          {/* Live Escrow Workflow View */}
          <Route path="/escrow" element={
            escrowTrade ? (
              <EscrowWorkflow
                escrowTrade={escrowTrade}
                onUpdateEscrowStep={handleUpdateEscrowStep}
                onToggleRevealCredentials={handleToggleRevealCredentials}
                onTriggerDispute={handleTriggerDispute}
                onResolveDispute={handleResolveDispute}
                onOpenAccountScanner={() => navigate('/scanner')}
              />
            ) : (
              <div className="p-12 text-center text-slate-500 font-bold">No active escrow trade.</div>
            )
          } />

          {/* Account Snapshot Scanner View */}
          <Route path="/scanner" element={
            <AccountScanner
              listings={listings}
              onPublishListingToMarketplace={handleCreateListing}
            />
          } />

          {/* News & Patch Notes v5.2.0 + Meta Tier List */}
          <Route path="/meta" element={<NewsAndMeta />} />

          {/* Anti-Scam Blacklist View */}
          <Route path="/scammers" element={
            <AntiScamDashboard
              blacklist={blacklist}
              onAddReport={handleAddReport}
              showReportModal={showReportModal}
              setShowReportModal={setShowReportModal}
            />
          } />

          {/* Safety & VPN Guide View */}
          <Route path="/safety" element={<SafetyVpnGuide />} />
        </Routes>
      </main>

      {/* Modals */}
      <AccountInspectModal
        listing={inspectedListing}
        onClose={() => setInspectedListing(null)}
        onStartEscrow={handleSelectListingForEscrow}
        onOpenNegotiationChat={handleOpenNegotiationChat}
      />

      <NewListingModal
        isOpen={showNewListingModal}
        onClose={() => setShowNewListingModal(false)}
        onCreateListing={handleCreateListing}
      />

      <NegotiationChatModal
        listing={chatListing}
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        onStartEscrowWithAgreedPrice={handleStartEscrowWithAgreedPrice}
        currentUserRole={chatUserRole}
        currentUserName={chatUserName}
      />

      {/* Verified Seller Registration & Auth Modal */}
      <SellerAuthModal
        isOpen={showSellerAuthModal}
        onClose={() => setShowSellerAuthModal(false)}
        onAuthenticatedSeller={(account) => {
          setSellerAccount(account);
          setShowSellerAuthModal(false);
          setShowSellerPortalModal(true);
        }}
      />

      {/* Verified Seller Portal & Inbox Modal */}
      <SellerPortalModal
        isOpen={showSellerPortalModal}
        onClose={() => setShowSellerPortalModal(false)}
        sellerAccount={sellerAccount}
        sellerListings={listings.filter(l => l.sellerName === sellerAccount?.username || l.sellerName === 'Chebukati_eFootball')}
        reviews={sellerReviews.filter(r => r.sellerName === sellerAccount?.username || r.sellerName === 'Chebukati_eFootball')}
        onOpenNewListing={() => {
          setShowSellerPortalModal(false);
          setShowNewListingModal(true);
        }}
        onLogoutSeller={() => {
          setSellerAccount(null);
          setShowSellerPortalModal(false);
        }}
      />

      {/* Buyer Rating Seller Modal */}
      <RateSellerModal
        isOpen={showRateSellerModal}
        onClose={() => setShowRateSellerModal(false)}
        sellerName={targetRatingSellerName}
        onSubmitReview={handleSubmitSellerReview}
      />

      {/* Footer - Deep Navy Background */}
      <footer className="border-t border-slate-200 bg-indigo-950 text-slate-300 py-6 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <strong className="text-white">eFootball™ Escrow Portal</strong> • Secure P2P Konami ID Exchange Platform
          </p>
          <p className="text-slate-400">
            eFootball™ is a registered trademark of Konami Digital Entertainment. All escrow transfers protected.
          </p>
        </div>
      </footer>
      </div>

    </div>
  );
}
