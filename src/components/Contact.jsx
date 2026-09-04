import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { API_BASE } from '@/utils/apiBase.js';
import {
  sanitizeInput,
  validateContactForm,
  setRateLimitTimestamp,
  createFormTimestamp,
  FIELD_LIMITS,
} from '../utils/security';

const Contact = () => {
  const ref = useRef(null);

  // ── Security: record form render timestamp for bot-timing check ──
  const formLoadedAt = useRef(createFormTimestamp());

  // ── Form State ──
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    permission: false,
    honeypot: '',  // Hidden field — humans leave this blank; bots fill it
  });

  // ── UI State ──
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg]       = useState('');
  const [charCount, setCharCount]     = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '20%']);

  // ── Input Change Handler with real-time sanitization ──
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [id]: checked }));
      return;
    }

    // Sanitize on every keystroke — strip HTML/script tags live
    const sanitized = sanitizeInput(value);

    setFormData((prev) => ({ ...prev, [id]: sanitized }));

    // Track message character count for UX feedback
    if (id === 'message') setCharCount(sanitized.length);
  };

  // ── Honeypot: track separately (no sanitize — we want raw value for detection)
  const handleHoneypotChange = (e) => {
    setFormData((prev) => ({ ...prev, honeypot: e.target.value }));
  };

  // ── Form Submission Handler ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Run full validation pipeline (sanitization, rate limit, bot checks)
    const { valid, error } = validateContactForm({
      firstName:   formData.firstName,
      lastName:    formData.lastName,
      email:       formData.email,
      message:     formData.message,
      honeypot:    formData.honeypot,
      formLoadedAt: formLoadedAt.current,
      permission:  formData.permission,
    });

    if (!valid) {
      if (error) {
        // Show real user errors; silently drop bot rejections (no error = null)
        setErrorMsg(error);
      }
      return;
    }

    setSubmitState('loading');

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName:  formData.lastName,
          email:     formData.email,
          message:   formData.message,
          honeypot:  formData.honeypot,
        }),
      });

      if (res.status === 429) {
        setSubmitState('idle');
        setErrorMsg('Too many submissions. Please wait before trying again.');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitState('idle');
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        return;
      }
    } catch {
      setSubmitState('idle');
      setErrorMsg('Cannot reach server. Please try again later.');
      return;
    }

    // Record rate limit timestamp AFTER confirmed server success
    setRateLimitTimestamp();
    setSubmitState('success');

    // Reset form after success
    setTimeout(() => {
      setFormData({ firstName: '', lastName: '', email: '', message: '', permission: false, honeypot: '' });
      setCharCount(0);
      setSubmitState('idle');
      formLoadedAt.current = createFormTimestamp();
    }, 4000);

  };

  // ── Input class helper ──
  const inputCls = 'w-full bg-transparent border-b border-white/20 pb-3 text-lg focus:outline-none focus:border-red-600 transition-colors placeholder-white/40 font-medium rounded-none text-white';

  return (
    <section ref={ref} id="contact" className="bg-[#0b0b0b] w-full min-h-screen relative overflow-hidden flex items-end pt-20 md:pt-32 pb-0 border-t border-white/10 select-none">

      {/* Background Cinematic Red Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* Huge Background Parallax Netflix Watermark Text */}
      <motion.div
        style={{ y }}
        className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center overflow-hidden pointer-events-none z-0 pt-16 md:pt-12 opacity-10"
      >
        <h1
          className="text-[25vw] leading-[0.75] font-black text-red-600 uppercase tracking-tighter select-none scale-y-[1.6] origin-top"
          style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
        >
          CONTACT
        </h1>
      </motion.div>

      {/* Form Card Overlay */}
      <div className="relative z-10 w-full flex justify-end items-end">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-[#141414]/95 backdrop-blur-2xl border-t border-l border-white/15 w-full md:w-[90%] lg:w-[82%] p-8 md:p-16 text-white flex flex-col justify-between rounded-tl-[3rem] shadow-[0_-25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden"
        >
          {/* Subtle internal top crimson highlight glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-90"></div>

          <div className="flex items-center justify-between mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-red-600/10 border border-red-600/30 text-xs font-mono uppercase tracking-widest text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              <span>EPISODE 04 // GET IN TOUCH</span>
            </div>
            <span className="text-xs font-mono text-white/40 tracking-wider hidden md:block">
              // LET'S BUILD SOMETHING CINEMATIC
            </span>
          </div>

          {/* ─── SUCCESS STATE ─── */}
          {submitState === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-6 py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600/50 flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.4)]">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Signal Received</h3>
                <p className="text-sm text-white/60 font-mono">
                  Message transmitted successfully. I'll respond within 24 hours.
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── FORM STATE ─── */}
          {submitState !== 'success' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-16 w-full" noValidate>

              {/* ─── HONEYPOT FIELD ─── */}
              {/* Visually hidden but accessible; CSS hides it completely.
                  Bots auto-fill all fields — humans never see or fill this. */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  top: '-9999px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  opacity: 0,
                  tabIndex: -1,
                  pointerEvents: 'none',
                }}
              >
                <label htmlFor="website">Leave this field blank</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.honeypot}
                  onChange={handleHoneypotChange}
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-8 md:gap-20 w-full">

                {/* Left Column */}
                <div className="flex-1 flex flex-col gap-8">
                  <div className="relative">
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      maxLength={FIELD_LIMITS.firstName}
                      autoComplete="given-name"
                      className={inputCls}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      maxLength={FIELD_LIMITS.lastName}
                      autoComplete="family-name"
                      className={inputCls}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      required
                      maxLength={FIELD_LIMITS.email}
                      autoComplete="email"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col">
                  <div className="relative h-full flex flex-col">
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      required
                      maxLength={FIELD_LIMITS.message}
                      className="w-full h-full min-h-[120px] md:min-h-[140px] bg-transparent border-b border-white/20 pb-3 text-lg focus:outline-none focus:border-red-600 transition-colors placeholder-white/40 font-medium resize-none rounded-none text-white"
                    ></textarea>
                    {/* Character counter */}
                    <span className={`text-right text-[10px] font-mono mt-1.5 transition-colors ${charCount > FIELD_LIMITS.message * 0.9 ? 'text-red-400' : 'text-white/30'}`}>
                      {charCount} / {FIELD_LIMITS.message}
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── Error Message ─── */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/10 border border-red-600/30 text-sm text-red-400 font-mono"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {errorMsg}
                </motion.div>
              )}

              {/* Bottom Section */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-4 pt-6 border-t border-white/10">
                {/* Left: Permission checkbox */}
                <div className="flex-1 flex items-start gap-4 text-sm font-light text-white/70">
                  <input
                    type="checkbox"
                    id="permission"
                    checked={formData.permission}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded-sm border-white/30 bg-transparent text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    style={{ accentColor: '#E50914' }}
                  />
                  <label htmlFor="permission" className="cursor-pointer max-w-[280px] leading-snug">
                    I give permission to contact me at this email address.
                  </label>
                </div>

                {/* Right: Info & submit button */}
                <div className="flex-1 flex flex-col gap-8 text-xs text-white/50 font-light">
                  <p className="leading-relaxed max-w-[400px]">
                    This site is protected by security protocols and industry-standard privacy guidelines. Messages are rate-limited to prevent spam.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                    <p className="max-w-[250px] leading-relaxed">
                      Ready to start a project or collaboration? Send a direct signal.
                    </p>

                    <button
                      type="submit"
                      disabled={submitState === 'loading'}
                      className="px-8 py-3.5 rounded bg-red-600 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-red-700 transition-all duration-300 group whitespace-nowrap shadow-[0_0_20px_rgba(229,9,20,0.6)] hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submitState === 'loading' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Transmitting...
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </section>
  );
};

export default Contact;