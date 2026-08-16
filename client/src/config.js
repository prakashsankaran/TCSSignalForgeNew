/**
 * Client Configuration & Environment Settings
 * Automatically loaded from Vite environment variables (import.meta.env)
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const config = {
  API_BASE_URL
};

export default config;
