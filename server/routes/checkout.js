import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

// expects { lineItems: [{price, quantity}], promoId?: string }
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { lineItems, promoId } = req.body || {};
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "Missing lineItems" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      discounts: promoId ? [{ promotion_code: promoId }] : undefined,
      success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/cart`,
      metadata: promoId ? { promo_id: promoId } : undefined
    });

    res.json({ id: session.id, url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
