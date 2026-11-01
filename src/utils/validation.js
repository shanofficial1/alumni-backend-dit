
import { z } from 'zod';

const statuses = [
  'Employed',
  'Self-employed',
  'Entrepreneur',
  'Higher Studies',
  'Unemployed'
];

const companyStatuses = [
  'Employed',
  'Self-employed',
  'Entrepreneur'
];

const urlOrEmpty = z.string().trim().optional().or(z.literal('')).refine((value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}, 'Enter a valid URL including https://');

export const registerSchema = z.object({
  fullName: z.string().trim().min(3).max(80)
    .regex(/^[\p{L}\s.'-]+$/u, 'Use letters only'),

  email: z.string().trim().email().transform(v => v.toLowerCase()),

  password: z.string().min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),

  mobile: z.string().trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),

  program: z.string().trim().min(1),
  batch: z.string().trim().min(1),
  workingStatus: z.enum(statuses),
  company: z.string().trim().max(120).optional().default(''),
  companyWebsite: urlOrEmpty,
  linkedinProfile: urlOrEmpty
}).superRefine((data, ctx) => {
  if ([...companyStatuses, 'Higher Studies'].includes(data.workingStatus) && !data.company?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['company'],
      message: 'Company / organisation is required'
    });
  }

  if (data.linkedinProfile && !data.linkedinProfile.includes('linkedin.com')) {
    ctx.addIssue({
      code: 'custom',
      path: ['linkedinProfile'],
      message: 'Enter a valid LinkedIn profile URL'
    });
  }
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Profile updates intentionally exclude email, password and role.
export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(3).max(80)
    .regex(/^[\p{L}\s.'-]+$/u, 'Use letters only'),

  mobile: z.string().trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),

  program: z.string().trim().min(1),
  batch: z.string().trim().min(1),
  workingStatus: z.enum(statuses),
  company: z.string().trim().max(120).optional().default(''),
  companyWebsite: urlOrEmpty,
  linkedinProfile: urlOrEmpty
}).superRefine((data, ctx) => {
  if ([...companyStatuses, 'Higher Studies'].includes(data.workingStatus) && !data.company?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['company'],
      message: 'Company / institution name is required'
    });
  }

  if (data.linkedinProfile && !data.linkedinProfile.includes('linkedin.com')) {
    ctx.addIssue({
      code: 'custom',
      path: ['linkedinProfile'],
      message: 'Enter a valid LinkedIn profile URL'
    });
  }
});
