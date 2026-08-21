// =============================================================================
// AGROLINK GLOBAL CONFIGURATION & ENVIRONMENT DETECTOR
// =============================================================================

export const IS_DEMO_MODE: boolean =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env["VITE_ENABLE_DEMO_MODE"] === "true"
    : typeof process !== "undefined" && process.env
      ? process.env["VITE_ENABLE_DEMO_MODE"] === "true"
      : false;

export const APP_CONFIG = {
  name: "Agrolink",
  tagline: "The trusted network moving food from farm to market",
  apiBaseUrl: "/api",
  isDemoMode: IS_DEMO_MODE,
} as const;
