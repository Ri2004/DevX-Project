import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sun,
  Moon,
  Server,
  Key,
  ShieldAlert,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Gauge,
  Radio
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';
import { checkHealth } from '../services/api';

export function Settings() {
  const { theme, toggleTheme, isDark } = useTheme();
  const {
    apiStatus,
    verifyApi,
    iceConcentrationAlert,
    setIceConcentrationAlert,
    safetyRadiusNM,
    setSafetyRadiusNM,
    maxHullStress,
    setMaxHullStress,
  } = useNavigation();

  const [endpoint, setEndpoint] = useState(() => {
    return localStorage.getItem('himyatra_api_endpoint') || 'http://127.0.0.1:8000';
  });

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('himyatra_api_key') || 'dev-polar-secret-key-2026';
  });

  const [offlineMode, setOfflineMode] = useState(() => {
    return localStorage.getItem('himyatra_offline_mode') === 'true';
  });

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const start = performance.now();
      const res = await checkHealth();
      const latency = Math.round(performance.now() - start);
      if (res.status === 'online') {
        setTestResult({ success: true, message: `Connected successfully (${latency} ms latency)` });
      } else if (res.status === 'offline-mode') {
        setTestResult({ success: true, message: 'Offline simulation mode active' });
      } else {
        setTestResult({ success: false, message: `Backend unavailable: ${res.error || 'Connection refused'}` });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
      verifyApi();
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('himyatra_api_endpoint', endpoint);
    localStorage.setItem('himyatra_api_key', apiKey);
    localStorage.setItem('himyatra_offline_mode', offlineMode ? 'true' : 'false');
    setSavedSuccess(true);
    verifyApi();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setEndpoint('http://127.0.0.1:8000');
    setApiKey('dev-polar-secret-key-2026');
    setOfflineMode(false);
    setIceConcentrationAlert(70);
    setSafetyRadiusNM(15);
    setMaxHullStress(65);
    localStorage.removeItem('himyatra_api_endpoint');
    localStorage.removeItem('himyatra_api_key');
    localStorage.removeItem('himyatra_offline_mode');
    setSavedSuccess(true);
    verifyApi();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-border/60 light:border-slate-light-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-ice-cyan light:text-research-blue uppercase tracking-widest">
              Operational Configuration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-research-blue/30 text-ice-cyan border border-ice-cyan/30">
              System Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white light:text-ocean-navy mt-1">
            Portal Preferences, API Targets & Operational Thresholds
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-border hover:bg-slate-800 light:hover:bg-slate-100 text-slate-300 light:text-slate-600 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-ice-cyan text-midnight font-bold text-xs shadow-glow-cyan hover:bg-sky-400 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs font-mono animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-route-safe" />
          <span>Configuration saved successfully. System parameters refreshed.</span>
        </div>
      )}

      {/* Section 1: Display & Theme Architecture */}
      <div className="p-6 rounded-2xl border border-slate-border light:border-slate-light-border bg-ocean-navy/70 light:bg-white space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
          <div>
            <h3 className="font-bold text-sm text-white light:text-ocean-navy">
              Interface Styling & Theme System
            </h3>
            <p className="text-xs text-slate-400">
              Midnight ocean navy vs. high-contrast pure white ice mode
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-midnight light:bg-slate-100 text-ice-cyan light:text-research-blue border border-slate-border">
            Active: {theme.toUpperCase()} MODE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Dark Mode Card */}
          <div
            onClick={() => { if (!isDark) toggleTheme(); }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              isDark
                ? 'border-ice-cyan bg-midnight/80 ring-2 ring-ice-cyan/40 shadow-glow-cyan/20'
                : 'border-slate-border bg-midnight/30 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Moon className="w-4 h-4 text-ice-cyan" />
                <span>Dark Mode (Polar Midnight)</span>
              </div>
              {isDark && <CheckCircle2 className="w-4 h-4 text-ice-cyan" />}
            </div>
            <p className="text-xs text-slate-400">
              Optimized for bridge watchkeeping, low-light operations, and high contrast vector monitoring.
            </p>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => { if (isDark) toggleTheme(); }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              !isDark
                ? 'border-research-blue bg-white ring-2 ring-research-blue/40 shadow-lg'
                : 'border-slate-border bg-slate-800/30 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm text-white light:text-ocean-navy">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode (Clean Ice White)</span>
              </div>
              {!isDark && <CheckCircle2 className="w-4 h-4 text-research-blue" />}
            </div>
            <p className="text-xs text-slate-400 light:text-slate-600">
              Crisp daylight viewing for office briefings, scientific presentations, and high-glare environments.
            </p>
          </div>

        </div>
      </div>

      {/* Section 2: Backend API Target & Keys */}
      <div className="p-6 rounded-2xl border border-slate-border light:border-slate-light-border bg-ocean-navy/70 light:bg-white space-y-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
          <div>
            <h3 className="font-bold text-sm text-white light:text-ocean-navy">
              FastAPI Engine Connection Target
            </h3>
            <p className="text-xs text-slate-400">
              Direct connection to the Python ML inference and A* routing daemon
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <Radio className={`w-3.5 h-3.5 ${apiStatus.connected ? 'text-route-safe' : 'text-route-short'}`} />
            <span className={apiStatus.connected ? 'text-route-safe' : 'text-route-short'}>
              {apiStatus.connected ? 'SYSTEM ACTIVE' : 'LOCAL SIMULATOR'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Endpoint URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 light:text-slate-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-ice-cyan light:text-research-blue" />
              <span>Backend Service URL:</span>
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full bg-midnight/80 light:bg-slate-50 border border-slate-border light:border-slate-light-border rounded-xl px-3 py-2 text-xs font-mono text-white light:text-ocean-navy focus:outline-none focus:border-ice-cyan"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 light:text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-ice-cyan light:text-research-blue" />
              <span>X-API-Key Secret:</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="X-API-Key"
              className="w-full bg-midnight/80 light:bg-slate-50 border border-slate-border light:border-slate-light-border rounded-xl px-3 py-2 text-xs font-mono text-white light:text-ocean-navy focus:outline-none focus:border-ice-cyan"
            />
          </div>

        </div>

        {/* Test Connection Button & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-research-blue hover:bg-blue-700 text-white font-bold text-xs transition-colors border border-ice-cyan/30 disabled:opacity-50"
          >
            <Wifi className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing Health Endpoint...' : 'Ping Backend Health'}</span>
          </button>

          {testResult && (
            <div className={`text-xs font-mono flex items-center gap-1.5 ${testResult.success ? 'text-route-safe' : 'text-route-short'}`}>
              {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Offline / Online Data Mode Toggle */}
        <div className="p-4 rounded-xl border border-slate-border/80 bg-midnight/40 light:bg-slate-50 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-white light:text-ocean-navy flex items-center gap-2">
              {offlineMode ? <WifiOff className="w-4 h-4 text-route-short" /> : <Wifi className="w-4 h-4 text-route-safe" />}
              <span>Enforce Offline / Autonomous Cruise Mode</span>
            </span>
            <p className="text-[11px] text-slate-400">
              When enabled, suppresses network requests and relies entirely on high-fidelity synthetic polar models.
            </p>
          </div>
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`w-12 h-6 rounded-full transition-colors relative border ${
              offlineMode ? 'bg-ice-cyan border-ice-cyan' : 'bg-slate-800 light:bg-slate-300 border-slate-600'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-midnight transition-transform ${offlineMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

      </div>

      {/* Section 3: Operational Anomaly Thresholds & Safety Sliders */}
      <div className="p-6 rounded-2xl border border-slate-border light:border-slate-light-border bg-ocean-navy/70 light:bg-white space-y-6 shadow-lg">
        <div className="border-b border-slate-border/60 pb-3">
          <h3 className="font-bold text-sm text-white light:text-ocean-navy">
            Operational Anomaly Thresholds & Sensitivity Sliders
          </h3>
          <p className="text-xs text-slate-400">
            Set safety envelopes for the pathfinding engine and AI briefings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Slider 1: Ice Concentration Alert */}
          <div className="space-y-2 p-4 rounded-xl border border-slate-border/60 bg-midnight/40 light:bg-slate-50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 light:text-slate-700">
              <span>Pack-Ice Alert Limit:</span>
              <span className="font-mono text-ice-cyan font-bold">{iceConcentrationAlert}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={iceConcentrationAlert}
              onChange={(e) => setIceConcentrationAlert(parseInt(e.target.value))}
              className="w-full accent-ice-cyan cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Triggers visual detour rerouting when sea ice concentration exceeds threshold.
            </p>
          </div>

          {/* Slider 2: Iceberg Proximity Radius */}
          <div className="space-y-2 p-4 rounded-xl border border-slate-border/60 bg-midnight/40 light:bg-slate-50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 light:text-slate-700">
              <span>Iceberg Standoff Perimeter:</span>
              <span className="font-mono text-ice-cyan font-bold">{safetyRadiusNM} NM</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={safetyRadiusNM}
              onChange={(e) => setSafetyRadiusNM(parseInt(e.target.value))}
              className="w-full accent-ice-cyan cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Minimum radial separation enforced around active USNIC detected tabular icebergs.
            </p>
          </div>

          {/* Slider 3: Max Hull Stress Index */}
          <div className="space-y-2 p-4 rounded-xl border border-slate-border/60 bg-midnight/40 light:bg-slate-50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 light:text-slate-700">
              <span>Max Allowable Hull Stress:</span>
              <span className="font-mono text-amber-400 font-bold">{maxHullStress} / 100</span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              step="5"
              value={maxHullStress}
              onChange={(e) => setMaxHullStress(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Lindqvist ice crushing resistance ceiling before triggering emergency divert.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
