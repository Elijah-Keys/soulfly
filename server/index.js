  import "dotenv/config";
  import express from "express";
  import Stripe from "stripe";
  import cors from "cors";
  import bodyParser from "body-parser";
  import multer from "multer";
  import fs from "fs/promises";
  import path from "path";
import promoRoutes from "../routes/promo.js";
import checkoutRoutes from "../routes/checkout.js";

  console.log(
    "Shippo token mode:",
    process.env.SHIPPO_API_TOKEN?.startsWith("shippo_test_") ? "TEST" : "LIVE"
  );
  // --- Telegram notifier (free) ---
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
  const TELEGRAM_RECIPIENTS = (process.env.TELEGRAM_CHAT_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  async function notifyAdmins(message) {
    if (!TELEGRAM_TOKEN || TELEGRAM_RECIPIENTS.length === 0) return;
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await Promise.allSettled(
      TELEGRAM_RECIPIENTS.map(id =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: id, text: message })
        })
      )
    );
  }

  const app = express();
  app.use(cors());
  app.get("/health", (_req, res) => res.send("ok"));

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

  /* -------------------------------------------
    Shippo helpers (Node 18+ for global fetch)
  ------------------------------------------- */
  async function createShippoShipment(to_address, from_address, parcel) {
    const resp = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        "Authorization": `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        address_to: to_address,
        address_from: from_address,
        parcels: [{
          length: parcel.length,
          width: parcel.width,
          height: parcel.height,
          distance_unit: "in",
          weight: parcel.weight,
          mass_unit: "oz"
        }],
        async: false
      })
    });
    if (!resp.ok) throw new Error(`Shippo shipments error (${resp.status})`);
    return resp.json();
  }
  // Replace your existing buyShippoLowestRate with this:
  async function buyShippoLowestRate(shipment) {
    const all = Array.isArray(shipment.rates) ? shipment.rates : [];

    // Prefer USPS first (case-insensitive match)
    const usps = all.filter(r => (r.carrier || "").toUpperCase().includes("USPS"));
    const pool = usps.length ? usps : all;

    if (!pool.length) throw new Error("No rates returned by Shippo");

    // pick the cheapest from the chosen pool
    pool.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    const rate = pool[0];

    const trxResp = await fetch("https://api.goshippo.com/transactions/", {
      method: "POST",
      headers: {
        "Authorization": `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rate: rate.object_id, label_file_type: "PDF" })
    });
    if (!trxResp.ok) throw new Error(`Shippo transaction error (${trxResp.status})`);

    let trx = await trxResp.json();

    if (trx.status === "QUEUED" || trx.status === "WAITING") {
      const id = trx.object_id;
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const chk = await fetch(`https://api.goshippo.com/transactions/${id}`, {
          headers: { "Authorization": `ShippoToken ${process.env.SHIPPO_API_TOKEN}` }
        });
        if (!chk.ok) throw new Error(`Shippo check error (${chk.status})`);
        trx = await chk.json();
        if (trx.status === "SUCCESS") break;
        if (trx.status === "ERROR") {
          const msg = (trx.messages?.[0]?.text) || "Shippo error";
          throw new Error(msg);
        }
      }
    }

    if (trx.status !== "SUCCESS") throw new Error(`Shippo still processing (status: ${trx.status})`);

    return {
      label_url: trx.label_url,
      tracking_number: trx.tracking_number,
      carrier: trx.rate?.carrier || rate.carrier || null,
      service: trx.rate?.service || rate.service || null,
    };
  }
  function pickQuoteRates(shipment) {
    const rates = Array.isArray(shipment.rates) ? shipment.rates : [];
    if (!rates.length) return { cheapest: null, expedited: null };

    // Prefer USPS for "standard" if present
    const usps = rates.filter(r => (r.provider || "").toUpperCase().includes("USPS"));
    const pool = usps.length ? usps : rates;

    const cheapest = [...pool].sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0] || null;

    // "expedited" = any rate with estimated_days <= 2 (if none, fall back to next-cheapest overall)
    const twoDay = rates
      .filter(r => Number(r.estimated_days) > 0 && Number(r.estimated_days) <= 2)
      .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0] || null;

    const expedited = twoDay || (
      rates.length > 1
        ? [...rates].sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[1]
        : null
    );

    return { cheapest, expedited };
  }



