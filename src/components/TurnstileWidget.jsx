import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY, ensureTurnstileLoaded, verifyTurnstile } from '@/services/turnstileService';
import { RefreshCw } from 'lucide-react';

/**
 * Authentic Cloudflare Turnstile React Component
 * Renders ONLY the real Cloudflare Turnstile iframe (no fake checkboxes, no math challenges).
 * Uses stable callback refs so parent form typing never destroys or re-initializes the widget.
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
  const [tokenValue, setTokenValue] = useState('');
  const [scriptFailed, setScriptFailed] = useState(false);
  const [turnstileErrorCode, setTurnstileErrorCode] = useState('');
  const [retrySeq, setRetrySeq] = useState(0);

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
        setScriptFailed(true);
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
              'refresh-expired': 'auto',
              callback: (token) => {
                if (isCancelled) return;
                setTokenValue(token);
                setScriptFailed(false);
                setTurnstileErrorCode('');
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
                setTokenValue('');
                setTurnstileErrorCode(String(errCode || ''));
                if (callbacksRef.current.onExpire) {
                  callbacksRef.current.onExpire();
                }
                if (callbacksRef.current.onError) {
                  callbacksRef.current.onError(errCode);
                }
                // Keep the real Cloudflare widget mounted so Cloudflare's retry:'auto' can recover
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
            setScriptFailed(false);
            if (timerId) clearInterval(timerId);
          }
        } catch (err) {
          console.warn('[Turnstile Render Exception]:', err);
          setScriptFailed(true);
        }
      } else {
        attempts++;
        if (attempts > 35) {
          if (timerId) clearInterval(timerId);
          if (widgetIdRef.current === null) {
            setScriptFailed(true);
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

  const handleRetry = () => {
    setScriptFailed(false);
    setTurnstileErrorCode('');
    setTokenValue('');
    if (widgetIdRef.current !== null && window.turnstile?.reset) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        return;
      } catch {
        // fall through to re-mount
      }
    }
    setRetrySeq((n) => n + 1);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Canonical Cloudflare Turnstile hidden form field */}
      <input type="hidden" name="cf-turnstile-response" value={tokenValue} />

      {/* Authentic Cloudflare Turnstile Widget Container */}
      <div
        ref={containerRef}
        className="min-h-[65px] flex items-center justify-start"
      />

      {(scriptFailed || turnstileErrorCode) && (
        <div className="flex items-center gap-2 text-[11.5px] text-slate-600">
          <span>
            {scriptFailed
              ? 'Unable to load Cloudflare Turnstile security check.'
              : `Cloudflare Turnstile could not verify (code ${turnstileErrorCode}).`}
          </span>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1 text-[#1e73be] font-semibold hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reload Cloudflare
          </button>
        </div>
      )}
    </div>
  );
}
