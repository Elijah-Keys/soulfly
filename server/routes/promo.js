import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ ok: false, error: "Missing code" });

    const list = await stripe.promotionCodes.list({ code: code.trim(), active: true, limit: 1 });
    const promo = list.data[0];
    if (!promo) return res.status(404).json({ ok: false, error: "Invalid or expired code" });

    const c = promo.coupon;
    res.json({
      ok: true,
      promoId: promo.id,
      coupon: {
        id: c.id,
        percent_off: c.percent_off || null,
        amount_off: c.amount_off || null,
        currency: c.currency || "usd",
        duration: c.duration
      }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