function normAddr(a = {}) {
  return {
    name: String(a.name || "").trim(),
    line1: String(a.line1 || a.street1 || "").trim(),
    line2: String(a.line2 || a.street2 || "").trim(),
    city:  String(a.city  || "").trim(),
    state: String(a.state || "").trim(),
    zip:   String(a.zip   || a.postal_code || "").trim(),
    country: String(a.country || "US").toUpperCase(),
  };
}
function sameAddr(a, b) {
  const x = normAddr(a), y = normAddr(b);
  return Object.keys(x).every(k => x[k] === y[k]);
}

  /* 1) Webhook first, raw body (no JSON parser here) */
  /* 1) Webhook first, raw body (no JSON parser here) */
  app.post(
    "/api/stripe-webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const sig = req.headers["stripe-signature"];
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
  // Re-fetch the session to ensure all fields (and PI) are fresh


    if (event.type === "checkout.session.completed") {
    // Always re-fetch so shipping_details + PI are fresh
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ["payment_intent", "customer_details"],
    });


          // 1) line items (optional, nice to store)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price']   // <— makes li.price an object with .id
  });
  const priceIdOf = (li) => (typeof li.price === 'string' ? li.price : (li.price?.id || ''));
  // Get sizes back from session metadata
  let metaItems = [];
  try {
    metaItems = JSON.parse(session.metadata?.order_items || "[]");
  } catch {}
  const sizeByPrice = Object.fromEntries(
    (Array.isArray(metaItems) ? metaItems : [])
      .filter(x => x && x.priceId)
      .map(x => [x.priceId, x.size || ""])
  );

          // 2) addresses from Stripe session
      // 2) shipping & billing from Stripe session (use shipping_details!)
  // 2) addresses from Stripe session
  /// 2) Resolve shipping address carefully: prefer session.shipping_details,
  // then customer_details.address, then payment_intent.shipping.
  const cd = session.customer_details || {};
  let to_address = {
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: cd.phone || "",
    email: cd.email || "",
  };

  // Prefer Checkout Session shipping_details (what user sees on Checkout)
  if (session.shipping_details?.address?.line1) {
    const s = session.shipping_details;
    to_address = {
      name: s.name || cd.name || "",
      street1: s.address?.line1 || "",
      street2: s.address?.line2 || "",
      city: s.address?.city || "",
      state: s.address?.state || "",
      zip: s.address?.postal_code || "",
      country: s.address?.country || "US",
      phone: cd.phone || "",
      email: cd.email || "",
    };
  } else if (cd.address?.line1) {
    // Fallback to customer_details.address (sometimes populated)
    const a = cd.address;
    to_address = {
      name: cd.name || "",
      street1: a.line1 || "",
      street2: a.line2 || "",
      city: a.city || "",
      state: a.state || "",
      zip: a.postal_code || "",
      country: a.country || "US",
      phone: cd.phone || "",
      email: cd.email || "",
    };
  } else {
    // Final fallback: PaymentIntent.shipping (covers some Link/Wallet flows)
    let pi = session.payment_intent;
    if (typeof pi === "string") {
      try {
        pi = await stripe.paymentIntents.retrieve(pi);
      } catch (e) {
        console.warn("PI retrieve failed:", e.message);
      }
    }
    if (pi?.shipping?.address?.line1) {
      const sh = pi.shipping;
      to_address = {
        name: sh.name || cd.name || "",
        street1: sh.address?.line1 || "",
        street2: sh.address?.line2 || "",
        city: sh.address?.city || "",
        state: sh.address?.state || "",
        zip: sh.address?.postal_code || "",
        country: sh.address?.country || "US",
        phone: cd.phone || "",
        email: cd.email || "",
      };
    }
  }

  // Debug what we actually got back from Stripe
  console.log("DBG shipping_details:", session.shipping_details);
  console.log("DBG customer_details.address:", cd.address);
  console.log("DBG resolved to_address:", to_address);

  // Fallback to the cart's locked address if Stripe didn't give us a full one
try {
  if ((!to_address.street1 || !to_address.city || !to_address.state || !to_address.zip) 
      && session.metadata?.ship_lock) {
    const locked = JSON.parse(session.metadata.ship_lock);
    to_address = {
      name: locked.name || cd.name || "",
      street1: locked.line1 || "",
      street2: locked.line2 || "",
      city: locked.city || "",
      state: locked.state || "",
      zip: locked.postal_code || locked.zip || "",
      country: locked.country || "US",
      phone: cd.phone || "",
      email: cd.email || "",
    };
    console.log("DBG using ship_lock fallback for to_address:", to_address);
  }
} catch (e) {
  console.warn("ship_lock parse failed:", e?.message || e);
}

try {
  if (session.customer && to_address.street1) {
    const custId = typeof session.customer === "string" ? session.customer : session.customer.id;
    await stripe.customers.update(custId, {
      name: to_address.name || undefined,
      address: {
        line1: to_address.street1 || undefined,
        line2: to_address.street2 || undefined,
        city: to_address.city || undefined,
        state: to_address.state || undefined,
        postal_code: to_address.zip || undefined,
        country: to_address.country || undefined,
      },
      shipping: {
        name: to_address.name || undefined,
        phone: cd.phone || undefined,
        address: {
          line1: to_address.street1 || undefined,
          line2: to_address.street2 || undefined,
          city: to_address.city || undefined,
          state: to_address.state || undefined,
          postal_code: to_address.zip || undefined,
          country: to_address.country || undefined,
        }
      }
    });
    console.log("Customer address saved to Stripe:", custId);
  }
} catch (e) {
  console.warn("Failed to save address to customer:", e?.message || e);
}


