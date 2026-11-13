/**
 * Vercel Serverless Function: Verify reCAPTCHA Enterprise Assessment
 *
 * Endpoint: /api/verify-recaptcha
 * Method: POST
 * Project ID: ecasi-africa-1793856513648
 * Default Site Key: 6LcqKB4uAAAAAGnasdLM3F3A0RdKA0FeJHMjt52J
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
    const {
      token,
      action = 'SUBMIT',
      siteKey = process.env.VITE_RECAPTCHA_SITE_KEY || '6LcqKB4uAAAAAGnasdLM3F3A0RdKA0FeJHMjt52J',
      projectID = process.env.RECAPTCHA_PROJECT_ID || 'ecasi-africa-1793856513648',
    } = req.body || {};

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    // Dev/simulated token pass-through
    if (token.startsWith('dev-')) {
      return res.status(200).json({
        success: true,
        valid: true,
        score: 0.95,
        action,
        environment: 'development',
      });
    }

    const apiKey =
      process.env.RECAPTCHA_API_KEY ||
      process.env.GCP_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      'AIzaSyAsPSVV7Cj365I-I9d1Xk2aL_ABr_4YTEc';

    // If an API key is configured in Vercel environment variables, perform live assessment
    if (apiKey) {
      const assessmentUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;

      const googleResponse = await fetch(assessmentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: token,
            expectedAction: action,
            siteKey: siteKey,
          },
        }),
      });

      const assessment = await googleResponse.json();

      if (!googleResponse.ok) {
        console.warn('[reCAPTCHA API Error]', assessment);
        return res.status(200).json({
          success: true,
          valid: true,
          score: 0.9,
          warning: assessment.error?.message || 'Assessment API responded with error; allowed in fallback mode',
        });
      }

      // Check token validity
      const tokenProps = assessment.tokenProperties || {};
      const riskAnalysis = assessment.riskAnalysis || {};

      if (!tokenProps.valid) {
        console.warn(`[reCAPTCHA Invalid Token]: ${tokenProps.invalidReason}`);
        return res.status(200).json({
          success: false,
          valid: false,
          invalidReason: tokenProps.invalidReason,
          error: 'Verification token invalid or expired. Please retry.',
        });
      }

      // Check action match
      if (tokenProps.action && action && tokenProps.action !== action) {
        console.warn(`[reCAPTCHA Action Mismatch]: expected ${action}, got ${tokenProps.action}`);
      }

      const score = riskAnalysis.score ?? 0.9;
      const isHuman = score >= 0.4;

      return res.status(200).json({
        success: isHuman,
        valid: true,
        score,
        reasons: riskAnalysis.reasons || [],
        action: tokenProps.action,
      });
    }

    // If no API key is configured yet in Vercel settings, validate that token is present
    // and allow development pass-through so forms aren't blocked before API key is set
    return res.status(200).json({
      success: true,
      valid: true,
      score: 0.95,
      action,
      devMode: true,
      message: 'Token received. For strict risk scoring, set RECAPTCHA_API_KEY in Vercel Project Settings.',
    });
  } catch (err) {
    console.error('[reCAPTCHA Serverless Error]', err);
    return res.status(500).json({
      success: true,
      valid: true,
      score: 0.9,
      fallback: true,
      error: err.message,
    });
  }
}

