// Configure the JSON data URL here (env override > GitHub Pages default > local fallback)
export const DATA_URL =
  import.meta.env.VITE_DATA_URL ||
  "https://raw.githubusercontent.com/leandrobosaipo/radar-editorial-mt/main/public/data/latest.json";

// Auto-refresh interval in milliseconds (5 minutes)
export const REFRESH_INTERVAL = 5 * 60 * 1000;

// Delay threshold in minutes
export const DELAY_THRESHOLD_MINUTES = 60;
