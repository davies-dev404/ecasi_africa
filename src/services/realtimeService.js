import { io } from 'socket.io-client';

const INSTANCE_ID = `cli_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function getSocketEndpointConfig() {
  if (typeof window === 'undefined') return { enabled: false, url: undefined };
  const explicitUrl = import.meta.env?.VITE_SOCKET_URL || '';
  if (explicitUrl) {
    return { enabled: true, url: explicitUrl };
  }
  const host = window.location.hostname || '';
  const port = String(window.location.port || '');
  // Connect Socket.IO directly during Vite dev (proxied to server/realtime.js) or dedicated local ports
  if (host === 'localhost' || host === '127.0.0.1' || port === '5173' || port === '4173' || port === '8080') {
    return { enabled: true, url: undefined };
  }
  return { enabled: false, url: undefined };
}

function getSseEndpoint() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname || '';
  if (host.endsWith('ecasiafrica.org')) {
    return '/api/msimamizi-sync.php?scope=stream';
  }
  return '';
}

class EcasiRealtimeService {
  constructor() {
    this._listeners = new Set();
    this._socket = null;
    this._eventSource = null;
    this._channel = null;
    this._transportState = 'idle';
    this._lastVersion = 0;
    this._initialized = false;
  }

  _notifyListeners(eventData) {
    const evt = {
      topic: String(eventData?.topic || 'sync'),
      sourceId: eventData?.sourceId || 'server',
      payload: eventData?.payload || null,
      version: eventData?.version || null,
      ts: eventData?.ts || Date.now(),
    };
    this._listeners.forEach((cb) => {
      try {
        cb(evt);
      } catch {
        // isolate subscriber errors
      }
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ecasi_realtime_event', { detail: evt }));
    }
  }

  init() {
    if (typeof window === 'undefined' || this._initialized) return;
    this._initialized = true;

    // 1. Cross-tab BroadcastChannel (zero-latency same-browser tab sync)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this._channel = new BroadcastChannel('ecasi_realtime_bus');
        this._channel.onmessage = (ev) => {
          const msg = ev?.data;
          if (!msg || typeof msg !== 'object') return;
          if (msg.sourceId === INSTANCE_ID) return;
          this._notifyListeners(msg);
        };
      } catch {
        this._channel = null;
      }
    }

    // 2. Socket.IO Client (when running with Node Socket.IO server / VITE_SOCKET_URL)
    const sockCfg = getSocketEndpointConfig();
    if (sockCfg.enabled) {
      try {
        this._socket = io(sockCfg.url, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 10,
          reconnectionDelay: 1500,
          timeout: 6000,
        });

        this._socket.on('connect', () => {
          this._transportState = 'socket.io';
          this._notifyListeners({ topic: 'transport', payload: { state: 'socket.io' } });
        });

        this._socket.on('realtime:hello', (info) => {
          if (info?.version && this._lastVersion && info.version > this._lastVersion) {
            this._notifyListeners({ topic: info.topic || 'sync', version: info.version });
          }
          if (info?.version) this._lastVersion = Number(info.version);
        });

        this._socket.on('realtime:event', (msg) => {
          if (!msg || msg.sourceId === INSTANCE_ID) return;
          if (msg.version) this._lastVersion = Number(msg.version);
          this._notifyListeners(msg);
        });

        this._socket.on('disconnect', () => {
          if (this._transportState === 'socket.io') {
            this._transportState = this._channel ? 'broadcast' : 'reconnecting';
          }
        });
      } catch {
        this._socket = null;
      }
    }

    // 3. Server-Sent Events stream for cPanel PHP production (realtime cross-device push)
    const sseUrl = getSseEndpoint();
    if (sseUrl && typeof EventSource !== 'undefined') {
      try {
        const es = new EventSource(sseUrl);
        this._eventSource = es;

        es.addEventListener('connected', (ev) => {
          this._transportState = this._socket?.connected ? 'socket.io' : 'sse';
          try {
            const d = JSON.parse(ev.data || '{}');
            if (d.version && this._lastVersion && d.version > this._lastVersion) {
              this._notifyListeners({ topic: d.topic || 'sync', version: d.version });
            }
            if (d.version) this._lastVersion = Number(d.version);
          } catch {
            // ignore
          }
        });

        es.addEventListener('sync_update', (ev) => {
          try {
            const d = JSON.parse(ev.data || '{}');
            if (d.version && Number(d.version) <= this._lastVersion) return;
            if (d.version) this._lastVersion = Number(d.version);
            this._notifyListeners({ topic: d.topic || 'sync', version: d.version, payload: d });
          } catch {
            this._notifyListeners({ topic: 'sync' });
          }
        });
      } catch {
        this._eventSource = null;
      }
    } else if (!sockCfg.enabled && this._channel) {
      this._transportState = 'broadcast';
    }
  }

  publish(topic, payload = null) {
    this.init();
    const packet = {
      topic: String(topic || 'sync'),
      sourceId: INSTANCE_ID,
      payload,
      ts: Date.now(),
    };
    if (this._channel) {
      try {
        this._channel.postMessage(packet);
      } catch {
        // ignore channel errors
      }
    }
    if (this._socket && this._socket.connected) {
      try {
        this._socket.emit('realtime:broadcast', packet);
      } catch {
        // ignore socket errors
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ecasi_realtime_local', { detail: packet }));
    }
  }

  subscribe(listener) {
    this.init();
    if (typeof listener !== 'function') return () => {};
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  getTransportState() {
    this.init();
    if (this._socket?.connected) return 'socket.io';
    if (this._eventSource && this._eventSource.readyState === 1) return 'sse';
    if (this._channel) return 'broadcast';
    return this._transportState;
  }
}

export const realtimeService = new EcasiRealtimeService();
