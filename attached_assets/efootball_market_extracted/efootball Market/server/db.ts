import { PrismaClient } from '@prisma/client';
import { AccountListing, EscrowTrade, ScammerRecord, PatchNote, MetaTierItem } from '../src/types';

export const prisma = new PrismaClient();

export interface DatabaseSchema {
  listings: AccountListing[];
  escrowTrade: EscrowTrade | null;
  blacklist: ScammerRecord[];
  patchNotes: PatchNote[];
  metaTierItems: MetaTierItem[];
  vaultTotal: number;
  userBalance: number;
}

let cachedVaultTotal = 0;
let cachedUserBalance = 0;

// Helper serializers
function mapPrismaListingToType(l: any): AccountListing {
  return {
    id: l.id,
    title: l.title,
    sellerName: l.sellerName,
    sellerAvatar: l.sellerAvatar || undefined,
    sellerBadge: {
      phoneVerified: true,
      tradesCount: 15,
      idVerified: true,
      disputeFreeRecord: true,
      trustScore: 98,
      averageRating: 4.9,
      totalReviews: 28,
    },
    price: l.price,
    platform: l.platform as any,
    region: l.region as any,
    ownerUsername: l.ownerUsername,
    ownerId: l.ownerId,
    epicCount: l.epicCount,
    showtimeCount: l.showtimeCount,
    gpBalance: l.gpBalance,
    coinBalance: l.coinBalance,
    eFootballPoints: l.eFootballPoints,
    maxDivision: l.maxDivision,
    squadRating: l.squadRating,
    squadFormation: l.squadFormation || undefined,
    mainManager: l.mainManager,
    featuredPlayers: JSON.parse(l.featuredPlayersJson || '[]'),
    startingXI: JSON.parse(l.featuredPlayersJson || '[]'),
    snapshotVerified: l.snapshotVerified,
    snapshotHash: l.snapshotHash || undefined,
    konamiIdMasked: l.konamiIdMasked,
    vaultPrivacyStatus: l.vaultPrivacyStatus as any,
    squadImages: JSON.parse(l.squadImages || '[]'),
    accountRatingScore: l.accountRatingScore || undefined,
    listingIntent: l.listingIntent as any,
    createdDate: l.createdDate,
    description: l.description,
  };
}

function mapPrismaTradeToType(t: any, listing: AccountListing): EscrowTrade {
  return {
    tradeId: t.tradeId,
    listing,
    buyerName: t.buyerName,
    sellerName: t.sellerName,
    amount: t.amount,
    platformFee: t.platformFee,
    currentStep: t.currentStep as any,
    step1FundsSecured: t.step1FundsSecured,
    step2CredentialsHandoff: t.step2CredentialsHandoff,
    step3VerificationPassed: t.step3VerificationPassed,
    step4FundsReleased: t.step4FundsReleased,
    konamiId: t.konamiId,
    konamiPasswordMasked: t.konamiPasswordMasked,
    konamiPasswordFull: t.konamiPasswordFull,
    oneTimePasscode: t.oneTimePasscode || undefined,
    credentialsRevealed: t.credentialsRevealed,
    credentialsExpireInSeconds: t.credentialsExpireInSeconds,
    vaultStatus: t.vaultStatus as any,
    vaultLockedAt: t.vaultLockedAt,
    protectionPeriodRemainingSeconds: t.protectionPeriodRemainingSeconds,
    isDisputed: t.isDisputed,
    disputeReason: t.disputeReason || undefined,
    disputeDetails: t.disputeDetails || undefined,
    disputeProofSubmitted: t.disputeProofSubmitted,
    verificationReport: JSON.parse(t.verificationReportJson || '{}'),
    vpnRecommendedRegion: t.vpnRecommendedRegion,
    vpnConnected: t.vpnConnected,
    paymentStatus: t.paymentStatus as any,
    paymentIntentId: t.paymentIntentId || undefined,
    paymentStatusMessage: t.paymentStatusMessage || undefined,
    releaseEligibleAt: t.releaseEligibleAt || undefined,
  };
}

// In-memory cache for synchronous backwards-compatible access
let cachedListings: AccountListing[] = [];
let cachedEscrowTrade: EscrowTrade | null = null;
let cachedBlacklist: ScammerRecord[] = [];

// Background hydration from SQLite
async function refreshCacheFromDb() {
  try {
    const rawListings = await prisma.listing.findMany({ orderBy: { createdAt: 'desc' } });
    if (rawListings.length > 0) {
      cachedListings = rawListings.map(mapPrismaListingToType);
    }

    const rawTrade = await prisma.escrowTrade.findFirst({
      include: { listing: true },
      orderBy: { createdAt: 'desc' },
    });
    cachedEscrowTrade = rawTrade
      ? mapPrismaTradeToType(rawTrade, mapPrismaListingToType(rawTrade.listing))
      : null;

    const rawBlacklist = await prisma.scammerRecord.findMany({ orderBy: { createdAt: 'desc' } });
    if (rawBlacklist.length > 0) {
      cachedBlacklist = rawBlacklist.map(b => ({
        id: b.id,
        konamiId: b.konamiId,
        discordHandle: b.discordHandle,
        whatsappNumber: b.whatsappNumber || undefined,
        gameName: b.gameName,
        scamType: b.scamType as any,
        stolenAmount: b.stolenAmount,
        dateReported: b.dateReported,
        verifiedByModerator: b.verifiedByModerator,
        evidenceSummary: b.evidenceSummary,
        status: b.status as any,
      }));
    }
  } catch (err) {
    console.error('Error hydrating cache from Prisma SQLite:', err);
  }
}

