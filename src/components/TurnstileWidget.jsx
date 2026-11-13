import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '@/services/turnstileService';
import { ShieldCheck, Check } from 'lucide-react';

/**
 * Cloudflare Turnstile React Component
 * Supports both automatic Cloudflare Turnstile widget and local dev fallback
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
  const [isRendered, setIsRendered] = useState(false);
  const [fallbackChecked, setFallbackChecked] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let timerId = null;
    let attempts = 0;

    const tryRender = () => {
      if (typeof window === 'undefined') return;

      if (!TURNSTILE_SITE_KEY) {
        setLoadError(true);
        return;
      }

      if (window.turnstile && containerRef.current) {
        try {
          if (widgetIdRef.current === null && !containerRef.current.hasChildNodes()) {
            const id = window.turnstile.render(containerRef.current, {
              sitekey: TURNSTILE_SITE_KEY,
              action: action,
              theme: theme,
              callback: (token) => {
                if (onVerify) onVerify(token);
              },
              'error-callback': (err) => {
                console.warn('[Cloudflare Turnstile Error]', err);
                setLoadError(true);
                if (onError) onError(err);
              },
              'expired-callback': () => {
                if (onExpire) onExpire();
              },
            });
            widgetIdRef.current = id;
            setIsRendered(true);
            if (timerId) clearInterval(timerId);
          }
        } catch (err) {
          console.warn('[Turnstile Render Exception]', err);
          setLoadError(true);
        }
      } else {
        attempts++;
        if (attempts > 30) {
          if (timerId) clearInterval(timerId);
          if (!isRendered) {
            setLoadError(true);
          }
        }
      }
    };

    tryRender();
    timerId = setInterval(tryRender, 300);

    return () => {
      if (timerId) clearInterval(timerId);
      if (widgetIdRef.current !== null && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore
        }
      }
    };
  }, [action, theme, onVerify, onError, onExpire]);

  const handleManualFallback = () => {
    setFallbackChecked(true);
    if (onVerify) {
      onVerify(`dev-turnstile-token-${Date.now()}`);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Cloudflare Turnstile Container */}
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-start" />

      {/* Graceful Fallback if Cloudflare Turnstile is blocked or in local development */}
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
              {fallbackChecked ? 'Human Verified' : 'Verify you are human'}
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

