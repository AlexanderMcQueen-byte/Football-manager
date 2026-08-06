---
name: Paystack billing
description: Payment verification, plan expiry, and production webhook configuration for plan upgrades.
---

Paystack is the approved payment provider for paid Football Manager plans. The secret key stays server-side; checkout is initialized on the API, verified against the transaction reference, amount, currency, and success status, and webhook signatures use the raw request body.

**Why:** Plan access must never be granted from a client callback or an unverified request, and monthly/yearly access needs an explicit expiry path.

**How to apply:** Keep plan activation behind Paystack verification. Configure the Paystack dashboard webhook to the published app's `/api/users/paystack/webhook` endpoint. Lifetime plans have no expiry; monthly and yearly plans expire and downgrade to free on the next account/protected-route check.