// src/main.tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/** --- TEMP ENV CHECK --- **/
console.log("Vite mode:", import.meta.env.MODE);
;(window as any).__ENV = {
  VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  VITE_ADMIN_KEY: import.meta.env.VITE_ADMIN_KEY,
  VITE_API_URL: import.meta.env.VITE_API_URL,
};
console.log("ENV dump:", (window as any).__ENV);
/** --- END TEMP --- **/

createRoot(document.getElementById("root")!).render(<App />);
