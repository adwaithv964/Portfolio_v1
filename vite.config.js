import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    // @ alias → src/ for clean absolute imports across admin & contexts
    alias: {
      '@': '/src',
    },
  },

  server: {
    port: 5173,  // Must match CORS_ORIGIN in server/.env
    strictPort: true,  // Fail loudly instead of silently incrementing port
    // ─── Proxy /api/* → Express backend on port 3001 ───────────────
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        // changeOrigin MUST be false: if true, Vite rewrites the Origin header
        // to the target URL before Express sees it, breaking CSRF origin validation.
        changeOrigin: false,
        secure: false,
      },
    },
    // ─── Security Headers injected into the Vite dev server ───
    headers: {
      // Prevent this page from being embedded in iframes (clickjacking)
      'X-Frame-Options': 'DENY',

      // Block MIME type sniffing — browsers must use declared Content-Type
      'X-Content-Type-Options': 'nosniff',

      // Control referrer information sent with outbound requests
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Disable browser features not needed by this portfolio
      'Permissions-Policy': [
        'camera=()',         // No camera access
        'microphone=()',     // No microphone access
        'geolocation=()',    // No location access
        'interest-cohort=()',// Opt out of FLoC tracking
        'payment=()',        // No payment API
        'usb=()',            // No USB access
        'serial=()',         // No serial port access
      ].join(', '),

      // Content Security Policy — restricts where scripts, styles, and
      // resources can be loaded from. Prevents XSS and data injection.
      'Content-Security-Policy': [
        // Only allow scripts from self + GSAP + Framer Motion (bundled by Vite = 'self')
        "default-src 'self'",

        // Scripts: self + unsafe-inline needed for Vite HMR in dev
        "script-src 'self' 'unsafe-inline'",

        // Styles: self + inline styles needed for GSAP/Tailwind animation
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

        // Fonts: Google Fonts
        "font-src 'self' https://fonts.gstatic.com",

        // Images: self + data URIs (for generated images and assets)
        "img-src 'self' data: blob:",

        // Connect: allow fetch/XHR to same origin only (no external API calls in portfolio)
        "connect-src 'self'",

        // Object/embed/frame: completely blocked
        "object-src 'none'",
        "frame-src 'none'",
        "frame-ancestors 'none'",

        // Base URI: restrict <base> tag abuse
        "base-uri 'self'",

        // Form submissions: only to self
        "form-action 'self'",

        // Upgrade HTTP to HTTPS in production
        "upgrade-insecure-requests",
      ].join('; '),

      // HTTP Strict Transport Security — force HTTPS for 1 year in production
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },

  // ─── Preview server (vite preview) also gets security headers ───
  preview: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join('; '),
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
})