// Was the address changed on Checkout compared to what the cart sent?
let shipLock = null;
try { shipLock = JSON.parse(session.metadata?.ship_lock || ""); } catch {}
const addressChanged = shipLock && !sameAddr(shipLock, {
  name: to_address.name,
  line1: to_address.street1,
  line2: to_address.street2,
  city: to_address.city,
  state: to_address.state,
  zip: to_address.zip,
  country: to_address.country,
});

if (addressChanged) {
  console.warn("⚠️ Checkout address differs from cart address — holding fulfillment.");
  // Optional: notify admins immediately
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_IDS) {
    const lockTxt = shipLock
      ? `${shipLock.line1}, ${shipLock.city} ${shipLock.state} ${shipLock.postal_code || shipLock.zip}`
      : "—";
    const newTxt  = `${to_address.street1}, ${to_address.city} ${to_address.state} ${to_address.zip}`;
    notifyAdmins(`⚠️ Address changed on Checkout
• Session: ${session.id}
• Cart: ${lockTxt}
• Checkout: ${newTxt}
(No label purchased; order on hold)`).catch(()=>{});
  }
}

          const from_address = {
            name: process.env.SHIP_FROM_NAME || "",
            street1: process.env.SHIP_FROM_STREET1 || "",
            street2: process.env.SHIP_FROM_STREET2 || "",
            city: process.env.SHIP_FROM_CITY || "",
            state: process.env.SHIP_FROM_STATE || "",
            zip: process.env.SHIP_FROM_ZIP || "",
            country: process.env.SHIP_FROM_COUNTRY || "US",
            phone: process.env.SHIP_FROM_PHONE || "",
            email: process.env.SHIP_FROM_EMAIL || "",
          };

          // 3) default parcel
          const parcel = {
            weight: Number(process.env.DEFAULT_PARCEL_OZ || 16),
            length: Number(process.env.DEFAULT_PARCEL_L || 10),
            width:  Number(process.env.DEFAULT_PARCEL_W || 8),
            height: Number(process.env.DEFAULT_PARCEL_H || 2),
          };

  let label_url = "";
  let tracking_number = "";
  let carrier = null;
  let service = null;
  let lastShipment = null;

  const hasShippo = !!process.env.SHIPPO_API_TOKEN;
  const hasToAddress = !!to_address.street1; // require at least line1
  const hasFromAddress =
    !!process.env.SHIP_FROM_NAME &&
    !!process.env.SHIP_FROM_STREET1 &&
    !!process.env.SHIP_FROM_CITY &&
    !!process.env.SHIP_FROM_STATE &&
    !!process.env.SHIP_FROM_ZIP;
    console.log("Label gating:", {
  hasShippo,
  hasToAddress,
  hasFromAddress,
  addressChanged
});

if (hasShippo && hasToAddress && hasFromAddress) {
    try {
      lastShipment = await createShippoShipment(to_address, from_address, parcel);

    console.log(
    "Shippo rates:",
    Array.isArray(lastShipment.rates)
      ? lastShipment.rates.map(r => `${r.provider} ${r.servicelevel?.name || ""} $${r.amount}`)
      : lastShipment
  );


      const bought = await buyShippoLowestRate(lastShipment);
      label_url = bought.label_url;
      tracking_number = bought.tracking_number;
      carrier = bought.carrier;
      service = bought.service;
    } catch (e) {
      console.warn("Shippo label step failed:", e.message);
      if (lastShipment?.rates) {
        console.log(
          "Rates returned:",
          lastShipment.rates.map(r => `${r.carrier} ${r.service} $${r.amount}`)
        );
      }
    }
  } else {
    console.log("Skipping Shippo. hasShippo:", hasShippo, "hasToAddress:", hasToAddress, "hasFromAddress:", hasFromAddress);
  }




          // 5) Save order to data/orders.json (this will create the file if missing)
          const orders = await readOrders();
          orders.push({
            id: session.id,
              hold: addressChanged ? true : false,
  hold_reason: addressChanged ? "ADDRESS_CHANGED" : "",
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            email: cd.email || "",
            name: cd.name || "",
            address: to_address,
            shipping_rate: session.shipping_cost?.shipping_rate || null,
            shipping_amount: session.shipping_cost?.amount_total || 0,
      items: (lineItems.data || []).map((li) => {
    const priceId = priceIdOf(li);
    const productId = (typeof li.price === 'string' ? '' : (li.price?.product || ''));
    return {
      description: li.description,
      quantity: li.quantity,
      priceId,
      productId,
      size: sizeByPrice[priceId] || ""
    };
  }),


                  label_url,
            tracking_code: tracking_number,
            carrier,
            service,
            createdAt: Date.now(),
          });
          await writeOrders(orders);

        console.log("✔️ Order stored:", session.id, "Label:", label_url, "Tracking:", tracking_number);

