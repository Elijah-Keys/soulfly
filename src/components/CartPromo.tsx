import { useState } from "react";

export function CartPromo({ onApplied }: { onApplied: (p: { promoId: string, label: string }) => void }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle"|"checking"|"ok"|"err">("idle");
  const [message, setMessage] = useState("");

  const apply = async () => {
    setStatus("checking");
    setMessage("");
    const r = await fetch("/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() })
    });
    const data = await r.json();
    if (data.ok) {
      setStatus("ok");
      setMessage(data.coupon.percent_off
        ? `Applied ${data.coupon.percent_off}% off`
        : `Applied $${(data.coupon.amount_off/100).toFixed(2)} off`);
      onApplied({ promoId: data.promoId, label: code.trim().toUpperCase() });
    } else {
      setStatus("err");
      setMessage(data.error || "Invalid code");
    }
  };

  return (
    <div className="flex items-start gap-2">
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Promo code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button
        className="rounded px-4 py-2 bg-black text-white disabled:opacity-50"
        disabled={!code || status==="checking"}
        onClick={apply}
      >
        {status==="checking" ? "Checking..." : "Apply"}
      </button>
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}
