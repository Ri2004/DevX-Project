import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Compass,
  Navigation,
  Activity,
  BarChart3,
  Sliders,
  Cpu,
  Newspaper,
  Sun,
  Moon,
  Radio,
  Clock,
  Lock,
  Unlock,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

export function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { currentTab, setCurrentTab, apiStatus, isAdminAuth } = useNavigation();
  const [utcTime, setUtcTime] = useState('');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);

  // Live UTC Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toUTCString().replace('GMT', 'UTC');
      setUtcTime(iso);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Compass, desc: 'Mission overview & quick launch' },
    { id: 'map', label: 'Live Map', icon: Navigation, desc: 'EPSG:3031 Polar Deck.gl engine' },
    { id: 'dashboard', label: 'Analytics', icon: Activity, desc: 'Vessel fuel, ice & hull stress' },
    { id: 'visualizations', label: 'Scientific Data', icon: BarChart3, desc: '316x332 grid & ERA5 vectors' },
    { id: 'architecture', label: 'Architecture', icon: Cpu, desc: 'Hydrodynamic & ML models' },
    { id: 'news', label: 'Polar News', icon: Newspaper, desc: 'Live dispatches & ice bulletins' },
    { id: 'settings', label: 'Admin Settings', icon: Sliders, desc: 'Operational parameters', restricted: true },
  ];

  const handleSelectTab = (tabId) => {
    setCurrentTab(tabId);
    setIsLeftDrawerOpen(false);
  };

  return (
    <>
      {/* Top Persistent Official Header */}
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-ocean-navy/95 border-slate-700/80 text-white light:bg-white/95 light:border-slate-200 light:text-ocean-navy shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: 3-Line Menu Trigger + Official Brand */}
          <div className="flex items-center gap-3">
            
            {/* 3-Line Menu Button (triggers left slide-in drawer) */}
            <button
              onClick={() => setIsLeftDrawerOpen(true)}
              className="p-2 rounded-lg border border-slate-700 light:border-slate-300 bg-midnight/60 light:bg-slate-100 hover:border-ice-cyan text-ice-cyan light:text-research-blue transition-colors focus:outline-none"
              aria-label="Open Navigation Sidebar"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Official Portal Identity */}
            <div 
              onClick={() => handleSelectTab('landing')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-research-blue to-ocean-navy border border-ice-cyan/40 flex items-center justify-center text-ice-cyan shadow-sm">
                <Compass className="w-5 h-5" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wider text-base text-white light:text-ocean-navy uppercase">
                    HimYatra
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-research-blue/60 text-ice-cyan border border-ice-cyan/30">
                    MoES / NCPOR
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium tracking-tight">
                  Antarctic Decision Support System
                </span>
              </div>
            </div>

          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center space-x-1 border border-slate-700/80 light:border-slate-200 rounded-xl p-1 bg-midnight/60 light:bg-slate-50">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-ice-cyan text-midnight shadow-sm font-bold'
                      : 'text-slate-300 light:text-slate-600 hover:text-white light:hover:text-ocean-navy hover:bg-slate-800/50 light:hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-midnight' : 'text-ice-cyan light:text-research-blue'}`} />
                  <span>{tab.label}</span>
                  {tab.restricted && !isAdminAuth && (
                    <Lock className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Status, UTC Clock, Dark/Light Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live API Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 light:border-slate-200 bg-midnight/50 light:bg-slate-100 text-xs font-mono">
              <Radio className={`w-3 h-3 ${apiStatus.connected ? 'text-route-safe animate-pulse' : 'text-route-short'}`} />
              <span className="text-slate-400 light:text-slate-600">SYS:</span>
              <span className={`font-semibold ${apiStatus.connected ? 'text-route-safe' : 'text-route-short'}`}>
                {apiStatus.connected ? 'ONLINE' : (apiStatus.simulated ? 'SIMULATED' : 'OFFLINE')}
              </span>
            </div>

            {/* UTC Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 light:border-slate-200 bg-midnight/50 light:bg-slate-100 text-xs font-mono text-slate-300 light:text-slate-700">
              <Clock className="w-3.5 h-3.5 text-ice-cyan light:text-research-blue" />
              <span>{utcTime || 'UTC'}</span>
            </div>

            {/* Admin status tag if logged in */}
            {isAdminAuth && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                <Unlock className="w-3 h-3" />
                <span>ADMIN</span>
              </span>
            )}

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark / Light Mode"
              className="p-2 rounded-lg border border-slate-700 light:border-slate-300 bg-midnight/50 light:bg-slate-100 text-ice-cyan light:text-research-blue hover:border-ice-cyan transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-research-blue" />
              )}
            </button>

          </div>

        </div>
      </header>

      {/* 3-Line Menu: Slides in from the LEFT SIDE */}
      {isLeftDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          
          {/* Backdrop */}
          <div 
            onClick={() => setIsLeftDrawerOpen(false)}
            className="fixed inset-0 bg-midnight/80 backdrop-blur-sm"
          />

          {/* Left Side Drawer Content */}
          <aside className="relative w-80 sm:w-96 h-full bg-ocean-navy light:bg-white border-r border-slate-700/80 light:border-slate-200 shadow-2xl flex flex-col justify-between z-10 select-none animate-in slide-in-from-left duration-300">
            
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-slate-700/80 light:border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-research-blue to-ocean-navy border border-ice-cyan/40 flex items-center justify-center text-ice-cyan shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white light:text-ocean-navy tracking-wider uppercase">
                      HimYatra Portal
                    </h2>
                    <p className="text-[11px] text-ice-cyan light:text-research-blue font-medium">
                      National Centre for Polar and Ocean Research
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLeftDrawerOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 light:hover:bg-slate-100 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items (One by one vertically on the left side) */}
              <div className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-12rem)]">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 block mb-2 font-bold">
                  Operational Modules
                </span>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isActive
                          ? 'border-ice-cyan bg-ice-cyan/15 text-white light:text-ocean-navy ring-1 ring-ice-cyan/30 shadow-sm'
                          : 'border-transparent hover:border-slate-700/80 hover:bg-midnight/40 light:hover:bg-slate-100 text-slate-300 light:text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-ice-cyan text-midnight' : 'bg-midnight/60 light:bg-slate-200 text-ice-cyan light:text-research-blue'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white light:text-ocean-navy">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      {item.restricted && !isAdminAuth ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Info */}
            <div className="p-4 border-t border-slate-700/80 light:border-slate-200 bg-midnight/50 light:bg-slate-50 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Time: {utcTime}</span>
                <span className={apiStatus.connected ? 'text-route-safe' : 'text-route-short'}>
                  {apiStatus.connected ? 'ONLINE' : 'SIMULATED'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                MoES / NCPOR Antarctic Program
              </div>
            </div>

          </aside>
        </div>
      )}
    </>
  );
}