try {
  const itemsForInv = (lineItems.data || []).map((li) => {
    const prc = priceIdOf(li); // Stripe price id
    return {
      priceId: prc,                  // primary join key
      id: localIdByPrice[prc] || "", // local product id as fallback
      size: sizeByPrice[prc] || "",
      quantity: li.quantity || 1,
    };
  });

  await updateInventoryFromOrder(itemsForInv);
  console.log("✔️ Inventory updated for order", session.id);
} catch (e) {
  console.warn("Inventory update failed:", e.message);
}

      // ---- SEND TELEGRAM ORDER ALERT ----
  // (Runs only if env vars are present. Remove the next if() if you want to always try.)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_IDS) {
    try {
      const total = (session.amount_total ?? 0) / 100;
  const itemsTxt =
    (lineItems.data ?? [])
      .map(li => {
        const pid = priceIdOf(li);
        const sz = sizeByPrice[pid] || "";
        return `${li.quantity}× ${li.description}${sz ? ` [${sz}]` : ""}`;
      })
      .join(", ") || "—";

// after you built: lineItems, priceIdOf(li), sizeByPrice
await updateInventoryFromOrder(
  (lineItems.data || []).map((li) => {
    const pid = priceIdOf(li); // Stripe price id
    return {
      priceId: pid,                           // <-- use priceId to find local product
      size: sizeByPrice[pid] || "",           // size from session metadata
      quantity: li.quantity || 1,             // how many to subtract
    };
  })
);

      // Admin dashboard link (works locally + in prod if you set SERVER_ORIGIN)
      const adminUrl =
        `${process.env.SERVER_ORIGIN || "http://10.251.117.14:3001"}` +
        `/admin/orders?key=${encodeURIComponent(process.env.ADMIN_KEY || "")}`;

      const parts = [
        "🧾 New order",
        `• ID: ${session.id}`,
        `• Name: ${cd.name || cd.email || "Unknown"}`,
        `• Total: $${total.toFixed(2)}`,
        `• Items: ${itemsTxt}`,
        `• Tracking: ${tracking_number || "—"}`,
        label_url ? `• Label: ${label_url}` : null,
        `• Orders: ${adminUrl}`
      ].filter(Boolean);

      const msg = parts.join("\n");
      await notifyAdmins(msg);
      console.log("Telegram: order notification sent");
    } catch (e) {
      console.warn("Telegram notify failed:", e.message);
    }
  }
        }

      res.send("ok");
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

