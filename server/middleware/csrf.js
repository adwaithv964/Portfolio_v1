/**
 * server/middleware/csrf.js
 *
 * CSRF protection for cookie-authenticated state-changing routes.
 *
 * Why this is needed:
 *   Once auth moves from Bearer token to HttpOnly cookie, browsers automatically
 *   send the cookie on cross-site requests. Without CSRF protection a malicious
 *   page on another origin could trigger admin mutations.
 *
 * Strategy (layered):
 *   1. SameSite=Strict on the cookie (primary defence)
 *   2. Origin header validation (defence-in-depth)
 *   3. Sec-Fetch-Site header check (modern browsers)
 *
 * Applied to: PUT /api/content/*, POST /api/auth/logout, POST /api/contact
 * NOT applied to: POST /api/auth/login (no session yet), GET endpoints
 */

/**
 * requireSameOrigin — Express middleware.
 * Rejects requests whose Origin header does not match the configured allowed origin.
 * Also rejects requests with a cross-site Sec-Fetch-Site header (if present).
 */
export function requireSameOrigin(req, res, next) {
  const allowed = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const origin  = req.headers['origin'];

  // Origin header must be present and match exactly
  if (!origin || origin !== allowed) {
    req.auditLog?.('CSRF_REJECT', { origin: origin || 'absent' });
    return res.status(403).json({ error: 'Forbidden.' });
  }

  // Sec-Fetch-Site — if sent by the browser, it must indicate same-origin
  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite && fetchSite !== 'same-origin') {
    req.auditLog?.('CSRF_REJECT', { fetchSite });
    return res.status(403).json({ error: 'Forbidden.' });
  }

  next();
}
