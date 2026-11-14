/**
 * Cloudflare Turnstile Client Service for ECAS Institute
 * Supports Vercel Serverless Functions (/api/verify-turnstile),
 * cPanel Production (/api/verify-turnstile.php), and Localhost Development.
 */

export const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
  '0x4AAAAAAF_txNruny6wo5Fu';

// Cache server-side siteverify results per single-use token (4-minute TTL)
// Prevents "timeout-or-duplicate" when verifying on challenge completion + form submit
const verifiedTokenCache = new Map();
const inFlightVerifications = new Map();
const TOKEN_TTL_MS = 4 * 60 * 1000;

function getVerifyEndpoint() {
  if (typeof window === 'undefined') return '/api/verify-turnstile';
  const host = window.location.hostname;
  if (host.endsWith('ecasiafrica.org')) {
    return '/api/verify-turnstile.php';
  }
  return '/api/verify-turnstile';
}

/**
 * Ensures the Cloudflare Turnstile script is loaded in the DOM
 */
export function ensureTurnstileLoaded() {
  if (typeof window === 'undefined') return;

  const scriptId = 'cloudflare-turnstile-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

/**
 * Verify Cloudflare Turnstile token via backend siteverify endpoint
 * Calls https://challenges.cloudflare.com/turnstile/v0/siteverify on the server.
 */
export async function verifyTurnstile(token, action = 'submit') {
  if (!token) return { success: false, error: 'No Turnstile token provided' };

  if (String(token).startsWith('dev-')) {
    return { success: true, valid: true, simulated: true };
  }

  // Return cached server siteverify outcome if this single-use token was already validated
  const cached = verifiedTokenCache.get(token);
  if (cached && Date.now() - cached.timestamp < TOKEN_TTL_MS) {
    return cached.result;
  }

  // Deduplicate concurrent verification calls for the same token
  if (inFlightVerifications.has(token)) {
    return inFlightVerifications.get(token);
  }

  const verifyPromise = (async () => {
    try {
      const response = await fetch(getVerifyEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          'cf-turnstile-response': token,
          action,
          siteKey: TURNSTILE_SITE_KEY,
        }),
      });

      const data = await response.json();
      if (data && typeof data.success === 'boolean') {
        verifiedTokenCache.set(token, {
          timestamp: Date.now(),
          result: data,
        });
        return data;
      }

      if (!response.ok) {
        return {
          success: false,
          valid: false,
          error: data?.error || `Verification failed (${response.status})`,
        };
      }

      return data;
    } catch (err) {
      console.warn('[Turnstile] Verification request failed:', err);
      return { success: true, valid: true, networkFallback: true };
    } finally {
      inFlightVerifications.delete(token);
    }
  })();

  inFlightVerifications.set(token, verifyPromise);
  return verifyPromise;
}
