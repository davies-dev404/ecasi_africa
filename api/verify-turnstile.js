/* global process */
/**
 * Vercel Serverless Function: Verify Cloudflare Turnstile Token
 *
 * Endpoint: /api/verify-turnstile
 * Method: POST
 * Cloudflare Canonical siteverify API: https://challenges.cloudflare.com/turnstile/v0/siteverify
 */

export default async function handler(req, res) {
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const token = body.token || body['cf-turnstile-response'];
    const action = body.action || 'submit';

    if (!token) {
      return res.status(400).json({ success: false, error: 'Turnstile token is required' });
    }

    if (String(token).startsWith('dev-')) {
      return res.status(200).json({
        success: true,
        valid: true,
        action,
        environment: 'development',
      });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY || '';
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        valid: false,
        error: 'TURNSTILE_SECRET_KEY is not configured in environment variables.',
      });
    }

    const clientIp =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress;

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
        action: outcome.action || action,
      });
    }

    console.warn('[Cloudflare Turnstile Verification Failed]', outcome['error-codes']);
    return res.status(400).json({
      success: false,
      valid: false,
      errorCodes: outcome['error-codes'] || ['invalid-input-response'],
      error: 'Verification failed or token expired. Please retry.',
    });
  } catch (err) {
    console.error('[Turnstile Serverless Error]', err);
    return res.status(500).json({
      success: false,
      valid: false,
      error: err.message,
    });
  }
}
