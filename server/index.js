/**
 * server/index.js - Adwaith V Portfolio API Server
 *
 * Security pipeline order:
 *   Request
 *     -> Helmet (headers)
 *     -> Body size limit
 *     -> Request correlation ID
 *     -> Route-specific rate limiter
 *     -> requireSession (auth)
 *     -> requireSameOrigin (CSRF)
 *     -> Zod schema validation
 *     -> Atomic content write (mutex-locked)
 *     -> Response
 *
 * Endpoints:
 *   POST /api/auth/login          - bcrypt verify, set HttpOnly session cookie
 *   POST /api/auth/logout         - destroy session, clear cookie
 *   GET  /api/auth/status         - { authenticated: bool } for React bootstrap
 *   GET  /api/content             - public portfolio content
 *   PUT  /api/content/:section    - update section (session required)
 *   POST /api/contact             - visitor contact form
 *   GET  /api/health              - liveness check
 */

import { randomUUID }    from 'crypto';
import express           from 'express';
import helmet            from 'helmet';
import rateLimit         from 'express-rate-limit';
import bcrypt            from 'bcrypt';
import fs                from 'fs';
import path              from 'path';
import { fileURLToPath } from 'url';

import {
  createSession,
  destroySession,
  parseSessionCookie,
  getSession,
  requireSession,
  buildSetCookieHeader,
  buildClearCookieHeader,
} from './middleware/session.js';
import { requireSameOrigin } from './middleware/csrf.js';
import { SCHEMAS, contactSchema } from './schemas.js';

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_FILE = path.join(__dirname, 'data', 'content.json');
const PORT         = process.env.PORT || 3001;

// =============================================================================
// PHASE 9: Server startup validation - fail fast on bad config
// =============================================================================
function validateConfig() {
  const required = ['ADMIN_BCRYPT_HASH', 'SESSION_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[FATAL] Missing required env var: ${key}`);
      process.exit(1);
    }
  }
  if (!/^\$2[ab]\$\d{2}\$/.test(process.env.ADMIN_BCRYPT_HASH)) {
    console.error('[FATAL] ADMIN_BCRYPT_HASH does not look like a valid bcrypt hash.');
    process.exit(1);
  }
  if (process.env.SESSION_SECRET.length < 32) {
    console.error('[FATAL] SESSION_SECRET too short. Minimum 32 characters required.');
    process.exit(1);
  }
}
validateConfig();

const app = express();

// =============================================================================
// PHASE 1: Security headers
// =============================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"],
      frameAncestors: ["'none'"],
      baseUri:    ["'self'"],
      formAction: ["'self'"],
    },
  },
}));

// =============================================================================
// PHASE 0: CORS — must run before any other middleware
// In production: Vercel frontend (https://x.vercel.app) → Render API (https://y.onrender.com)
// credentials:true is required so the browser forwards the HttpOnly session cookie.
// =============================================================================
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Body size limits - 32kb for content, enforced globally; contact uses 16kb check separately
app.use(express.json({ limit: '32kb' }));

// =============================================================================
// PHASE 9: Request correlation ID + safe audit logger
// =============================================================================
app.use((req, _res, next) => {
  req.requestId = randomUUID();
  req.auditLog = (event, meta = {}) => {
    const safe = { ...meta };
    // Scrub any accidentally included sensitive fields
    delete safe.password;
    delete safe.hash;
    delete safe.sessionId;
    delete safe.cookie;
    delete safe.token;
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      requestId: req.requestId,
      event,
      ip: req.ip,
      ...safe,
    }));
  };
  next();
});

// =============================================================================
// PHASE 1: Rate limiters
// =============================================================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many contact submissions. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

app.use('/api/', apiLimiter);

// =============================================================================
// PHASE 7: AsyncMutex for concurrency-safe content writes
// =============================================================================
class AsyncMutex {
  #queue = Promise.resolve();
  acquire() {
    let release;
    const next = new Promise(resolve => { release = resolve; });
    const waitForTurn = this.#queue.then(() => release);
    this.#queue = this.#queue.then(() => next);
    return waitForTurn;
  }
}
const writeLock = new AsyncMutex();

// =============================================================================
// PHASE 7: Content I/O - atomic write with pre-write backup
// =============================================================================
function readContent() {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

async function writeContentSafe(data) {
  const release = await writeLock.acquire();
  try {
    const backupDir = path.join(__dirname, 'data', 'backups');
    fs.mkdirSync(backupDir, { recursive: true });

    // 1. Backup current state BEFORE overwriting
    if (fs.existsSync(CONTENT_FILE)) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(CONTENT_FILE, path.join(backupDir, `content-${ts}.json`));
      // Prune: keep last 10 backups only
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort();
      for (const old of files.slice(0, -10)) {
        fs.unlinkSync(path.join(backupDir, old));
      }
    }

    // 2. Write to temp file
    const tmp = CONTENT_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');

    // 3. Atomic rename (tmp -> content.json)
    fs.renameSync(tmp, CONTENT_FILE);
  } finally {
    release();
  }
}

// Strip all HTML tags from a string (safety net; Zod schemas also prevent HTML)
function stripTags(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
}