// ---- Inventory helpers ----
// ---- Inventory helpers ----
// ---- Inventory helpers ----
async function updateInventoryFromOrder(items = []) {
  if (!Array.isArray(items) || items.length === 0) return;

  const products = await readProducts(); // data/products.json
  const byId    = Object.fromEntries(products.map(p => [String(p.id), p]));
  const byPrice = Object.fromEntries(products.map(p => [String(p.priceId), p]));

  for (const it of items) {
    const qty  = Math.max(1, Number(it.quantity) || 1);
    const size = String(it.size || "");

    // Prefer local id, then Stripe priceId
    const prod =
      byId[String(it.id || "")] ||
      byPrice[String(it.priceId || "")] ||
      null;

    if (!prod) {
      console.warn("INV: no product match for", it);
      continue;
    }

    prod.inventory = prod.inventory || {};
    if (size) {
      const cur = Number(prod.inventory[size] ?? 0);
      prod.inventory[size] = Math.max(0, cur - qty);
      console.log(
        `INV: ${prod.id} size ${size} ${cur} -> ${prod.inventory[size]} (−${qty})`
      );
    }

    const anyLeft = Object.values(prod.inventory).some(n => Number(n) > 0);
    prod.inStock = anyLeft;
  }

  await writeProducts(Object.values(byId)); // same array objects updated
}




  /* 2) JSON parser for normal routes */
  app.use(express.json());
  
  app.use(express.static(path.join(process.cwd(), "public")));
  app.get("/api/test-telegram", async (_req, res) => {
    try {
      await notifyAdmins("🔔 Test: this is a Telegram test from Soulfly server.");
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });
app.use("/promo", promoRoutes);
  /* Example products map (can be unused) */
  const PRODUCTS = {
    "soulfly-tshirt": { priceId: "price_1SHyHA7pABZIRK49bSm8anoy" }
  };

  /* Utility */
  function slugify(s) {
    return String(s)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /* Create Stripe Product + default Price (optional admin helper) */
  app.post("/api/listings", async (req, res) => {
    try {
      if (process.env.ADMIN_TOKEN) {
        const auth = req.headers.authorization || "";
        if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
          return res.status(401).json({ error: "unauthorized" });
        }
      }

      const {
        name,
        description = "",
        price,
        currency = "usd",
        imageUrls = [],
        sizes = [],
        inventory = {},
        slug,
        active = true,
      } = req.body || {};

      if (!name) throw new Error("name required");
      if (price == null || isNaN(Number(price))) throw new Error("price required");
      if (!Array.isArray(imageUrls)) throw new Error("imageUrls must be array");

      const unit_amount = Math.round(Number(price) * 100);
      const safeSlug = slug ? slugify(slug) : slugify(name);

      const product = await stripe.products.create({
        name,
        description,
        active,
        images: imageUrls,
        default_price_data: { currency, unit_amount },
        metadata: {
          slug: safeSlug,
          sizes: sizes.join(","),
          inventory: JSON.stringify(inventory),
        },
        expand: ["default_price"],
      });

      res.json({ id: product.id, priceId: product.default_price.id, slug: safeSlug });
    } catch (e) {
      console.error("create listing error", e);
      res.status(400).json({ error: String(e.message || e) });
    }
  });
function hasFullAddress(s = {}) {
  return Boolean(
    s &&
    s.name &&
    s.line1 &&
    s.city &&
    s.state &&
    (s.postal_code || s.zip) &&
    (s.country || "US")
  );
}

  /* Checkout */
  app.post("/api/checkout", async (req, res) => {
    try {
const { items, shipTo, promoId } = req.body || {};
if (!hasFullAddress(shipTo)) {
  return res.status(400).json({ error: "Shipping address required" });
}

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No items in request" });
      }

      // map product id -> priceId (fallback)
      const list = await readProducts();
      const FALLBACK = Object.fromEntries(list.map(p => [p.id, { priceId: p.priceId }]));

      // normalize cart items
      const CLEAN_ITEMS = items.map((i, idx) => {
        const priceId = i.priceId || (i.id && FALLBACK[i.id] && FALLBACK[i.id].priceId);
        if (!priceId) throw new Error(`Missing priceId for item[${idx}]`);
        return {
          id: String(i.id || ""),
          priceId: String(priceId),
          qty: Math.max(1, Number(i.qty) || 1),
          size: String(i.size || "")
        };
      });

      function findProduct(ci, list) {
  return list.find(p => String(p.id) === String(ci.id) || String(p.priceId) === String(ci.priceId));
}

function checkAndClampCart(list, clean) {
  const issues = [];
  const normalized = clean.map(ci => {
    const p = findProduct(ci, list);
    if (!p) {
      issues.push(`Unknown product (${ci.id || ci.priceId})`);
      return { ...ci, qty: 0 };
    }
    const available = Number(p?.inventory?.[ci.size] ?? 0);
    if (available <= 0) {
      issues.push(`${p.name} (${ci.size}) is out of stock`);
      return { ...ci, qty: 0 };
    }
    if (ci.qty > available) {
      issues.push(`${p.name} (${ci.size}) only has ${available} left`);
      return { ...ci, qty: available };
    }
    return ci;
  });

  const nonzero = normalized.filter(x => x.qty > 0);
  return { normalized: nonzero, issues };
}

// after CLEAN_ITEMS:
const { normalized, issues } = checkAndClampCart(list, CLEAN_ITEMS);

if (normalized.length === 0) {
  return res.status(409).json({ error: issues[0] || "Cart items are out of stock" });
}
if (issues.length) {
  // Surface the first problem (e.g., “only 1 left”)
  return res.status(409).json({ error: issues[0] });
}

// use normalized items everywhere below
const line_items = normalized.map(ci => ({ price: ci.priceId, quantity: ci.qty }));

// Save the cart address into metadata so we can detect edits on Checkout
const SHIP_LOCK = {
  name: shipTo.name,
  line1: shipTo.line1,
  line2: shipTo.line2 || "",
  city: shipTo.city,
  state: shipTo.state,
  postal_code: shipTo.postal_code || shipTo.zip,
  country: shipTo.country || "US",
};
const SESSION_META = {
  order_items: JSON.stringify(normalized),
  ship_lock: JSON.stringify(SHIP_LOCK),
};


      // Stripe needs only price + quantity
      const ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

// --- Build ONE shipping option (consistent) ---
let singleShippingOption = null;

if (hasFullAddress(shipTo) && process.env.SHIPPO_API_TOKEN) {
  try {
    const to_address = {
      name: shipTo.name || "",
      street1: shipTo.line1 || "",
      street2: shipTo.line2 || "",
      city: shipTo.city || "",
      state: shipTo.state || "",
      zip: shipTo.postal_code || shipTo.zip || "",
      country: shipTo.country || "US",
      phone: shipTo.phone || "",
      email: shipTo.email || "",
    };
    const from_address = {
      name: process.env.SHIP_FROM_NAME || "",
      street1: process.env.SHIP_FROM_STREET1 || "",
      street2: process.env.SHIP_FROM_STREET2 || "",
      city: process.env.SHIP_FROM_CITY || "",
      state: process.env.SHIP_FROM_STATE || "",
      zip: process.env.SHIP_FROM_ZIP || "",
      country: process.env.SHIP_FROM_COUNTRY || "US",
      phone: process.env.SHIP_FROM_PHONE || "",
      email: process.env.SHIP_FROM_EMAIL || "",
    };
    const parcel = {
      weight: Number(process.env.DEFAULT_PARCEL_OZ || 16),
      length: Number(process.env.DEFAULT_PARCEL_L || 10),
      width:  Number(process.env.DEFAULT_PARCEL_W || 8),
      height: Number(process.env.DEFAULT_PARCEL_H || 2),
    };

    const quote = await createShippoShipment(to_address, from_address, parcel);

    const rates = Array.isArray(quote.rates) ? quote.rates : [];
    const usps = rates.filter(r =>
      ((r.provider || r.carrier || "") + "").toUpperCase().includes("USPS")
    );
    const pool = usps.length ? usps : rates;

    if (pool.length) {
      const chosen = [...pool].sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))[0];
      const cents = Math.round(parseFloat(chosen.amount) * 100);
      singleShippingOption = {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: cents, currency: "usd" },
          // keep label stable so the selector never appears inconsistent
          display_name: "USPS Ground Advantage",
        },
      };
    }
  } catch (e) {
    console.warn("Shippo quote failed (falling back to single flat rate):", e.message);
  }
}

