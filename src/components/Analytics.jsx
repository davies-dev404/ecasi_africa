import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import Clarity from '@microsoft/clarity';

// Environment variables or fallback defaults
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || 'YOUR_META_PIXEL_ID';
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || 'z8r4lta50m';
const CLOUDFLARE_BEACON_TOKEN = import.meta.env.VITE_CLOUDFLARE_BEACON_TOKEN || '11c976ef086b4f4e859a8634d7e65a65';

const Analytics = () => {
  const location = useLocation();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // 1. Google Analytics (GA4)
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      try {
        ReactGA.initialize(GA_MEASUREMENT_ID);
      } catch (err) {
        console.warn('GA4 Initialization Error:', err);
      }
    }

    // 2. Meta Pixel (Facebook Pixel)
    if (META_PIXEL_ID && META_PIXEL_ID !== 'YOUR_META_PIXEL_ID') {
      try {
        (function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', META_PIXEL_ID);
        window.fbq('track', 'PageView');
      } catch (err) {
        console.warn('Meta Pixel Initialization Error:', err);
      }
    }

    // 3. Microsoft Analytics (Microsoft Clarity)
    if (CLARITY_PROJECT_ID && CLARITY_PROJECT_ID !== 'YOUR_CLARITY_PROJECT_ID') {
      try {
        Clarity.init(CLARITY_PROJECT_ID);
      } catch (err) {
        console.warn('Microsoft Clarity Initialization Error:', err);
      }
    }

    // 4. Cloudflare Web Analytics (Disabled on localhost to avoid CORS preflight errors with cdn-cgi/rum)
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local'));

    if (!isLocalhost && CLOUDFLARE_BEACON_TOKEN && CLOUDFLARE_BEACON_TOKEN !== 'YOUR_CLOUDFLARE_BEACON_TOKEN') {
      try {
        const script = document.createElement('script');
        script.defer = true;
        script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
        script.setAttribute('data-cf-beacon', JSON.stringify({ token: CLOUDFLARE_BEACON_TOKEN }));
        document.head.appendChild(script);
      } catch (err) {
        console.warn('Cloudflare Web Analytics Initialization Error:', err);
      }
    }
  }, []);

  // Track pageviews on route navigation for SPA
  useEffect(() => {
    const path = location.pathname + location.search;

    // GA4 Pageview
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      try {
        ReactGA.send({ hitType: 'pageview', page: path });
      } catch {
        // Ignore uninitialized errors
      }
    }

    // Meta Pixel Pageview
    if (META_PIXEL_ID && META_PIXEL_ID !== 'YOUR_META_PIXEL_ID' && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'PageView');
      } catch {
        // Ignore errors
      }
    }
  }, [location]);

  return null;
};

export default Analytics;
