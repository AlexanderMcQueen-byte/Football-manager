export interface PlayerCard {
  id: string;
  name: string;
  rating: number;
  position: string;
  cardType: 'Epic' | 'Showtime' | 'Big Time' | 'Highlight' | 'Standard';
  club: string;
  image?: string;
  boostedRating?: number;
}

export interface SellerBadge {
  phoneVerified: boolean;
  tradesCount: number;
  idVerified: boolean;
  disputeFreeRecord: boolean;
  trustScore: number; // 0-100
  averageRating?: number; // e.g., 4.9
  totalReviews?: number; // e.g., 28
}

export interface SellerReview {
  id: string;
  sellerName: string;
  buyerName: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  date: string;
  listingTitle?: string;
  verifiedPurchase: boolean;
}

export interface SellerAccount {
  id: string;
  email: string;
  username: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  trustScore: number;
  tradesCount: number;
  avatarUrl?: string;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

export interface AccountListing {
  id: string;
  sellerUserId?: string;
  title: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerBadge: SellerBadge;
  price: number;
  platform: 'Mobile (Android/iOS)' | 'PC (Steam)' | 'PlayStation 5' | 'Xbox';
  region: 'Europe' | 'Asia/Japan' | 'South America' | 'North America' | 'Middle East';
  
  // Public eFootball Identifiers (Konami Username / IGN / Owner ID)
  ownerUsername: string; // e.g., "@ProGamer_Alex_eFB"
  ownerId: string; // e.g., "892-410-032"
  
  epicCount: number;
  showtimeCount: number;
  gpBalance: number;
  coinBalance: number;
  eFootballPoints: number;
  maxDivision: string; // e.g., "Division 1 (Rank #142)"
  squadRating: number; // e.g., 3180
  squadFormation?: string; // e.g., "4-1-2-3 Counter Attack"
  mainManager: string; // e.g., "L. Roman (88 Quick Counter)"
  featuredPlayers: PlayerCard[];
  startingXI?: PlayerCard[];
  snapshotVerified: boolean;
  snapshotHash?: string;
  
  // Vault Isolation
  konamiIdMasked: string; // e.g., "kon****88@gmail.com"
  vaultPrivacyStatus?: 'PROTECTED_IN_VAULT' | 'PENDING_DEPOSIT';
  squadImages?: string[]; // Uploaded squad screenshot images (Starting XI, Epics, Managers)
  accountRatingScore?: number; // Calculated decimal rating out of 10 (e.g. 8.7 / 10, 5.5 / 10)
  listingIntent?: 'sell' | 'exchange'; // Intent for listing: Sell or Exchange
  createdDate: string;
  description: string;
}

export type EscrowStep = 1 | 2 | 3 | 4;

export interface EscrowTrade {
  tradeId: string;
  listing: AccountListing;
  buyerName: string;
  sellerName: string;
  amount: number;
  platformFee: number;
  currentStep: EscrowStep;
  step1FundsSecured: boolean;
  step2CredentialsHandoff: boolean;
  step3VerificationPassed: boolean;
  step4FundsReleased: boolean;
  
  // Credentials payload
  konamiId: string;
  konamiPasswordMasked: string;
  konamiPasswordFull: string;
  oneTimePasscode?: string;
  credentialsRevealed: boolean;
  credentialsExpireInSeconds: number;

  // Real-time Seller Credential & OTP Submission
  sellerSubmittedEmail?: string;
  sellerSubmittedPassword?: string;
  sellerCredentialsSubmitted?: boolean;
  otpStatus?: 'NONE' | 'REQUESTED' | 'PROVIDED';
  otpRequestedAt?: string;
  submittedOtpCode?: string;

  // Vault details
  vaultStatus: 'LOCKED_IN_VAULT' | 'FROZEN_FOR_DISPUTE' | 'RELEASED_TO_SELLER' | 'REFUNDED_TO_BUYER';
  vaultLockedAt: string;

  // Payment & release policy
  paymentStatus?: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'RELEASED' | 'REFUNDED';
  paymentIntentId?: string;
  paymentStatusMessage?: string;
  releaseEligibleAt?: string;
  
  // Protection & Cooldown
  protectionPeriodRemainingSeconds: number; // e.g., 72 hours countdown
  isDisputed: boolean;
  disputeReason?: string;
  disputeDetails?: string;
  disputeProofSubmitted?: boolean;
  
  // Verification Checks
  verificationReport: {
    epicsMatch: boolean;
    coinsMatch: boolean;
    gpMatch: boolean;
    divisionMatch: boolean;
    noActiveBans: boolean;
  };
  
  vpnRecommendedRegion: string;
  vpnConnected: boolean;
}

export interface ScammerRecord {
  id: string;
  konamiId: string;
  discordHandle: string;
  whatsappNumber?: string;
  gameName: string;
  scamType: 'Account Recovery Theft' | 'Fake Middleman' | 'Chargeback Scam' | 'Fake Payment Proof';
  stolenAmount: number;
  dateReported: string;
  verifiedByModerator: boolean;
  evidenceSummary: string;
  status: 'PERMANENTLY_BLACKLISTED' | 'UNDER_INVESTIGATION';
}

export interface PatchNote {
  version: string;
  releaseDate: string;
  title: string;
  highlights: string[];
  metaChanges: {
    title: string;
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'NEUTRAL';
  }[];
  featuredEpics: string[];
}

export interface MetaTierItem {
  id: string;
  name: string;
  category: 'Epics' | 'Showtimes' | 'Managers' | 'Formations';
  tier: 'SS+' | 'SS' | 'S' | 'A';
  roleOrStyle: string;
  pros: string[];
  keyAttributes: string;
  badgeColor: string;
}
