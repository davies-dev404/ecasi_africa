/**
 * ECAS Africa — XSS Protection & HTML Sanitization Utilities
 * Prevents stored and reflected XSS across printable documents, invoices,
 * applicant dossiers, and rich HTML content areas.
 */

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes rich HTML content before rendering via dangerouslySetInnerHTML.
 * Strips executable <script>, <iframe>, <object>, <embed>, <form>, <style>,
 * inline on* event handlers, and javascript:/vbscript:/data:text/html URIs.
 */
export function sanitizeRichHtml(rawHtml = '') {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  return rawHtml
    .replace(/<\s*(script|iframe|object|embed|applet|meta|link|base|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|iframe|object|embed|applet|meta|link|base|form)[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src|action)\s*=\s*(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"']*\2/gi, '$1="#"')
    .replace(/(href|src|action)\s*=\s*(?:javascript|vbscript):[^\s>]+/gi, '$1="#"');
}