if (!singleShippingOption) {
  // fallback to one flat option
  singleShippingOption = {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 800, currency: "usd" },
      display_name: "USPS Ground Advantage",
    },
  };
}

      // --- Lock address by putting it on the PaymentIntent (so Checkout can't change it) ---


      // --- Create a Customer if we want to lock the shipping address ---
let customerId;
let lockAddress = false;

if (hasFullAddress(shipTo)) {
  const addr = {
    line1: shipTo.line1,
    line2: shipTo.line2 || "",
    city: shipTo.city,
    state: shipTo.state,
    postal_code: shipTo.postal_code || shipTo.zip,
    country: shipTo.country || "US",
  };
  const cust = await stripe.customers.create({
    name: shipTo.name,
    email: shipTo.email || undefined,
    phone: shipTo.phone || undefined,
    address: addr,
    shipping: { name: shipTo.name, phone: shipTo.phone || undefined, address: addr },
  });
  customerId = cust.id;
  lockAddress = true; // we have a full address; OK to lock
}



      // --- Build session params ONCE ---
const sessionParams = {
  mode: "payment",
  line_items,
  // always a single, consistent option
  shipping_options: [singleShippingOption],
  automatic_tax: { enabled: true },
  allow_promotion_codes: true, // promo box on Checkout
  success_url: `${ORIGIN}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${ORIGIN}/cart`,
  metadata: SESSION_META,
  payment_intent_data: {
    metadata: SESSION_META,
    // don't set payment_intent_data.shipping when automatic_tax is enabled
  },

  // Always pass a customer (pre-filled address)
  ...(customerId ? {
    customer: customerId,
  } : {}),



  // Prevent edits (view-only on Checkout UI)
  customer_update: { address: "never", shipping: "never", name: "never" },
};


