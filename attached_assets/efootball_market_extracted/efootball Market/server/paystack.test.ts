import test from 'node:test';
import assert from 'node:assert/strict';

test('requires real Paystack credentials instead of using mock fallback', async () => {
  const previousKey = process.env.PAYSTACK_SECRET_KEY;
  delete process.env.PAYSTACK_SECRET_KEY;

  try {
    const { initializePaystackPayment, verifyPaystackTransaction } = await import('./paystack.ts');

    await assert.rejects(() => initializePaystackPayment(1000, 'buyer@example.com', 'ref-123'));
    await assert.rejects(() => verifyPaystackTransaction('ref-123'));
  } finally {
    if (previousKey === undefined) {
      delete process.env.PAYSTACK_SECRET_KEY;
    } else {
      process.env.PAYSTACK_SECRET_KEY = previousKey;
    }
  }
});
