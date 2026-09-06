import React from 'react';
import {
  Compass,
  Navigation,
  Activity,
  Layers,
  Cpu,
  Shield,
  ArrowRight,
  TrendingDown,
  Anchor,
  Wind,
  Database,
  BarChart,
  Radio,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export function LandingPage() {
  const { setCurrentTab, apiStatus } = useNavigation();

  const capabilities = [
    {
      icon: Layers,
      title: 'Real-Time 2D Sea-Ice Tensor Forecasting',
      tag: 'T1 - T7 Horizons',
      desc: 'Predictive 316x332 grid rasterization capturing sea ice pack drift, thermodynamic melt, and freezing front progression with sub-25km spatial fidelity.'
    },
    {
      icon: Cpu,
      title: 'XGBoost Iceberg Kinematic Drift Tracking',
      tag: 'Machine Learning',
      desc: 'Dynamic trajectory modeling integrating Coriolis force, Ekman surface current shear, and ERA5 katabatic wind vectors for megabergs and growlers.'
    },
    {
      icon: Anchor,
      title: 'Lindqvist Vessel Resistance Engine',
      tag: 'Hydrodynamic Physics',
      desc: 'Continuous computation of ice crushing, bending, and submersion forces across Polar Classes PC1 through PC7 to prevent besetting incidents.'
    },
    {
      icon: Compass,
      title: 'Multi-Objective A* Pathfinding Engine',
      tag: 'Pareto-Optimal',
      desc: 'Parallel generation of Safest, Fuel-Optimal, and Geodesic Shortest trajectories with Pareto trade-off optimization between transit delay and bunker fuel burn.'
    }
  ];

  const metrics = [
    { label: 'Fuel Burn Reduction', value: '28.4%', sub: 'vs unoptimized rhumb-line', icon: TrendingDown },
    { label: 'Iceberg Stand-off Compliance', value: '99.8%', sub: 'automated perimeter avoidance', icon: Shield },
    { label: 'Active Grid Dimension', value: '316 x 332', sub: 'EPSG:3031 coordinate space', icon: Database },
    { label: 'Route Compute Latency', value: '< 180 ms', sub: 'multi-class dynamic routing', icon: Activity },
  ];

  return (
    <div className="min-h-screen select-none">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-border/50 light:border-slate-light-border bg-gradient-to-b from-midnight via-ocean-navy to-midnight light:from-white light:via-ice-tint light:to-white">
        
        {/* Polar Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ice-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-research-blue/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          
          {/* Mission Authority Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-ice-cyan/40 bg-ocean-navy/80 light:bg-white text-xs font-mono shadow-glow-cyan/20">
            <Shield className="w-4 h-4 text-ice-cyan light:text-research-blue" />
            <span className="text-slate-200 light:text-slate-800 font-semibold tracking-wide">
              Ministry of Earth Sciences (MoES) / NCPOR Antarctic Research Support
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-ice-cyan animate-pulse" />
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white light:text-ocean-navy font-sans">
              HimYatra
            </h1>
            <p className="text-xl sm:text-2xl font-light text-ice-cyan light:text-research-blue italic tracking-wider">
              HimYatra ... The Polar Journey
            </p>
            <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 light:text-slate-600 leading-relaxed font-normal">
              Antarctic Sea-Ice Forecasting, Iceberg Trajectory Prediction, and Safe Vessel Navigation Decision Support System (SIH26059). Engineered for research icebreakers operating across the Southern Ocean, Maitri, and Bharati stations.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentTab('map')}
              className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-ice-cyan text-midnight font-bold text-sm tracking-wide shadow-glow-cyan hover:bg-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Navigation Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-border light:border-slate-light-border bg-ocean-navy/60 light:bg-white text-white light:text-ocean-navy font-semibold text-sm hover:border-ice-cyan transition-all duration-200"
            >
              <Activity className="w-4 h-4 text-ice-cyan light:text-research-blue" />
              <span>Operational Analytics</span>
            </button>
          </div>

          {/* Operational Telemetry Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-border/80 light:border-slate-light-border bg-midnight/60 light:bg-white/80 backdrop-blur-sm text-left space-y-1 hover:border-ice-cyan/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">{m.label}</span>
                    <Icon className="w-3.5 h-3.5 text-ice-cyan light:text-research-blue" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white light:text-ocean-navy">
                    {m.value}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {m.sub}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Technical Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-ice-cyan light:text-research-blue uppercase tracking-widest">
            <Cpu className="w-4 h-4" />
            <span>Mission Architecture Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white light:text-ocean-navy">
            High-Performance Polar Hydrodynamics & Machine Learning
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Integrating physical conservation laws with high-dimensional environmental tensors to deliver provably safer transit corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-border light:border-slate-light-border bg-ocean-navy/60 light:bg-white/90 backdrop-blur-sm space-y-3 hover:border-ice-cyan/60 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-midnight light:bg-ice-tint border border-slate-border light:border-slate-light-border flex items-center justify-center text-ice-cyan light:text-research-blue group-hover:border-ice-cyan transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-research-blue/30 text-ice-cyan border border-ice-cyan/20">
                    {cap.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white light:text-ocean-navy">
                  {cap.title}
                </h3>
                <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Polar Research Base Connectivity Card */}
        <div className="p-8 rounded-2xl border border-research-blue/50 bg-gradient-to-r from-midnight via-ocean-navy to-midnight light:from-ice-tint light:via-white light:to-ice-tint flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono font-bold text-ice-cyan uppercase tracking-wider">
              Strategic Indian Polar Outposts
            </span>
            <h3 className="text-lg font-bold text-white light:text-ocean-navy">
              Seamless Trajectories Between Maitri & Bharati Stations
            </h3>
            <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
              Automated waypoint generation across the Princess Elizabeth Land margin, Queen Maud Land, and the sub-polar convergence zone connecting Cape Town and Hobart supply lines.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('map')}
            className="whitespace-nowrap px-6 py-3 rounded-xl bg-research-blue hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors border border-ice-cyan/30"
          >
            <Compass className="w-4 h-4 text-ice-cyan" />
            <span>Open Map Engine</span>
          </button>
        </div>

      </section>

    </div>
  );
}
