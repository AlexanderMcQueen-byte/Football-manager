import { create } from 'zustand';
import { 
  AccountListing, 
  EscrowTrade, 
  ScammerRecord, 
  SellerAccount, 
  SellerReview 
} from '@/types/marketplace';

interface AppState {
  // Marketplace Listings
  listings: AccountListing[];
  setListings: (updater: AccountListing[] | ((prev: AccountListing[]) => AccountListing[])) => void;
  addListing: (listing: AccountListing) => void;

  // Escrow & Vault
  escrowTrade: EscrowTrade | null;
  setEscrowTrade: (updater: EscrowTrade | null | ((prev: EscrowTrade | null) => EscrowTrade | null)) => void;
  vaultTotal: number;
  setVaultTotal: (updater: number | ((prev: number) => number)) => void;
  userBalance: number;
  setUserBalance: (updater: number | ((prev: number) => number)) => void;

  // Anti-Scam Blacklist
  blacklist: ScammerRecord[];
  setBlacklist: (updater: ScammerRecord[] | ((prev: ScammerRecord[]) => ScammerRecord[])) => void;
  addBlacklistReport: (record: ScammerRecord) => void;

  // Seller Auth
  sellerAccount: SellerAccount | null;
  setSellerAccount: (account: SellerAccount | null) => void;
  sellerReviews: SellerReview[];
  setSellerReviews: (updater: SellerReview[] | ((prev: SellerReview[]) => SellerReview[])) => void;
  addSellerReview: (review: SellerReview) => void;
}

export const useStore = create<AppState>((set) => ({
  // Marketplace Listings
  listings: [],
  setListings: (updater) => set((state) => ({ 
    listings: typeof updater === 'function' ? updater(state.listings) : updater 
  })),
  addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),

  // Escrow & Vault
  escrowTrade: null,
  setEscrowTrade: (updater) => set((state) => ({ 
    escrowTrade: typeof updater === 'function' ? updater(state.escrowTrade) : updater 
  })),
  vaultTotal: 0,
  setVaultTotal: (updater) => set((state) => ({ 
    vaultTotal: typeof updater === 'function' ? updater(state.vaultTotal) : updater 
  })),
  userBalance: 0,
  setUserBalance: (updater) => set((state) => ({ 
    userBalance: typeof updater === 'function' ? updater(state.userBalance) : updater 
  })),

  // Anti-Scam Blacklist
  blacklist: [],
  setBlacklist: (updater) => set((state) => ({ 
    blacklist: typeof updater === 'function' ? updater(state.blacklist) : updater 
  })),
  addBlacklistReport: (record) => set((state) => ({ blacklist: [record, ...state.blacklist] })),

  // Seller Auth
  sellerAccount: null,
  setSellerAccount: (account) => set({ sellerAccount: account }),
  sellerReviews: [],
  setSellerReviews: (updater) => set((state) => ({ 
    sellerReviews: typeof updater === 'function' ? updater(state.sellerReviews) : updater 
  })),
  addSellerReview: (review) => set((state) => ({ sellerReviews: [review, ...state.sellerReviews] })),
}));
