/**
 * Compatibility handler for /api/verify-recaptcha -> Cloudflare Turnstile
 */
import turnstileHandler from './verify-turnstile.js';

export default function handler(req, res) {
  return turnstileHandler(req, res);
}