// Hydrate on module load
refreshCacheFromDb();

export const db = {
  get: (): DatabaseSchema => ({
    listings: cachedListings,
    escrowTrade: cachedEscrowTrade,
    blacklist: cachedBlacklist,
    patchNotes: [],
    metaTierItems: [],
    vaultTotal: cachedVaultTotal,
    userBalance: cachedUserBalance,
  }),

  // Listings
  getListings: () => cachedListings,
  getListingById: (id: string) => cachedListings.find(l => l.id === id),
  addListing: (listing: AccountListing) => {
    cachedListings.unshift(listing);
    // Async persist to SQLite
    prisma.listing.create({
      data: {
        id: listing.id,
        title: listing.title,
        sellerName: listing.sellerName,
        sellerAvatar: listing.sellerAvatar,
        price: listing.price,
        platform: listing.platform,
        region: listing.region,
        ownerUsername: listing.ownerUsername,
        ownerId: listing.ownerId,
        epicCount: listing.epicCount,
        showtimeCount: listing.showtimeCount,
        gpBalance: listing.gpBalance,
        coinBalance: listing.coinBalance,
        eFootballPoints: listing.eFootballPoints,
        maxDivision: listing.maxDivision,
        squadRating: listing.squadRating,
        squadFormation: listing.squadFormation,
        mainManager: listing.mainManager,
        snapshotVerified: listing.snapshotVerified,
        snapshotHash: listing.snapshotHash,
        konamiIdMasked: listing.konamiIdMasked,
        vaultPrivacyStatus: listing.vaultPrivacyStatus || 'PROTECTED_IN_VAULT',
        squadImages: JSON.stringify(listing.squadImages || []),
        featuredPlayersJson: JSON.stringify(listing.featuredPlayers || []),
        accountRatingScore: listing.accountRatingScore,
        listingIntent: listing.listingIntent || 'sell',
        createdDate: listing.createdDate || new Date().toISOString().split('T')[0],
        description: listing.description || '',
      },
    }).catch(e => console.error('Prisma addListing error:', e));
    return listing;
  },
  deleteListing: (id: string) => {
    cachedListings = cachedListings.filter(l => l.id !== id);
    prisma.listing.delete({ where: { id } }).catch(e => console.error('Prisma deleteListing error:', e));
  },

  // Escrow Trade
  getEscrowTrade: () => cachedEscrowTrade,
  updateEscrowTrade: (partial: Partial<EscrowTrade>) => {
    if (!cachedEscrowTrade) return null;
    cachedEscrowTrade = { ...cachedEscrowTrade, ...partial };
    prisma.escrowTrade.updateMany({
      data: {
        currentStep: cachedEscrowTrade.currentStep,
        step1FundsSecured: cachedEscrowTrade.step1FundsSecured,
        step2CredentialsHandoff: cachedEscrowTrade.step2CredentialsHandoff,
        step3VerificationPassed: cachedEscrowTrade.step3VerificationPassed,
        step4FundsReleased: cachedEscrowTrade.step4FundsReleased,
        credentialsRevealed: cachedEscrowTrade.credentialsRevealed,
        vaultStatus: cachedEscrowTrade.vaultStatus,
        isDisputed: cachedEscrowTrade.isDisputed,
        disputeReason: cachedEscrowTrade.disputeReason,
        disputeDetails: cachedEscrowTrade.disputeDetails,
        paymentStatus: cachedEscrowTrade.paymentStatus as string | undefined,
        paymentIntentId: cachedEscrowTrade.paymentIntentId as string | undefined,
        paymentStatusMessage: cachedEscrowTrade.paymentStatusMessage as string | undefined,
        releaseEligibleAt: cachedEscrowTrade.releaseEligibleAt as string | undefined,
      },
    }).catch(e => console.error('Prisma updateEscrow error:', e));
    return cachedEscrowTrade;
  },
  setEscrowTrade: (trade: EscrowTrade | null) => {
    cachedEscrowTrade = trade;
    return cachedEscrowTrade;
  },

  // Blacklist
  getBlacklist: () => cachedBlacklist,
  addBlacklistReport: (record: ScammerRecord) => {
    cachedBlacklist.unshift(record);
    prisma.scammerRecord.create({
      data: {
        id: record.id,
        konamiId: record.konamiId || 'N/A',
        discordHandle: record.discordHandle || 'N/A',
        whatsappNumber: record.whatsappNumber || 'N/A',
        gameName: record.gameName,
        scamType: record.scamType,
        stolenAmount: record.stolenAmount || 0,
        dateReported: record.dateReported,
        verifiedByModerator: record.verifiedByModerator ?? true,
        evidenceSummary: record.evidenceSummary,
        status: record.status || 'PERMANENTLY_BLACKLISTED',
      },
    }).catch(e => console.error('Prisma addBlacklist error:', e));
    return record;
  },

  // Stats & Vault
  getStats: () => ({
    listingsCount: cachedListings.length,
    escrowActive: Boolean(cachedEscrowTrade && cachedEscrowTrade.currentStep < 4),
    vaultTotal: cachedVaultTotal,
    userBalance: cachedUserBalance,
    scammersCount: cachedBlacklist.length,
  }),
  updateUserBalance: (delta: number) => {
    cachedUserBalance += delta;
    return cachedUserBalance;
  },
  updateVaultTotal: (delta: number) => {
    cachedVaultTotal += delta;
    return cachedVaultTotal;
  },
};
