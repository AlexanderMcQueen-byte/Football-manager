import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Marketplace listings endpoint — returns all account listings
// TODO: implement fetching from DB when marketplace schema is created
router.get("/marketplace/listings", async (_req, res) => {
  try {
    // For now, return an empty array to stop frontend polling errors
    // When DB schema is ready, fetch actual listings from marketplace_listings table
    res.json([]);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn('marketplace listings failed', { err: err?.message || err });
    res.json([]);
  }
});

// Marketplace scanner — verify account legitimacy and extract data
// TODO: implement real Konami account verification when API available
router.post("/scanner/verify", async (req, res) => {
  try {
    const { query } = req.body ?? {};
    if (!query) {
      res.status(400).json({ error: "Konami username/email required" });
      return;
    }
    
    // Return mock data for now — in production, call Konami API
    // or use account scanner service to verify account legitimacy
    res.json({
      isLegit: true,
      trustScore: 95,
      squad: {
        title: `Account: ${query}`,
        ownerId: Math.random().toString(36).substring(2, 9),
        epicCount: 28,
        showtimeCount: 8,
        gpBalance: 1850000,
        coinBalance: 4200,
        eFootballPoints: 15000,
        maxDivision: "Division 1",
        squadRating: 3185,
        squadFormation: "4-2-1-3 Quick Counter",
        mainManager: "L. Roman (88 Quick Counter)",
        featuredPlayers: [],
        konamiIdMasked: `${query.substring(0, 3)}***@konami.com`,
      },
      snapshotHash: `KONAMI-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn('scanner verification failed', { err: err?.message || err });
    res.status(500).json({ error: "Failed to verify account" });
  }
});

// Payment intent creation — initialize payment through Paystack or Stripe
// TODO: integrate with payment provider when ready
router.post("/payments/create-intent", async (req, res) => {
  try {
    const { amount, tradeId, buyerEmail } = req.body ?? {};
    if (!amount || !tradeId || !buyerEmail) {
      res.status(400).json({ error: "amount, tradeId, and buyerEmail are required" });
      return;
    }
    
    // Return mock payment data for now
    // In production, call Paystack/Stripe API to create payment intent
    res.json({
      paymentIntentId: `PI_${Math.random().toString(36).substring(2, 9)}`,
      data: {
        reference: `REF_${Math.random().toString(36).substring(2, 9)}`,
        authorization_url: `https://checkout.paystack.com/mock?ref=REF_${Math.random().toString(36).substring(2, 9)}`,
        amount_in_kobo: amount * 100,
      },
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn('payment intent creation failed', { err: err?.message || err });
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// TODO: implement these endpoints when marketplace schema is ready
// router.post("/marketplace/listings", requireCreator, async (req, res) => { ... })
// router.patch("/marketplace/listings/:id", requireCreator, async (req, res) => { ... })
// router.delete("/marketplace/listings/:id", requireCreator, async (req, res) => { ... })
// router.post("/marketplace/listings/:id/negotiate", async (req, res) => { ... })

export default router;
