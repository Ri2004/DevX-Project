import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { AntarcticMap } from './views/AntarcticMap';
import { Dashboard } from './views/Dashboard';
import { Visualizations } from './views/Visualizations';
import { Settings } from './views/Settings';
import { Shield, Radio, Heart } from 'lucide-react';

function ViewRouter() {
  const { currentTab } = useNavigation();

  return (
    <div className="flex-1 w-full">
      {currentTab === 'landing' && <LandingPage />}
      {currentTab === 'map' && <AntarcticMap />}
      {currentTab === 'dashboard' && <Dashboard />}
      {currentTab === 'visualizations' && <Visualizations />}
      {currentTab === 'settings' && <Settings />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <div className="min-h-screen flex flex-col bg-midnight text-white light:bg-white light:text-ocean-navy transition-colors duration-200">
          {/* Top Persistent Navigation Bar */}
          <Navbar />

          {/* Main Dynamic Viewport */}
          <main className="flex-1 flex flex-col">
            <ViewRouter />
          </main>

          {/* Persistent Footer */}
          <footer className="border-t border-slate-border/40 light:border-slate-light-border py-4 px-6 bg-ocean-navy/80 light:bg-slate-50 text-xs text-slate-400 select-none">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white light:text-ocean-navy">HimYatra</span>
                <span>— The Polar Journey</span>
                <span className="text-slate-600">|</span>
                <span className="text-ice-cyan light:text-research-blue">SIH26059</span>
              </div>
              <div className="flex items-center gap-4">
                <span>MoES / NCPOR Antarctic Program</span>
                <span className="text-slate-600">|</span>
                <span>EPSG:3031 Coordinate Space</span>
              </div>
            </div>
          </footer>
        </div>
      </NavigationProvider>
    </ThemeProvider>
  );
}
