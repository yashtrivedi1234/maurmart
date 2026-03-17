const devDefault = "http://localhost:5001";
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? devDefault : "");
const origin = typeof window !== "undefined" ? window.location.origin : "";
const isVercelFrontend = origin === "https://maurmart.vercel.app";
const renderBackend = import.meta.env.VITE_RENDER_BACKEND_URL;

// When frontend is on Vercel, API must point to Render backend (Vercel only serves the SPA; POST /api/* returns 405).
// In Vercel project settings, set VITE_RENDER_BACKEND_URL to your Render backend (e.g. https://maurmart-backend.onrender.com).
let chosenBase = rawApiBaseUrl || devDefault;
if (isVercelFrontend && renderBackend) {
  chosenBase = renderBackend;
} else if (isVercelFrontend && rawApiBaseUrl && rawApiBaseUrl.replace(/\/$/, "") === origin) {
  // Misconfigured: API base is same as frontend origin; use Render URL if provided
  chosenBase = renderBackend || chosenBase;
}

// Avoid accidental double slashes when composing endpoint paths.
export const API_BASE_URL = chosenBase.replace(/\/$/, "");

console.log("🌐 API Configuration:");
console.log("   - VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL || "not set");
console.log("   - Environment:", import.meta.env.DEV ? "DEV" : "PROD");
console.log("   - Frontend origin:", origin);
console.log("   - Final API_BASE_URL:", API_BASE_URL);