if (promoId) {
    sessionParams.discounts = [{ promotion_code: promoId }];
  }
  const session = await stripe.checkout.sessions.create(sessionParams);
  return res.json({ url: session.url });
    } catch (e) {
      console.error("checkout error:", e);
      return res.status(400).json({ error: String(e?.message || e) });
    }
  });

  /* ------------ Simple data store ------------ */
  const DATA_DIR = path.join(process.cwd(), "data");
  const DATA_FILE = path.join(DATA_DIR, "products.json");
  const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
  const ADMIN_KEY = process.env.ADMIN_KEY || "dev-admin";

  async function ensureFile(f, fallback) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try { await fs.access(f); } catch { await fs.writeFile(f, JSON.stringify(fallback, null, 2)); }
  }
  async function ensureDataFile() { await ensureFile(DATA_FILE, []); }
  async function ensureOrdersFile() { await ensureFile(ORDERS_FILE, []); }

  async function readProducts() {
    await ensureDataFile();
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw || "[]");
  }
  async function writeProducts(list) {
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2));
  }
  async function readOrders() {
    await ensureOrdersFile();
    const raw = await fs.readFile(ORDERS_FILE, "utf8");
    return JSON.parse(raw || "[]");
  }
  async function writeOrders(list) {
    await fs.writeFile(ORDERS_FILE, JSON.stringify(list, null, 2));
  }

  /* Public: list products */
  app.get("/api/products", async (_req, res) => {
    const items = await readProducts();
    res.json(items);
  });
  app.get("/api/products/:id", async (req, res) => {
    const items = await readProducts();
    const item = items.find(p => p.id === req.params.id);
    if (!item) return res.status(404).json({ error: "not found" });
    res.json(item);
  });

  /* Admin auth */
  function requireAdmin(req, res, next) {
    const key = req.header("x-admin-key") || req.query.key;
    if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
    next();
  }


  /* Uploads */
  const upload = multer({
    dest: path.join(process.cwd(), "public", "tmp"),
    limits: { fileSize: 10 * 1024 * 1024 },
  });
  function extensionOf(name = "") {
    const m = name.match(/\.[a-zA-Z0-9]+$/);
    return m ? m[0].toLowerCase() : ".jpg";
  }
  app.post("/api/admin/upload", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "no file" });
      const ext = extensionOf(req.file.originalname);
      const base = slugify(req.file.originalname.replace(/\.[^.]+$/, "")) || "image";
      const filename = `${base}-${Date.now()}${ext}`;
      const finalPath = path.join(process.cwd(), "public", "images", filename);
      await fs.mkdir(path.dirname(finalPath), { recursive: true });
      await fs.rename(req.file.path, finalPath);
      res.json({ url: `/images/${filename}` });
    } catch (e) {
      console.error("upload failed:", e);
      res.status(500).json({ error: "upload failed" });
    }
  });

  /* Admin products */
// --- Admin products (CREATE) ---
app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      description = "",
      price,
      priceId,
      images = [],
      sizes = [],
      inventory = {},
      inStock,
    } = req.body || {};

    // Basic validation
    if (!id || !name || typeof price !== "number" || isNaN(price)) {
      return res.status(400).json({ error: "id, name, price required" });
    }

    // Load existing
    const list = await readProducts();
    if (list.find(p => String(p.id) === String(id))) {
      return res.status(409).json({ error: "id already exists" });
    }

    // Normalize inventory & sizes
    const normInventory = Object.fromEntries(
      Object.entries(inventory || {}).map(([k, v]) => [String(k), Math.max(0, Number(v) || 0)])
    );
    const normSizes =
      (Array.isArray(sizes) && sizes.length ? sizes : Object.keys(normInventory)) || [];
    const normInStock =
      typeof inStock === "boolean"
        ? inStock
        : Object.values(normInventory).some(n => Number(n) > 0);

    // Ensure we have a Stripe price (create if missing)
    let finalPriceId = priceId;
    if (!finalPriceId) {
      const stripeImages = (images || []).filter(u => /^https?:\/\//i.test(String(u)));
      const sp = await stripe.products.create({
        name,
        description,
        images: stripeImages,
        metadata: { local_id: id },
      });
      const pr = await stripe.prices.create({
        product: sp.id,
        unit_amount: Math.round(price * 100),
        currency: "usd",
      });
      finalPriceId = pr.id;
    }

    // Persist to data/products.json
    const newItem = {
      id: String(id),
      name: String(name),
      description: String(description || ""),
      price: Number(price),
      priceId: String(finalPriceId),
      images: Array.isArray(images) ? images : [],
      sizes: normSizes,
      inventory: normInventory,
      inStock: normInStock,
    };

    await writeProducts([...list, newItem]);
    return res.status(201).json(newItem);
 } catch (e) {
    console.error("admin create error:", e);
    return res.status(400).json({ error: e?.message || String(e) });
  }
});

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const list = await readProducts();
    const idx = list.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "not found" });
    list[idx] = { ...list[idx], ...req.body };
    await writeProducts(list);
    res.json(list[idx]);
  });
  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const list = await readProducts();
    const next = list.filter(p => p.id !== req.params.id);
    await writeProducts(next);
    res.json({ ok: true });
  });
