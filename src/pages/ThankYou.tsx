import { useEffect, useMemo } from "react";

export default function ThankYou() {
  const qs = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = qs.get("session_id");

  useEffect(() => {
    // optional: you could POST sessionId to your server to store the order
  }, [sessionId]);

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Thanks for your order! 🎉</h1>
      <p className="mt-2">We’re processing it now. Your confirmation is on the way.</p>
      {sessionId && (
        <p className="mt-2 text-sm text-gray-500">Session: {sessionId}</p>
      )}
      <a className="inline-block mt-6 underline" href="/">Back to shop</a>
    </main>
  );
}
