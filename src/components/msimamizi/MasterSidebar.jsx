import React, { useState, useEffect } from 'react';
import {
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { MASTER_NAV_GROUPS } from './navigationConfig';
import { hasPermission, getRoleDefinition } from '@/services/msimamiziEnterpriseService';

export default function MasterSidebar({
  activeTab,
  onSelectTab,
  currentUser,
  badges = {},
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  publicSiteUrl,
  onLogout,
}) {
  const [collapsedGroups, setCollapsedGroups] = useState(() => ({
    reports_group: true,
    communications_group: true,
    website_group: true,
    admin_group: true,
  }));

  // Automatically expand the group containing the active tab
  useEffect(() => {
    const activeGroup = MASTER_NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeTab));
    if (activeGroup) {
      setCollapsedGroups((prev) => (prev[activeGroup.id] ? { ...prev, [activeGroup.id]: false } : prev));
    }
  }, [activeTab]);

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const roleDef = getRoleDefinition(currentUser?.role);

  const visibleGroups = MASTER_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(currentUser, item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Backdrop overlay for mobile slide-over drawer */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[290px] max-w-[85vw] bg-[#071C2D] text-white flex flex-col justify-between border-r border-white/10 shadow-2xl transition-transform duration-300 ease-out
          md:static md:w-64 md:h-screen md:sticky md:top-0 md:z-30 md:shadow-none md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarCollapsed ? 'md:hidden' : 'md:flex'}
        `}
      >
        {/* Top Branding Header */}
        <div className="relative border-b border-white/10 px-4 pt-5 pb-4 flex flex-col items-center text-center bg-[#071C2D] shrink-0">
          {/* Desktop Minimize Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(true)}
            className="hidden md:flex absolute top-3.5 right-3.5 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Minimize navigation"
            aria-label="Minimize navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Mobile Close Button (Cyan outline MakaziFlow drawer style) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-3.5 right-3.5 p-1.5 rounded-lg border border-[#00B8B0]/60 bg-[#102D49]/70 text-[#00B8B0] hover:bg-[#00B8B0]/20 hover:text-white transition cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-sm flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="ECAS Institute Logo" className="w-full h-full object-contain" />
              </div>
              <div className="font-['Outfit',sans-serif] font-bold text-lg tracking-tight text-white">
                ECAS<span className="text-[#00B8B0]">.Msimamizi</span>
              </div>
            </div>
            <div className="px-3.5 py-0.5 rounded-full border border-[#00B8B0]/50 bg-[#102D49] text-[#00B8B0] text-[10px] font-bold tracking-widest uppercase">
              MSIMAMIZI ERP
            </div>
          </div>
        </div>

        {/* Scrollable Master Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-2 scrollbar-thin">
          {visibleGroups.map((group) => {
            const isAlwaysOpen = group.id === 'dashboard_group';
            const isGroupCollapsed = !isAlwaysOpen && Boolean(collapsedGroups[group.id]);

            return (
              <div key={group.id} className="px-0">
                {!isAlwaysOpen && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-extrabold tracking-widest text-slate-400/80 hover:text-white uppercase transition cursor-pointer"
                  >
                    <span className="truncate">{group.label}</span>
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    )}
                  </button>
                )}

                {!isGroupCollapsed && (
                  <div className="mt-0.5 space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const badgeVal = item.badgeKey ? badges[item.badgeKey] : undefined;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onSelectTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-150 cursor-pointer group ${
                            isActive
                              ? 'bg-[#102D49] text-white font-bold border-l-4 border-[#00B8B0]'
                              : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium border-l-4 border-transparent'
                          }`}
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-[#00B8B0]' : 'text-slate-400 group-hover:text-white'
                              }`}
                            />
                            <span className="text-[13px] truncate">{item.label}</span>
                          </span>
                          {typeof badgeVal === 'number' && badgeVal > 0 && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                item.badgeKey === 'overdueFollowups' || item.badgeKey === 'outstandingInvoices'
                                  ? 'bg-[#DC4545]/20 text-red-300 border border-[#DC4545]/40'
                                  : isActive
                                  ? 'bg-[#00B8B0]/20 text-[#00B8B0] border border-[#00B8B0]/40'
                                  : 'bg-white/10 text-white/75'
                              }`}
                            >
                              {badgeVal}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 bg-[#051422] px-4 py-3 space-y-2.5 shrink-0">
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#00B8B0]" />
              <span>ecasiafrica.org</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
          </a>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#00B8B0]/20 border border-[#00B8B0]/40 flex items-center justify-center text-[#00B8B0] font-bold text-xs shrink-0 uppercase">
                {currentUser?.email ? currentUser.email.substring(0, 2) : 'AD'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{roleDef.label}</p>
                <p className="text-[10px] text-white/55 truncate font-mono">
                  {currentUser?.email || 'admin@ecasiafrica.org'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Logout from Msimamizi"
              className="p-1.5 rounded-lg text-red-300 hover:text-white hover:bg-red-900/40 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] text-[#00B8B0]/90 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00B8B0] shrink-0" />
            <span className="truncate">msimamizi.ecasiafrica.org</span>
          </div>
        </div>
      </aside>
    </>
  );
}