// PATCH inventory for a product (admin)
app.patch("/api/admin/products/:id/inventory", requireAdmin, async (req, res) => {
  try {
    const pid = String(req.params.id);
    const inv = (req.body && req.body.inventory) || {};

    if (!inv || typeof inv !== "object" || Array.isArray(inv)) {
      return res.status(400).json({ error: 'inventory must be an object like {"S":10,"M":5}' });
    }

    // normalize inventory (numbers, >= 0)
    const inventory = Object.fromEntries(
      Object.entries(inv).map(([k, v]) => [String(k), Math.max(0, Number(v) || 0)])
    );
    const sizes = Object.keys(inventory);
    const inStock = Object.values(inventory).some(n => Number(n) > 0);

    // load products.json
    const list = await readProducts();
    const idx = list.findIndex(p => String(p.id) === pid);
    if (idx === -1) return res.status(404).json({ error: "Product not found" });

    // update fields
    list[idx].inventory = inventory;
    if (!Array.isArray(list[idx].sizes) || list[idx].sizes.length === 0) {
      list[idx].sizes = sizes;
    }
    list[idx].inStock = inStock;

    await writeProducts(list);

    return res.json({ ok: true, product: list[idx] });
  } catch (e) {
    console.error("PATCH /api/admin/products/:id/inventory failed:", e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

  /* Ensure upload dirs */
  async function ensureUploadDirs() {
    await fs.mkdir(path.join(process.cwd(), "public", "tmp"), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), "public", "images"), { recursive: true });
  }
  ensureUploadDirs();
  // Debug—list all orders saved in data/orders.json
  // JSON: list all orders
  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    try {
      const orders = await readOrders();
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: String(e?.message || e) });
    }
  });
  // CSV: export orders
  app.get("/api/admin/orders.csv", requireAdmin, async (_req, res) => {
    const orders = await readOrders();

    const headers = [
      "id","createdAtISO","email","name","total_cents","currency",
      "shipping_cents","carrier","service","tracking_code","label_url",
      "addr_name","addr_line1","addr_line2","addr_city","addr_state","addr_zip","addr_country"
    ];

    function q(v="") {
      const s = String(v ?? "");
      return `"${s.replace(/"/g, '""')}"`;
    }

    const rows = orders.map(o => ([
      o.id,
      new Date(o.createdAt || 0).toISOString(),
      o.email, o.name, o.amount_total, o.currency,
      o.shipping_amount,
      o.carrier, o.service, o.tracking_code, o.label_url,
      o.address?.name, o.address?.street1, o.address?.street2,
      o.address?.city, o.address?.state, o.address?.zip, o.address?.country
    ].map(q).join(",")));

    const csv = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.send(csv);
  });
  // HTML: simple Orders dashboard (newest first). Optional sorting via ?sort=total|name|date
  app.get("/admin/orders", requireAdmin, async (req, res) => {
    const orders = await readOrders();
    const sort = String(req.query.sort || "date"); // date|total|name

    const sorted = [...orders].sort((a, b) => {
      if (sort === "total") return (b.amount_total || 0) - (a.amount_total || 0);
      if (sort === "name")  return String(a.name||"").localeCompare(String(b.name||""));
      // default: date desc
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    const rows = sorted.map(o => {
      const when = o.createdAt ? new Date(o.createdAt).toLocaleString() : "";
      const total = (o.amount_total ?? 0) / 100;
      const ship  = (o.shipping_amount ?? 0) / 100;
    const items = Array.isArray(o.items)
    ? o.items.map(i => `${i.description} ×${i.quantity}${i.size ? ` (size: ${i.size})` : ""}`).join("<br>")
    : "";


      return `
        <tr>
          <td>${when}</td>
          <td>${o.name || ""}<br><small>${o.email || ""}</small></td>
          <td>$${total.toFixed(2)} ${o.currency || ""}<br><small>Shipping: $${ship.toFixed(2)}</small></td>
          <td>${items}</td>
          <td>
            ${o.tracking_code ? `<div>${o.tracking_code}</div>` : `<em>—</em>`}
            ${o.carrier || ""} ${o.service || ""}
            ${o.label_url ? `<div><a href="${o.label_url}" target="_blank">Label PDF</a></div>` : ""}
          </td>
          <td>
            ${o.address?.name || ""}<br>
            ${o.address?.street1 || ""} ${o.address?.street2 || ""}<br>
            ${o.address?.city || ""}, ${o.address?.state || ""} ${o.address?.zip || ""}<br>
            ${o.address?.country || ""}
          </td>
        </tr>
      `;
    }).join("");

    res.send(`<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Orders</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
      h1 { margin: 0 0 16px; }
      .toolbar { margin-bottom: 12px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 10px; vertical-align: top; }
      th { background: #f6f6f6; text-align: left; }
      small { color: #666; }
      a.button { display:inline-block; padding:8px 12px; background:#111; color:#fff; text-decoration:none; border-radius:6px; }
      .links a { margin-right: 8px; }
    </style>
  </head>
  <body>
    <h1>Orders</h1>
    <div class="toolbar links">
      <a class="button" href="/api/admin/orders.csv?key=${encodeURIComponent(req.query.key || "")}">Download CSV</a>
      <span>Sort:</span>
      <a href="/admin/orders?key=${encodeURIComponent(req.query.key || "")}&sort=date">Date</a>
      <a href="/admin/orders?key=${encodeURIComponent(req.query.key || "")}&sort=total">Total</a>
      <a href="/admin/orders?key=${encodeURIComponent(req.query.key || "")}&sort=name">Name</a>
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Items</th>
          <th>Shipping</th>
          <th>Address</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="6"><em>No orders yet.</em></td></tr>`}</tbody>
    </table>
  </body>
  </html>`);
  });


  app.listen(3001, "0.0.0.0", () => console.log("API on http://0.0.0.0:3001"));
