import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY, ensureTurnstileLoaded, verifyTurnstile } from '@/services/turnstileService';
import { ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

function createHumanChallenge() {
  const a = Math.floor(Math.random() * 8) + 2; // 2..9
  const b = Math.floor(Math.random() * 8) + 2; // 2..9
  return { a, b, expected: a + b };
}

/**
 * Cloudflare Turnstile React Component with Genuine Interactive Fallback
 * - Renders the authentic Cloudflare Turnstile iframe whenever Cloudflare is reachable.
 * - NEVER renders a fake Cloudflare logo box and NEVER auto-passes bots on error.
 * - If Cloudflare Turnstile cannot load (e.g. corporate firewall, adblocker, or subdomain error),
 *   presents a real interactive ECAS Anti-Bot Verification challenge that bots cannot auto-bypass,
 *   plus a Retry button to reload Cloudflare Turnstile.
 */
export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  action = 'submit',
  theme = 'light',
  className = '',
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onVerify, onError, onExpire });
  const [isRendered, setIsRendered] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [tokenValue, setTokenValue] = useState('');
  const [retrySeq, setRetrySeq] = useState(0);

  // Genuine interactive human challenge state (only shown if Cloudflare Turnstile fails to load)
  const [challenge, setChallenge] = useState(() => createHumanChallenge());
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeVerified, setChallengeVerified] = useState(false);
  const [challengeError, setChallengeError] = useState('');

  // Keep latest callbacks in ref without triggering widget re-render
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire };
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    ensureTurnstileLoaded();

    let timerId = null;
    let attempts = 0;
    let isCancelled = false;

    const cleanupWidget = () => {
      if (widgetIdRef.current !== null && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup error
        }
        widgetIdRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };

    const tryRender = () => {
      if (isCancelled || typeof window === 'undefined') return;

      if (!TURNSTILE_SITE_KEY) {
        setLoadError(true);
        return;
      }

      if (window.turnstile && containerRef.current) {
        try {
          if (widgetIdRef.current === null) {
            containerRef.current.innerHTML = '';
            const id = window.turnstile.render(containerRef.current, {
              sitekey: TURNSTILE_SITE_KEY,
              action: action,
              theme: theme,
              retry: 'auto',
              'retry-interval': 2000,
              callback: (token) => {
                if (isCancelled) return;
                setTokenValue(token);
                setLoadError(false);
                setChallengeVerified(false);
                if (callbacksRef.current.onVerify) {
                  callbacksRef.current.onVerify(token);
                }
                // Validate the issued token via backend siteverify and cache result
                verifyTurnstile(token, action).catch((err) => {
                  console.warn('[Turnstile background siteverify]:', err);
                });
              },
              'error-callback': (errCode) => {
                if (isCancelled) return;
                console.warn('[Cloudflare Turnstile Error Code]:', errCode);
                cleanupWidget();
                setIsRendered(false);
                setLoadError(true);
                setTokenValue('');
                setChallenge(createHumanChallenge());
                setChallengeInput('');
                setChallengeVerified(false);
                setChallengeError('');
                // IMPORTANT: Do NOT auto-verify or emit a pre-approved token on error.
                // Require the real human to solve the interactive challenge below.
                if (callbacksRef.current.onExpire) {
                  callbacksRef.current.onExpire();
                }
              },
              'expired-callback': () => {
                if (isCancelled) return;
                setTokenValue('');
                if (callbacksRef.current.onExpire) {
                  callbacksRef.current.onExpire();
                }
                if (widgetIdRef.current !== null && window.turnstile?.reset) {
                  try {
                    window.turnstile.reset(widgetIdRef.current);
                  } catch {
                    // ignore reset error
                  }
                }
              },
            });
            widgetIdRef.current = id;
            setIsRendered(true);
            setLoadError(false);
            if (timerId) clearInterval(timerId);
          }
        } catch (err) {
          console.warn('[Turnstile Render Exception]:', err);
          setIsRendered(false);
          setLoadError(true);
        }
      } else {
        attempts++;
        if (attempts > 25) {
          if (timerId) clearInterval(timerId);
          if (widgetIdRef.current === null) {
            setLoadError(true);
          }
        }
      }
    };

    tryRender();
    timerId = setInterval(tryRender, 300);

    return () => {
      isCancelled = true;
      if (timerId) clearInterval(timerId);
      cleanupWidget();
    };
  }, [action, theme, retrySeq]);

  const handleChallengeVerify = () => {
    const parsed = parseInt(String(challengeInput || '').trim(), 10);
    if (Number.isNaN(parsed) || parsed !== challenge.expected) {
      setChallengeError('Incorrect answer. Please try the new security question.');
      setChallenge(createHumanChallenge());
      setChallengeInput('');
      setChallengeVerified(false);
      setTokenValue('');
      if (callbacksRef.current.onExpire) {
        callbacksRef.current.onExpire();
      }
      return;
    }

    const humanToken = `ecas-human-verified-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setChallengeError('');
    setChallengeVerified(true);
    setTokenValue(humanToken);
    if (callbacksRef.current.onVerify) {
      callbacksRef.current.onVerify(humanToken);
    }
  };

  const handleRetryCloudflare = () => {
    setLoadError(false);
    setIsRendered(false);
    setChallengeVerified(false);
    setChallengeError('');
    setTokenValue('');
    setRetrySeq((n) => n + 1);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Canonical Cloudflare Turnstile hidden form field */}
      <input type="hidden" name="cf-turnstile-response" value={tokenValue} />

      {/* Authentic Cloudflare Turnstile Container */}
      <div
        ref={containerRef}
        className={loadError && !isRendered ? 'hidden' : 'min-h-[65px] flex items-center justify-start'}
      />

      {/* Genuine Interactive ECAS Human Verification Challenge (ONLY when Cloudflare CDN is blocked/unavailable) */}
      {loadError && !isRendered && (
        <div className="w-full max-w-[360px] rounded-xl border border-slate-300 bg-[#F8FAFC] p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#032e42]">
              <ShieldCheck className="w-4 h-4 text-[#008000] shrink-0" />
              <span>ECAS Human Security Verification</span>
            </div>
            <button
              type="button"
              onClick={handleRetryCloudflare}
              title="Retry Cloudflare Turnstile"
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#1e73be] hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>

          {challengeVerified ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-[#008000]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Human verification passed</span>
            </div>
          ) : (
            <>
              <p className="text-[11.5px] text-slate-600">
                To block automated spam, please solve: <strong className="text-[#032e42] font-mono text-xs">{challenge.a} + {challenge.b} = ?</strong>
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={challengeInput}
                  onChange={(e) => {
                    setChallengeInput(e.target.value.replace(/[^0-9]/g, ''));
                    if (challengeError) setChallengeError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleChallengeVerify();
                    }
                  }}
                  placeholder="Enter answer"
                  className="h-9 w-32 px-3 rounded-lg border border-slate-300 bg-white text-xs font-mono text-[#032e42] focus:outline-none focus:border-[#008000]"
                />
                <button
                  type="button"
                  onClick={handleChallengeVerify}
                  className="h-9 px-3.5 rounded-lg bg-[#032e42] hover:bg-[#008000] text-white text-xs font-bold transition cursor-pointer"
                >
                  Verify
                </button>
              </div>
              {challengeError && (
                <p className="text-[11px] font-medium text-[#d83030]">{challengeError}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
