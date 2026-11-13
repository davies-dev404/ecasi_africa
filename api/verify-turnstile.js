/* global process */
/**
 * Vercel Serverless Function: Verify Cloudflare Turnstile Token
 *
 * Endpoint: /api/verify-turnstile
 * Method: POST
 * Cloudflare Canonical siteverify API: https://challenges.cloudflare.com/turnstile/v0/siteverify
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = req.body || {};
    const token = body.token || body['cf-turnstile-response'];
    const action = body.action || 'submit';

    if (!token) {
      return res.status(400).json({ success: false, error: 'Turnstile token is required' });
    }

    // Dev/simulated token pass-through
    if (token.startsWith('dev-')) {
      return res.status(200).json({
        success: true,
        valid: true,
        action,
        environment: 'development',
      });
    }

    const secretKey =
      process.env.TURNSTILE_SECRET_KEY ||
      '';

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress;

    if (secretKey) {
      // Call Cloudflare siteverify endpoint
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);
      if (clientIp) {
        formData.append('remoteip', clientIp);
      }

      const cfResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const outcome = await cfResponse.json();

      if (outcome.success) {
        return res.status(200).json({
          success: true,
          valid: true,
          challenge_ts: outcome.challenge_ts,
          hostname: outcome.hostname,
          action: outcome.action,
        });
      } else {
        console.warn('[Cloudflare Turnstile Verification Failed]', outcome['error-codes']);
        return res.status(200).json({
          success: false,
          valid: false,
          errorCodes: outcome['error-codes'] || ['invalid-token'],
          error: 'Verification failed or token expired. Please retry.',
        });
      }
    }

    // Fallback if secret key is not set yet in Vercel environment variables
    return res.status(200).json({
      success: true,
      valid: true,
      devMode: true,
      message: 'Token received. For live validation, configure TURNSTILE_SECRET_KEY in Vercel.',
    });
  } catch (err) {
    console.error('[Turnstile Serverless Error]', err);
    return res.status(500).json({
      success: true,
      valid: true,
      fallback: true,
      error: err.message,
    });
  }
}

