export type EscrowPaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'RELEASED' | 'REFUNDED';

export interface EscrowReleaseDecision {
  canRelease: boolean;
  reason: 'holding' | 'buyer-approved' | 'auto-release' | 'not-paid';
  releaseEligibleAt: string | null;
}

export function determineEscrowReleaseState(
  trade: {
    paymentStatus?: EscrowPaymentStatus;
    currentStep?: number;
    step4FundsReleased?: boolean;
    releaseEligibleAt?: string | null;
  } | null,
  now: Date = new Date(),
): EscrowReleaseDecision {
  if (!trade) {
    return {
      canRelease: false,
      reason: 'not-paid',
      releaseEligibleAt: null,
    };
  }

  if (trade.paymentStatus !== 'SUCCEEDED') {
    return {
      canRelease: false,
      reason: 'not-paid',
      releaseEligibleAt: trade.releaseEligibleAt ?? null,
    };
  }

  if (trade.step4FundsReleased) {
    return {
      canRelease: false,
      reason: 'holding',
      releaseEligibleAt: trade.releaseEligibleAt ?? null,
    };
  }

  const eligibleAt = trade.releaseEligibleAt ? new Date(trade.releaseEligibleAt) : null;
  const buyerApproved = Boolean(trade.currentStep && trade.currentStep >= 4);

  if (buyerApproved) {
    return {
      canRelease: true,
      reason: 'buyer-approved',
      releaseEligibleAt: eligibleAt?.toISOString() ?? null,
    };
  }

  if (eligibleAt && eligibleAt <= now) {
    return {
      canRelease: true,
      reason: 'auto-release',
      releaseEligibleAt: eligibleAt.toISOString(),
    };
  }

  return {
    canRelease: false,
    reason: 'holding',
    releaseEligibleAt: eligibleAt?.toISOString() ?? null,
  };
}
