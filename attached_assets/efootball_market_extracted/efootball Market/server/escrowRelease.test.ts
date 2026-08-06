import test from 'node:test';
import assert from 'node:assert/strict';
import { determineEscrowReleaseState } from './escrowRelease.js';

test('marks escrow as eligible for release once buyer approval is given', () => {
  const trade = {
    paymentStatus: 'SUCCEEDED',
    currentStep: 4,
    step4FundsReleased: false,
    releaseEligibleAt: new Date(Date.now() + 60_000).toISOString(),
  } as any;

  const state = determineEscrowReleaseState(trade, new Date());
  assert.equal(state.canRelease, true);
  assert.equal(state.reason, 'buyer-approved');
});

test('auto-releases after the 24 hour hold window expires', () => {
  const trade = {
    paymentStatus: 'SUCCEEDED',
    currentStep: 2,
    step4FundsReleased: false,
    releaseEligibleAt: new Date(Date.now() - 60_000).toISOString(),
  } as any;

  const state = determineEscrowReleaseState(trade, new Date());
  assert.equal(state.canRelease, true);
  assert.equal(state.reason, 'auto-release');
});

test('keeps escrow locked before approval or the 24 hour window', () => {
  const trade = {
    paymentStatus: 'SUCCEEDED',
    currentStep: 2,
    step4FundsReleased: false,
    releaseEligibleAt: new Date(Date.now() + 60_000).toISOString(),
  } as any;

  const state = determineEscrowReleaseState(trade, new Date());
  assert.equal(state.canRelease, false);
  assert.equal(state.reason, 'holding');
});
