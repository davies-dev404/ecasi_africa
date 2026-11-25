import React from 'react';
import { AlertTriangle, RotateCcw, LayoutGrid, LogOut } from 'lucide-react';

/**
 * Resilient Error Boundary for ECASIAFRICA Msimamizi Administration Portal.
 * Prevents any module runtime error or stale production JS chunk mismatch from
 * rendering a blank white screen, and gives the administrator immediate recovery
 * controls (return to Overview Dashboard, hard reload, or safe sign-out).
 */
export default class MsimamiziErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ECAS Msimamizi ErrorBoundary caught]:', error, info);

    // Detect Vite/ESBuild stale lazy chunk error after a live production redeploy
    const message = String(error?.message || '');
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('Loading chunk') ||
      message.includes('error loading dynamically imported module');

    if (isChunkError && typeof window !== 'undefined') {
      try {
        const reloadKey = 'msimamizi_chunk_auto_reloaded';
        const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
        if (Date.now() - lastReload > 15000) {
          sessionStorage.setItem(reloadKey, String(Date.now()));
          window.location.reload();
        }
      } catch {
        // ignore storage restrictions
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  clearPersistedTab = () => {
    try {
      localStorage.removeItem('msimamizi_active_tab');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('tab');
        window.history.replaceState(null, '', url.toString());
      }
    } catch {
      // ignore
    }
  };

  handleReturnToDashboard = () => {
    this.clearPersistedTab();
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onRecoverDashboard === 'function') {
      this.props.onRecoverDashboard();
    } else if (typeof window !== 'undefined') {
      window.location.href = window.location.pathname;
    }
  };

  handleHardReload = () => {
    this.clearPersistedTab();
    if (typeof window !== 'undefined') {
      window.location.href = window.location.pathname;
    }
  };

  handleSafeLogout = () => {
    this.clearPersistedTab();
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onRecoverLogout === 'function') {
      this.props.onRecoverLogout();
    } else {
      try {
        sessionStorage.removeItem('ecasi_admin_authenticated');
        sessionStorage.removeItem('ecasi_admin_token');
        sessionStorage.removeItem('ecasi_admin_current_user');
        sessionStorage.removeItem('ecasi_admin_last_activity');
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.location.href = window.location.pathname;
      }
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isFullScreen = this.props.fullScreen;
    const errorMsg = this.state.error?.message || 'An unexpected rendering issue occurred in this section.';

    return (
      <div
        className={
          isFullScreen
            ? 'min-h-screen bg-[#032e42] flex items-center justify-center p-4 font-["Inter",sans-serif]'
            : 'bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center space-y-4'
        }
      >
        <div
          className={
            isFullScreen
              ? 'w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-7 text-center space-y-4'
              : 'max-w-lg mx-auto space-y-4'
          }
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-[#DC4545] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-black text-[#032e42]">
              {this.props.sectionLabel
                ? `Unable to load ${this.props.sectionLabel}`
                : 'Msimamizi Portal Recovery'}
            </h2>
            <p className="text-xs text-[#718096] leading-relaxed">
              This section encountered a temporary issue. Your institutional records and session remain safe. Choose a recovery option below to continue.
            </p>
            <p className="text-[11px] font-mono text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 break-words">
              {errorMsg}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={this.handleReturnToDashboard}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Return to Overview Dashboard</span>
            </button>

            <button
              type="button"
              onClick={this.handleHardReload}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#032e42] hover:bg-[#06405c] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Portal</span>
            </button>

            {isFullScreen && (
              <button
                type="button"
                onClick={this.handleSafeLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Safely</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
