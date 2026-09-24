import crypto from 'crypto';

const SALT = process.env.PHONE_HASH_SALT || 'networkcheck_nigeria_telecom_salt_2026';

/**
 * Creates a deterministic SHA-256 hash of a normalized MSISDN
 * Enables duplicate detection without storing raw citizen phone numbers
 */
export function hashPhoneNumber(phone: string): string {
  if (!phone) return '';
  const normalized = phone.trim().replace(/\s+/g, '').replace(/^[+]/, '');
  return crypto.createHmac('sha256', SALT).update(normalized).digest('hex');
}

/**
 * Masks a phone number for privacy safe display in admin audits
 * e.g. +2348031234567 -> +234 803 *** 4567
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '+234 *** *** ****';
  const cleaned = phone.trim().replace(/\s+/g, '');
  if (cleaned.length < 8) return '***';

  // Format Nigerian number nicely: e.g. +2348031234567 or 08031234567
  if (cleaned.startsWith('+234') && cleaned.length >= 13) {
    const prefix = `+234 ${cleaned.slice(4, 7)}`;
    const suffix = cleaned.slice(-4);
    return `${prefix} *** ${suffix}`;
  }

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const prefix = `0${cleaned.slice(1, 4)}`;
    const suffix = cleaned.slice(-4);
    return `${prefix} *** ${suffix}`;
  }

  const prefix = cleaned.slice(0, Math.min(6, cleaned.length - 4));
  const suffix = cleaned.slice(-4);
  return `${prefix} *** ${suffix}`;
}

/**
 * Generates a human-friendly unique reference code for community reports
 * e.g. NC-10482
 */
export function generateReference(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `NC-${randomNum}`;
}
