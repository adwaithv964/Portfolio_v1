/**
 * src/utils/apiBase.js
 *
 * Returns the correct API base URL for the current environment:
 *   - Development:  '' (empty string) → Vite proxy handles /api/* → localhost:3001
 *   - Production:   'https://your-api.onrender.com' (from VITE_API_URL in .env.production)
 *
 * Usage:
 *   import { API_BASE } from '@/utils/apiBase.js';
 *   fetch(`${API_BASE}/api/auth/status`, { credentials: 'include' })
 */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
