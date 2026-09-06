import React from 'react';
import {
  Compass,
  Navigation,
  Activity,
  Shield,
  ArrowRight,
  TrendingDown,
  Database,
  Radio,
  MapPin,
  Anchor,
  Layers,
  Sparkles,
  Calendar,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export function LandingPage() {
  const { setCurrentTab, setCopilotOpen, apiStatus, forecastDay } = useNavigation();

  const metrics = [
    { label: 'Fuel Burn Reduction', value: '28.4%', sub: 'vs unassisted rhumb-line transit', icon: TrendingDown },
    { label: 'Iceberg Standoff Compliance', value: '99.8%', sub: 'automated perimeter avoidance', icon: Shield },
    { label: 'Active Grid Dimension', value: '316 x 332', sub: 'EPSG:3031 25km raster cells', icon: Database },
    { label: 'Route Compute Latency', value: '< 180 ms', sub: 'multi-objective Pareto solver', icon: Activity },
  ];

  const highlights = [
    {
      title: '7-Day Sea-Ice Tensor Forecasting',
      desc: 'Predictive 2D concentration fields capturing freezing fronts and pack-ice drift dynamics.',
      icon: Layers
    },
    {
      title: 'XGBoost Iceberg Kinematics',
      desc: 'Real-time drift tracking integrating Coriolis forces, surface currents, and katabatic winds.',
      icon: Navigation
    },
    {
      title: 'Lindqvist Hull Resistance',
      desc: 'Hydrodynamic physics engine computing ice crushing and flexural bending loads for PC1-PC7 vessels.',
      icon: Anchor
    },
    {
      title: 'MoES & NCPOR Operational Mission',
      desc: 'Dedicated decision support connecting Maitri Station and Bharati Station research outposts.',
      icon: Shield
    }
  ];

  return (
    <div className="w-full flex flex-col items-center py-10 sm:py-16 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        
        {/* Main Hero Header (Clean, Official, No Tagline) */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          {/* Official Authority Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ice-cyan/30 bg-ocean-navy/80 light:bg-slate-100 text-xs font-mono shadow-sm">
            <Shield className="w-4 h-4 text-ice-cyan light:text-research-blue" />
            <span className="text-slate-200 light:text-slate-800 font-semibold tracking-wide">
              Ministry of Earth Sciences (MoES) / National Centre for Polar and Ocean Research (NCPOR)
            </span>
          </div>

          {/* Clean Portal Title (NO TAGLINE) */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white light:text-ocean-navy uppercase font-sans">
              HimYatra
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 light:text-slate-600 leading-relaxed font-normal">
              Autonomous Decision Support System for Antarctic Sea-Ice Forecasting, Iceberg Trajectory Prediction, and Safe Vessel Navigation across Indian Polar Research Outposts.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setCurrentTab('map')}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-ice-cyan text-midnight font-bold text-sm tracking-wide shadow-md hover:bg-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Navigation Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 light:border-slate-300 bg-ocean-navy/80 light:bg-white text-white light:text-ocean-navy font-semibold text-sm hover:border-ice-cyan transition-all"
            >
              <Activity className="w-4 h-4 text-ice-cyan light:text-research-blue" />
              <span>Operational Analytics</span>
            </button>
          </div>

        </div>

        {/* 4 Key Operational Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-700/80 light:border-slate-200 bg-ocean-navy/80 light:bg-white space-y-1.5 shadow-sm hover:border-ice-cyan/50 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{m.label}</span>
                  <Icon className="w-3.5 h-3.5 text-ice-cyan light:text-research-blue" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-white light:text-ocean-navy">
                  {m.value}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {m.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Mission Highlights Overview */}
        <div className="p-8 rounded-3xl border border-slate-700/80 light:border-slate-200 bg-ocean-navy/60 light:bg-slate-50 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 light:border-slate-200 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-ice-cyan light:text-research-blue uppercase tracking-widest">
                Scientific & Engineering Capabilities
              </span>
              <h2 className="text-xl font-bold text-white light:text-ocean-navy mt-0.5">
                Core Computational Systems
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-route-safe animate-pulse" />
              <span>Horizon: Day T+{forecastDay} Synchronized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-700/60 light:border-slate-200 bg-midnight/50 light:bg-white space-y-2 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-lg bg-research-blue/30 text-ice-cyan light:text-research-blue flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white light:text-ocean-navy">
                    {h.title}
                  </h4>
                  <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
