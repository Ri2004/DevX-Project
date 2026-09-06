import React, { useState, useEffect } from 'react';
import {
  Compass,
  Navigation,
  Activity,
  BarChart3,
  Sliders,
  Sun,
  Moon,
  Radio,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

export function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { currentTab, setCurrentTab, apiStatus } = useNavigation();
  const [utcTime, setUtcTime] = useState('');

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
    { id: 'landing', label: 'Landing Page', icon: Compass },
    { id: 'map', label: 'Live Map Engine', icon: Navigation },
    { id: 'dashboard', label: 'Analytics Dashboard', icon: Activity },
    { id: 'visualizations', label: 'Scientific Visualizations', icon: BarChart3 },
    { id: 'settings', label: 'Operational Settings', icon: Sliders },
  ];

  return (
    <header className=\"sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-200 bg-ocean-navy/95 border-slate-border text-white light:bg-white/95 light:border-slate-light-border light:text-ocean-navy\">
      <div className=\"w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4\">
        
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className=\"flex items-center gap-3 cursor-pointer group select-none min-w-fit\"
        >
          <div className=\"relative w-10 h-10 rounded-lg bg-gradient-to-br from-research-blue to-ocean-navy border border-ice-cyan/40 flex items-center justify-center shadow-glow-cyan/50\">
            <Compass className=\"w-6 h-6 text-ice-cyan transition-transform duration-500 group-hover:rotate-45\" />
            <div className=\"absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-ice-cyan animate-ping\" />
            <div className=\"absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-ice-cyan\" />
          </div>
          <div className=\"flex flex-col\">
            <div className=\"flex items-center gap-2\">
              <span className=\"font-bold tracking-wider text-lg text-white light:text-ocean-navy uppercase\">
                HimYatra
              </span>
              <span className=\"text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-research-blue/60 text-ice-cyan border border-ice-cyan/30\">
                SIH26059
              </span>
            </div>
            <span className=\"text-xs text-ice-cyan/90 light:text-research-blue font-medium italic tracking-wide\">
              HimYatra ... The Polar Journey
            </span>
          </div>
        </div>

        {/* Central Navigation Tabs */}
        <nav className=\"hidden xl:flex items-center space-x-1 border border-slate-border/60 light:border-slate-light-border rounded-xl p-1 bg-midnight/50 light:bg-ice-light\">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={lex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 }
              >
                <Icon className={w-4 h-4 } />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: API Status, UTC Clock, Theme Toggle */}
        <div className=\"flex items-center gap-3\">
          
          {/* API Connection Indicator */}
          <div className=\"hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-border light:border-slate-light-border bg-midnight/40 light:bg-slate-100 text-xs font-mono\">
            <Radio className={w-3.5 h-3.5 } />
            <span className=\"text-slate-300 light:text-slate-700\">API:</span>
            <span className={ont-semibold }>
              {apiStatus.connected ? 'ACTIVE' : (apiStatus.simulated ? 'SIMULATED' : 'OFFLINE')}
            </span>
          </div>

          {/* UTC Clock */}
          <div className=\"hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-border light:border-slate-light-border bg-midnight/40 light:bg-slate-100 text-xs font-mono text-slate-300 light:text-slate-700\">
            <Clock className=\"w-3.5 h-3.5 text-ice-cyan light:text-research-blue\" />
            <span>{utcTime || 'SYNCING UTC...'}</span>
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label=\"Toggle Dark / Light Theme\"
            className=\"relative p-2 rounded-lg border border-slate-border light:border-slate-light-border bg-midnight/50 light:bg-slate-100 text-ice-cyan light:text-research-blue hover:border-ice-cyan transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ice-cyan/50\"
          >
            {isDark ? (
              <Sun className=\"w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-90\" />
            ) : (
              <Moon className=\"w-4 h-4 text-research-blue transition-transform duration-300 hover:-rotate-12\" />
            )}
          </button>

          {/* Mobile Tab Trigger Menu (displayed on smaller screens) */}
          <div className=\"flex xl:hidden\">
            <select
              value={currentTab}
              onChange={(e) => setCurrentTab(e.target.value)}
              className=\"bg-midnight light:bg-slate-100 border border-slate-border light:border-slate-light-border rounded-lg text-xs font-semibold px-2 py-1.5 text-white light:text-ocean-navy focus:outline-none focus:border-ice-cyan\"
            >
              {navItems.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>

        </div>

      </div>
    </header>
  );
}
