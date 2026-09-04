/**
 * server/middleware/session.js
 *
 * Minimal in-memory admin session store.
 *
 * Properties:
 *   - Session ID: 32 random bytes (hex) = 256 bits of entropy
 *   - Cookie: __Host-admin_session; HttpOnly; Secure; SameSite=Strict; Path=/
 *   - Idle TTL: 15 minutes (server-side, refreshed on each authenticated request)
 *   - GC: pruned every 5 minutes
 *   - Restart = sessions cleared (re-login required - acceptable for a portfolio)
 *   - Logout: session immediately destroyed (no expiry window)
 */

import { randomBytes } from 'crypto';

const IDLE_TTL_MS    = 15 * 60 * 1000;
const GC_INTERVAL_MS = 5  * 60 * 1000;

// __Host- prefix requires Secure + HTTPS, which only exists in production.
// On http://localhost browsers reject the cookie entirely.
const isProd = () => process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProd() ? '__Host-admin_session' : 'admin_session';

/** @type {Map<string, { createdAt: number, lastSeen: number }>} */
const sessions = new Map();

// Garbage-collect expired sessions every 5 minutes
const _gc = setInterval(() => {
  const now = Date.now();
  for (const [id, sess] of sessions) {
    if (now - sess.lastSeen > IDLE_TTL_MS) sessions.delete(id);
  }
}, GC_INTERVAL_MS).unref();

// Core session operations

/** Create a new session and return the session ID. */
export function createSession() {
  const id = randomBytes(32).toString('hex');
  sessions.set(id, { createdAt: Date.now(), lastSeen: Date.now() });
  return id;
}

/**
 * Look up a session by ID.
 * Returns the session object if valid, null if missing/expired.
 * Updates lastSeen on success.
 */
export function getSession(id) {
  if (!id || typeof id !== 'string') return null;
  const sess = sessions.get(id);
  if (!sess) return null;
  if (Date.now() - sess.lastSeen > IDLE_TTL_MS) {
    sessions.delete(id);
    return null;
  }
  sess.lastSeen = Date.now();
  return sess;
}

/** Destroy a session immediately (logout). */
export function destroySession(id) {
  if (id) sessions.delete(id);
}

// Cookie helpers

/** Build the Set-Cookie header value for setting the session cookie. */
export function buildSetCookieHeader(sessionId) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${sessionId}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${Math.floor(IDLE_TTL_MS / 1000)}`,
  ];
  // __Host- prefix requires Secure; omit on localhost for dev compatibility
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

/** Build the Set-Cookie header value to clear the session cookie. */
export function buildClearCookieHeader() {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    'Max-Age=0',
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

/** Parse the session ID from the Cookie header. Returns null if not present. */
export function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
  );
  return match ? match[1] : null;
}

/**
 * requireSession — Express middleware.
 * Returns 401 if no valid session exists.
 * Refreshes lastSeen on success (extends idle window).
 */
export function requireSession(req, res, next) {
  const sessionId = parseSessionCookie(req.headers.cookie);
  const session   = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: no valid session.' });
  }
  req.sessionId = sessionId;
  next();
}
