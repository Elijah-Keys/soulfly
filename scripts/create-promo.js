import "dotenv/config";   // add this lin
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

async function run() {
  const coupon = await stripe.coupons.create({
    percent_off: 10,
    duration: "once",
  });

  const promo = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: "SOUL10",
    max_redemptions: 100,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30
  });

  console.log({ coupon: coupon.id, promotion_code: promo.id, code: promo.code });
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
