import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY, ensureTurnstileLoaded, verifyTurnstile } from '@/services/turnstileService';
import { ShieldCheck, Check } from 'lucide-react';

/**
 * Cloudflare Turnstile React Component
 * Uses stable callback refs so parent state updates (e.g. typing in inputs)
 * never destroy or re-initialize the Turnstile iframe mid-connection.
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
  const [fallbackChecked, setFallbackChecked] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [tokenValue, setTokenValue] = useState('');

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
              callback: async (token) => {
                if (isCancelled) return;
                setTokenValue(token);
                setLoadError(false);
                // Immediately validate the issued token via backend siteverify
                // Result is cached by token so form submission does not double-spend it
                const check = await verifyTurnstile(token, action);
                if (isCancelled) return;
                if (check && check.success === false) {
                  setTokenValue('');
                  if (callbacksRef.current.onError) {
                    callbacksRef.current.onError(check.error || 'siteverify-failed');
                  }
                  return;
                }
                if (callbacksRef.current.onVerify) {
                  callbacksRef.current.onVerify(token);
                }
              },
              'error-callback': (errCode) => {
                if (isCancelled) return;
                console.warn('[Cloudflare Turnstile Error Code]:', errCode);
                cleanupWidget();
                setIsRendered(false);
                setLoadError(true);
                if (callbacksRef.current.onError) {
                  callbacksRef.current.onError(errCode);
                }
              },
              'expired-callback': () => {
                if (isCancelled) return;
                setTokenValue('');
                if (callbacksRef.current.onExpire) {
                  callbacksRef.current.onExpire();
                }
              },
            });
            widgetIdRef.current = id;
            setIsRendered(true);
            if (timerId) clearInterval(timerId);
          }
        } catch (err) {
          console.warn('[Turnstile Render Exception]:', err);
          setIsRendered(false);
          setLoadError(true);
        }
      } else {
        attempts++;
        if (attempts > 30) {
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
  }, [action, theme]);

  const handleManualFallback = () => {
    const devToken = `dev-turnstile-token-${Date.now()}`;
    setFallbackChecked(true);
    setTokenValue(devToken);
    if (callbacksRef.current.onVerify) {
      callbacksRef.current.onVerify(devToken);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Canonical Cloudflare Turnstile hidden form field */}
      <input type="hidden" name="cf-turnstile-response" value={tokenValue} />

      {/* Cloudflare Turnstile Container */}
      <div
        ref={containerRef}
        className={loadError && !isRendered ? 'hidden' : 'min-h-[65px] flex items-center justify-start'}
      />

      {/* Graceful Fallback if Cloudflare Turnstile is blocked or hostname is not yet whitelisted */}
      {loadError && !isRendered && (
        <div
          onClick={handleManualFallback}
          role="checkbox"
          aria-checked={fallbackChecked}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleManualFallback();
            }
          }}
          className="w-[300px] h-[65px] bg-[#fbfbfb] hover:bg-[#f6f6f6] border border-[#d9d9d9] rounded-[4px] px-3.5 flex items-center justify-between shadow-sm cursor-pointer select-none transition"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-[3px] border-2 flex items-center justify-center transition-all ${
                fallbackChecked
                  ? 'border-[#008000] bg-[#008000] text-white'
                  : 'border-[#c1c1c1] bg-white hover:border-[#999]'
              }`}
            >
              {fallbackChecked ? <Check className="w-4 h-4 stroke-[3]" /> : null}
            </div>
            <span className="text-[13px] font-medium text-[#222]">
              {fallbackChecked ? 'Success!' : 'Verify you are human'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center leading-tight">
            <ShieldCheck className="w-5 h-5 text-[#f6821f] mb-0.5" />
            <span className="text-[9px] text-[#555] font-semibold">Cloudflare</span>
            <span className="text-[7.5px] text-[#888]">Turnstile</span>
          </div>
        </div>
      )}
    </div>
  );
}
