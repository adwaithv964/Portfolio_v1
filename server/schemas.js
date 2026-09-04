/**
 * server/schemas.js
 *
 * Zod strict schemas for all portfolio content sections + contact form.
 *
 * Rules:
 *   - .strict() on every object: unknown keys are rejected with 400
 *   - All strings are plain text only (no HTML allowed anywhere)
 *   - URL fields enforce exact hostname + scheme requirements
 *   - Array lengths are capped to prevent unbounded growth
 */

import { z } from 'zod';

// ── URL validators ─────────────────────────────────────────────────────────────

/** https://github.com/<anything> */
function isGithubUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && u.hostname === 'github.com';
  } catch { return false; }
}

/** https://www.linkedin.com/in/<path> or https://linkedin.com/in/<path> */
function isLinkedinUrl(v) {
  try {
    const u = new URL(v);
    const validHost = u.hostname === 'linkedin.com' || u.hostname === 'www.linkedin.com';
    return u.protocol === 'https:' && validHost && u.pathname.startsWith('/in/');
  } catch { return false; }
}

/** https:// only — generic project/demo links */
function isHttpsUrl(v) {
  try {
    return new URL(v).protocol === 'https:';
  } catch { return false; }
}

/** Basic RFC-5321 email (no mailto: prefix) */
const EMAIL_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
function isEmail(v) { return EMAIL_RE.test(v.trim()); }

// ── Section schemas ────────────────────────────────────────────────────────────

export const heroSchema = z.object({
  name:        z.string().min(1).max(60),
  subtitle:    z.string().max(80),
  roleTagline: z.string().max(120),
  topBadge:    z.string().max(40),
  description: z.string().max(500),
  techStack:   z.string().max(100),
  techBadge:   z.string().max(60),
  badgeLeft:   z.string().max(40),
  badgeRight:  z.string().max(40),
  seasons:     z.string().max(60),
  coreStack:   z.string().max(300),
  ticker:      z.string().max(120),
  version:     z.string().max(60),
  roles:       z.array(z.string().min(1).max(100)).max(10),
}).strict();

const achievementSchema = z.object({
  text: z.string().min(1).max(300),
}).strict();

export const aboutSchema = z.object({
  bio:          z.string().min(1).max(1000),
  paragraph2:   z.string().max(1000),
  tags:         z.array(z.string().min(1).max(60)).max(10),
  achievements: z.array(achievementSchema).max(10),
  techStack:    z.array(z.string().min(1).max(60)).max(20),
}).strict();

const expertiseItemSchema = z.object({
  number:   z.string().max(10),
  title:    z.string().min(1).max(100),
  text:     z.string().min(1).max(600),
  tag:      z.string().max(60),
  gradient: z.string().max(120),
}).strict();

export const expertiseSchema = z.array(expertiseItemSchema).max(8);

const skillCategorySchema = z.object({
  title:  z.string().min(1).max(80),
  desc:   z.string().max(400),
  tag:    z.string().max(60),
  skills: z.array(z.string().min(1).max(40)).max(15),
}).strict();

export const skillsSchema = z.array(skillCategorySchema).max(12);

const projectItemSchema = z.object({
  title:       z.string().min(1).max(100),
  category:    z.string().max(60),
  description: z.string().min(1).max(500),
  tags:        z.array(z.string().min(1).max(40)).max(15),
  match:       z.string().max(10),
  episode:     z.string().max(20),
}).strict();

export const projectsSchema = z.array(projectItemSchema).max(20);

export const footerSchema = z.object({
  github:    z.string().max(200).refine(isGithubUrl,
               { message: 'Must be a valid https://github.com/... URL' }),
  linkedin:  z.string().max(200).refine(isLinkedinUrl,
               { message: 'Must be a valid https://linkedin.com/in/... URL' }),
  email:     z.string().max(254).refine(isEmail,
               { message: 'Must be a valid email address' }),
  location:  z.string().max(80),
  copyright: z.string().max(80),
}).strict();

export const contactSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName:  z.string().min(1).max(80),
  email:     z.string().max(254).refine(isEmail, { message: 'Invalid email address' }),
  message:   z.string().min(1).max(2000),
  honeypot:  z.string().max(200).optional(),
}).strict();

// ── Schema map (keyed by route section param) ─────────────────────────────────

export const SCHEMAS = {
  hero:      heroSchema,
  about:     aboutSchema,
  expertise: expertiseSchema,
  skills:    skillsSchema,
  projects:  projectsSchema,
  footer:    footerSchema,
};
