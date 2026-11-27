// Shared Client-Side Anti-Spam, Disposable Email, & Real Organization Validator
// Mirrors server-side enforcement in public/api/security-lib.php & msimamizi-sync.php.

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator2.com', 'mailin8r.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamail.de',
  'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.org',
  '10minutemail.com', '10minutemail.net', '10minemail.com',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempail.com', 'tempinbox.com', 'tempomail.fr',
  'throwawaymail.com', 'trashmail.com', 'trashmail.net', 'trashmail.org', 'mytrashmail.com',
  'getnada.com', 'nada.email', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com',
  'fakemailgenerator.com', 'mintemail.com', 'mytemp.email', 'mohmal.com', 'mailnesia.com',
  'burnermail.io', 'emailondeck.com', '33mail.com', 'inboxbear.com', 'mailcatch.com',
  'harakirimail.com', 'crazymailing.com', 'dropmail.me', 'mailexpire.com', 'mailtothis.com',
  'noclickemail.com', 'nowmymail.com', 'pookmail.com', 'quickinbox.com', 'rcpt.at',
  'sogetthis.com', 'spambox.us', 'spamex.com', 'spamfree24.org', 'spamgourmet.com',
  'spamherelots.com', 'spamhole.com', 'spammotel.com', 'temporaryemail.net',
  'temporaryinbox.com', 'thisisnotmyrealemail.com', 'tmailinator.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'zippymail.info',
  'example.com', 'example.org', 'test.com', 'invalid.com', 'localhost.localdomain',
]);

const PLACEHOLDER_REGEX = /^(test|testing|asdf|qwerty|abc|xyz|aaa|xxx|fake|spam|none|n\/a|na|null|undefined|unknown|sample|demo|admin|root|lorem|ipsum|website visitor)$/i;
const SPAM_CONTENT_REGEX = /(viagra|cialis|casino|porn|crypto\s*giveaway|bitcoin\s*doubler|seo\s*backlink|buy\s*followers|whatsapp\s*hack|t\.me\/|bit\.ly\/|tinyurl\.com\/)/i;

export function getEmailDomain(email) {
  const clean = String(email || '').trim().toLowerCase();
  const at = clean.lastIndexOf('@');
  return at > 0 ? clean.slice(at + 1) : '';
}

export function isDisposableEmail(email) {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;
  // Also catch subdomains of disposable domains (e.g. foo.mailinator.com)
  for (const d of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith(`.${d}`)) return true;
  }
  return false;
}

export function isValidEmailSyntax(email) {
  const clean = String(email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(clean);
}

export function isValidRealName(name) {
  const clean = String(name || '').trim();
  if (clean.length < 2 || clean.length > 80) return false;
  if (PLACEHOLDER_REGEX.test(clean)) return false;
  if (/https?:\/\/|www\.|@/i.test(clean)) return false;
  // Must contain at least 2 real letters
  const letters = clean.replace(/[^A-Za-z\u00C0-\u024F]/g, '');
  if (letters.length < 2) return false;
  // Reject repeated single character like "aaaa"
  if (/^(.)\1{3,}$/i.test(letters)) return false;
  return true;
}

export function isValidRealOrganization(org) {
  const clean = String(org || '').trim();
  if (clean.length < 3 || clean.length > 160) return false;
  if (PLACEHOLDER_REGEX.test(clean)) return false;
  if (/https?:\/\//i.test(clean)) return false;
  const letters = clean.replace(/[^A-Za-z0-9\u00C0-\u024F]/g, '');
  if (letters.length < 3) return false;
  if (/^(.)\1{3,}$/i.test(letters)) return false;
  return true;
}

export function isValidRealPhone(dialCode, phoneNumber) {
  const digits = String(`${dialCode || ''}${phoneNumber || ''}`).replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return false;
  if (/^(\d)\1{6,}$/.test(digits)) return false;
  if (digits.includes('1234567') || digits.includes('0000000')) return false;
  return true;
}

export function validateGenuineRegistration(formData) {
  if (!isValidRealName(formData.firstName)) {
    return 'Please enter a valid real first name.';
  }
  if (!isValidRealName(formData.lastName)) {
    return 'Please enter a valid real last name.';
  }
  if (!isValidRealOrganization(formData.organisation)) {
    return 'Please enter the genuine name of your organization, ministry, NGO, or institution.';
  }
  if (!isValidRealPhone(formData.dialCode, formData.phoneNumber)) {
    return 'Please enter a valid international telephone / WhatsApp number (8–15 digits).';
  }

  const personalEmail = String(formData.personalEmail || '').trim();
  const officialEmail = String(formData.officialEmail || '').trim();
  if (!isValidEmailSyntax(personalEmail)) {
    return 'Please enter a valid email address.';
  }
  if (isDisposableEmail(personalEmail)) {
    return 'Temporary or disposable email addresses (such as Mailinator or YOPmail) are blocked. Please use your real personal or institutional email.';
  }
  if (officialEmail) {
    if (!isValidEmailSyntax(officialEmail)) {
      return 'Please enter a valid official email address.';
    }
    if (isDisposableEmail(officialEmail)) {
      return 'Temporary or disposable official email addresses are not permitted. Please provide a genuine organizational email.';
    }
  }

  const participants = Number(formData.participantsCount) || 1;
  if (participants < 1 || participants > 30) {
    return 'For group bookings above 30 delegates, please contact our admissions office directly at admissions@ecasiafrica.org.';
  }

  const textBundle = `${formData.currentDuties || ''} ${formData.trainingExpectations || ''} ${formData.tailorMadeRequirements || ''}`;
  if (SPAM_CONTENT_REGEX.test(textBundle)) {
    return 'Submission blocked by ECAS anti-spam protection.';
  }

  return null;
}

export function validateGenuineInquiry({ fullName, email, phone, organisation, message }) {
  if (!isValidRealName(fullName)) {
    return 'Please enter your real full name.';
  }
  if (!isValidEmailSyntax(email)) {
    return 'Please provide a valid email address.';
  }
  if (isDisposableEmail(email)) {
    return 'Temporary or disposable email addresses are not permitted. Please use your real institutional or personal email.';
  }
  if (!isValidRealOrganization(organisation)) {
    return 'Please specify your real organization, ministry, NGO, or company name.';
  }
  if (!isValidRealPhone('', phone)) {
    return 'Please provide a valid contact phone or WhatsApp number (8–15 digits).';
  }
  if (SPAM_CONTENT_REGEX.test(`${fullName || ''} ${organisation || ''} ${message || ''}`)) {
    return 'Inquiry blocked by ECAS anti-spam & anti-phishing filter.';
  }
  return null;
}
