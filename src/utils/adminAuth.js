/**
 * adminAuth.js
 *
 * Auth is now fully cookie-based (HttpOnly __Host-admin_session).
 * The client never sees, stores, or sends a token.
 *
 * This file is kept to avoid breaking any stray imports but all
 * functions are no-ops. The real auth state lives in AuthContext.jsx
 * which bootstraps from GET /api/auth/status on mount.
 */

/** @deprecated No-op. Auth is server-side cookie. */
export function storeToken() {}

/** @deprecated Always returns null. Auth is server-side cookie. */
export function getToken() { return null; }

/** @deprecated Always returns false. Use AuthContext.isAuthenticated. */
export function hasSession() { return false; }

/** @deprecated No-op. Call AuthContext.logout() instead. */
export function clearSession() {}

/** @deprecated Returns empty object. Cookie is sent automatically. */
export function authHeader() { return {}; }

