import { AccountListing, EscrowTrade, ScammerRecord, EscrowStep } from '../types';

const API_BASE = '/api';

// ----- Helpers -----

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// ----- Listings -----

export async function fetchListings(filters?: {
  platform?: string;
  region?: string;
  search?: string;
  minEpics?: number;
  maxPrice?: number;
}): Promise<{ total: number; listings: AccountListing[] }> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
  }
  const query = params.toString();
  return request(`/listings${query ? `?${query}` : ''}`);
}

export async function fetchListingById(id: string): Promise<AccountListing> {
  return request(`/listings/${id}`);
}

export async function createListing(data: Partial<AccountListing>): Promise<{ message: string; listing: AccountListing }> {
  return request('/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteListing(id: string): Promise<{ message: string }> {
  return request(`/listings/${id}`, { method: 'DELETE' });
}

// ----- Escrow -----

export async function fetchEscrow(): Promise<{
  trade: EscrowTrade;
  vaultTotal: number;
  userBalance: number;
}> {
  return request('/escrow');
}

export async function initiateEscrow(listingId: string, buyerName: string): Promise<{ message: string; trade: EscrowTrade }> {
  return request('/escrow/initiate', {
    method: 'POST',
    body: JSON.stringify({ listingId, buyerName }),
  });
}

export async function advanceEscrowStep(step: EscrowStep): Promise<{ message: string; trade: EscrowTrade }> {
  return request('/escrow/step', {
    method: 'POST',
    body: JSON.stringify({ step }),
  });
}

export async function disputeEscrow(reason: string, details: string): Promise<{ message: string; trade: EscrowTrade }> {
  return request('/escrow/dispute', {
    method: 'POST',
    body: JSON.stringify({ reason, details }),
  });
}

export async function resetEscrow(): Promise<{ message: string; trade: EscrowTrade }> {
  return request('/escrow/reset', { method: 'POST' });
}

// ----- Blacklist -----

export async function fetchBlacklist(): Promise<{ total: number; blacklist: ScammerRecord[] }> {
  return request('/blacklist');
}

export async function reportScammer(data: {
  konamiId?: string;
  discordHandle?: string;
  whatsappNumber?: string;
  gameName: string;
  scamType: string;
  stolenAmount?: number;
  evidenceSummary?: string;
}): Promise<{ message: string; record: ScammerRecord }> {
  return request('/blacklist/report', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ----- Auth -----

export async function sendOtp(email: string): Promise<{
  success: boolean;
  message: string;
  email: string;
  otpCode: string;
  previewUrl: string | null;
  smtpConfigured: boolean;
}> {
  return request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, code: string): Promise<{
  verified: boolean;
  message: string;
  email: string;
}> {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function registerSeller(username: string, email: string, password: string): Promise<{
  message: string;
  token: string;
  user: any;
}> {
  const res = await request<{ message: string; token: string; user: any }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  if (res.token) {
    localStorage.setItem('efootball_token', res.token);
  }
  return res;
}

export async function loginSeller(email: string, password: string): Promise<{
  message: string;
  token: string;
  user: any;
}> {
  const res = await request<{ message: string; token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.token) {
    localStorage.setItem('efootball_token', res.token);
  }
  return res;
}

export async function fetchCurrentUser(): Promise<any> {
  const token = localStorage.getItem('efootball_token');
  if (!token) return null;
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ----- Paystack Payments -----

export async function createPaymentIntent(amount: number, tradeId: string, buyerEmail?: string): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  escrowHeldUntil: string;
  policy: string;
}> {
  return request('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ amount, tradeId, buyerEmail }),
  });
}

export async function verifyPayment(reference: string): Promise<{
  success: boolean;
  verification: any;
  escrowHeldUntil: string;
}> {
  return request(`/payments/verify/${encodeURIComponent(reference)}`);
}

// ----- Scanner -----

export async function verifyAccount(query: string): Promise<any> {
  return request('/scanner/verify', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// ----- AI -----

export async function analyzeSquad(data: {
  squadTitle?: string;
  epicCount: number;
  showtimeCount: number;
  coinBalance: number;
  maxDivision: string;
  featuredPlayers: any[];
}): Promise<any> {
  return request('/ai/analyze-squad', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ----- Health -----

export async function healthCheck(): Promise<{
  status: string;
  service: string;
  timestamp: string;
  vaultTotal: number;
  activeListings: number;
}> {
  return request('/health');
}