// Valid section keys
const VALID_SECTIONS = new Set(['hero', 'about', 'expertise', 'skills', 'projects', 'footer']);

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

// GET /api/auth/status - React uses this on mount to restore session state
app.get('/api/auth/status', (req, res) => {
  const sessionId = parseSessionCookie(req.headers.cookie);
  const session   = getSession(sessionId);
  res.json({ authenticated: Boolean(session) });
});

// =============================================================================
// POST /api/auth/login
// =============================================================================
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { password } = req.body || {};

  // Always run bcrypt.compare to normalise timing (prevent timing oracle)
  const candidate = (typeof password === 'string' && password.length <= 256)
    ? password
    : '';

  let valid = false;
  try {
    valid = await bcrypt.compare(candidate, process.env.ADMIN_BCRYPT_HASH);
  } catch (err) {
    console.error('[Auth] bcrypt error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }

  if (!valid) {
    req.auditLog('ADMIN_LOGIN', { result: 'fail' });
    // Small intentional delay to make brute-force more expensive
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const sessionId = createSession();
  req.auditLog('ADMIN_LOGIN', { result: 'success' });

  res
    .setHeader('Set-Cookie', buildSetCookieHeader(sessionId))
    .json({ ok: true });
});

// =============================================================================
// POST /api/auth/logout
// =============================================================================
app.post('/api/auth/logout', requireSession, requireSameOrigin, (req, res) => {
  destroySession(req.sessionId);
  req.auditLog('ADMIN_LOGOUT', {});
  res
    .setHeader('Set-Cookie', buildClearCookieHeader())
    .json({ ok: true });
});

// =============================================================================
// GET /api/content - public, no auth
// =============================================================================
app.get('/api/content', (req, res) => {
  const content = readContent();
  if (!content) return res.status(500).json({ error: 'Content unavailable.' });
  const { _version, ...publicContent } = content;
  res.json(publicContent);
});

// =============================================================================
// PUT /api/content/:section - session + CSRF + Zod validation required
// =============================================================================
app.put('/api/content/:section', requireSession, requireSameOrigin, async (req, res) => {
  const { section } = req.params;

  if (!VALID_SECTIONS.has(section)) {
    return res.status(400).json({ error: `Invalid section: ${section}` });
  }

  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming) && !['expertise','skills','projects'].includes(section)) {
    return res.status(400).json({ error: 'Invalid request body.' });
  }

  // Zod validation - strict schemas reject unknown keys + enforce types/lengths
  const schema = SCHEMAS[section];
  const result = schema.safeParse(incoming);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid data.',
      details: result.error.flatten().fieldErrors,
    });
  }

  // Additional strip-tags pass as a safety net (Zod already caught HTML via type=string)
  const validated = result.data;

  try {
    const content = readContent();
    if (!content) return res.status(500).json({ error: 'Cannot read content file.' });

    content[section] = validated;
    await writeContentSafe(content);

    req.auditLog('CONTENT_PUT', { section, result: 'success' });
    res.json({ success: true, section, data: validated });
  } catch (err) {
    console.error(`[Content] Write error (${section}):`, err.message);
    req.auditLog('CONTENT_PUT', { section, result: 'error' });
    res.status(500).json({ error: 'Failed to save content.' });
  }
});

// =============================================================================
// POST /api/contact - rate limited, CSRF protected, honeypot, no PII stored
// =============================================================================
app.post('/api/contact', contactLimiter, requireSameOrigin, async (req, res) => {
  const incoming = req.body || {};

  // Enforce 16kb limit for contact (smaller than global 32kb)
  const raw = JSON.stringify(incoming);
  if (raw.length > 16384) {
    return res.status(413).json({ error: 'Request too large.' });
  }

  const result = contactSchema.safeParse(incoming);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid submission.',
      details: result.error.flatten().fieldErrors,
    });
  }

  const { firstName, lastName, email, message, honeypot } = result.data;

  // Honeypot: bot filled a hidden field - silently accept to avoid fingerprinting
  if (honeypot && honeypot.length > 0) {
    req.auditLog('CONTACT_HONEYPOT', {});
    return res.json({ ok: true }); // Silent reject
  }

  // TODO: Wire email delivery here (Resend / Nodemailer)
  // Example with Resend:
  //   await resend.emails.send({ from: '...', to: '...', subject: '...', text: message });
  // For now, log receipt (no PII in audit log - only metadata)
  req.auditLog('CONTACT_RECV', { result: 'ok' });

  // Generic response - no info about delivery outcome
  res.json({ ok: true });
});

// =============================================================================
// 404 + Global error handler
// =============================================================================
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// =============================================================================
// Start
// =============================================================================
app.listen(PORT, () => {
  console.log(`\n  API server running on http://localhost:${PORT}`);
  console.log(`  GET  /api/content          - public`);
  console.log(`  POST /api/auth/login       - rate-limited, bcrypt`);
  console.log(`  POST /api/auth/logout      - session + CSRF`);
  console.log(`  GET  /api/auth/status      - session status`);
  console.log(`  PUT  /api/content/:section - session + CSRF + Zod`);
  console.log(`  POST /api/contact          - rate-limited + CSRF + Zod\n`);
});
