// Configure the JSON data URL here (env override > local public data)
export const DATA_URL = import.meta.env.VITE_DATA_URL || "/data/latest.json";

// Auto-refresh interval in milliseconds (5 minutes)
export const REFRESH_INTERVAL = 5 * 60 * 1000;

// Delay threshold in minutes
export const DELAY_THRESHOLD_MINUTES = 60;
