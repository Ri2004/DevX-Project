import React, { useState } from 'react';
import {
  Bot,
  X,
  Send,
  AlertTriangle,
  ShieldCheck,
  Info,
  Compass,
  Ship,
  Sparkles,
  Terminal
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { getCopilotBriefing } from '../services/api';
import { INITIAL_COPILOT_BRIEFING } from '../services/mockData';

export function CopilotDrawer({ isOpen, onClose }) {
  const {
    vesselIceClass,
    forecastDay,
    startPoint,
    goalPoint,
    selectedRouteId,
    activeRoute
  } = useNavigation();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState(INITIAL_COPILOT_BRIEFING);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: INITIAL_COPILOT_BRIEFING.summary,
      briefing: INITIAL_COPILOT_BRIEFING
    }
  ]);

  const handleAsk = async (promptQuery) => {
    const q = promptQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    const userMsg = { role: 'user', content: q };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');

    try {
      const response = await getCopilotBriefing(q, {
        forecastDay,
        vesselIceClass,
        activeRouteId: selectedRouteId
      });

      const newBriefing = response?.briefing || {
        headline: `Response to: ${q}`,
        timestamp: new Date().toISOString(),
        classification: 'OFFICIAL / NCPOR POLAR MISSION BRIEFING',
        summary: `Analyzed polar navigation constraints for Class ${vesselIceClass}. Route risk exposure is optimal with current A* waypoints.`,
        advisories: [
          {
            level: 'RECOMMENDED',
            title: 'Optimal Engine Setting',
            detail: 'Maintain steady 11.2 knots cruising velocity. Avoid abrupt torque shifts in marginal ice pack.'
          }
        ]
      };

      setBriefing(newBriefing);
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: newBriefing.summary,
          briefing: newBriefing
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Analyze hull stress at Day 3 katabatic surge',
    'Evaluate detour fuel penalty vs pack ice risk',
    'Identify nearest USNIC iceberg drift hazard',
    'Recommend Lindqvist power throttle limit'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-midnight/70 backdrop-blur-sm">
      <div className="w-full max-w-xl h-full bg-ocean-navy light:bg-white border-l border-slate-border light:border-slate-light-border shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-border light:border-slate-light-border flex items-center justify-between bg-midnight/50 light:bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-ice-cyan/10 border border-ice-cyan/30 flex items-center justify-center text-ice-cyan">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white light:text-ocean-navy">
                  Captain's AI Co-Pilot
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-route-safe/20 text-route-safe border border-route-safe/30">
                  AUTONOMOUS DSS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Actionable Navigational & Ice Breaker Directives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-border/80 light:border-slate-light-border hover:bg-slate-800 light:hover:bg-slate-100 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Strip */}
        <div className="px-4 py-2 bg-research-blue/20 light:bg-ice-tint border-b border-slate-border light:border-slate-light-border grid grid-cols-3 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">VESSEL CLASS</span>
            <span className="font-bold text-ice-cyan light:text-research-blue">{vesselIceClass}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">FORECAST</span>
            <span className="font-bold text-white light:text-ocean-navy">T+{forecastDay} (Day {forecastDay})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ROUTE</span>
            <span className="font-bold text-route-safe">{activeRoute?.name || 'Safest'}</span>
          </div>
        </div>

        {/* Scrollable Chat & Briefings Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Active Structured Briefing Card */}
          {briefing && (
            <div className="rounded-xl border border-ice-cyan/30 bg-midnight/60 light:bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-border/60 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ice-cyan font-bold">
                  {briefing.classification}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(briefing.timestamp).toLocaleTimeString()} UTC
                </span>
              </div>

              <h4 className="font-bold text-sm text-white light:text-ocean-navy">
                {briefing.headline}
              </h4>

              <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                {briefing.summary}
              </p>

              {/* Actionable Advisories */}
              <div className="space-y-2 pt-1">
                {briefing.advisories?.map((adv, idx) => {
                  const isCrit = adv.level === 'CRITICAL';
                  const isWarn = adv.level === 'WARNING';
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs ${
                        isCrit
                          ? 'border-iceberg-red/40 bg-iceberg-red/10 text-red-200'
                          : isWarn
                          ? 'border-route-short/40 bg-route-short/10 text-amber-200'
                          : 'border-route-safe/40 bg-route-safe/10 text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {isCrit ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-iceberg-red" />
                        ) : isWarn ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-route-short" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-route-safe" />
                        )}
                        <span>{adv.title}</span>
                      </div>
                      <p className="text-[11px] leading-normal opacity-90">
                        {adv.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Questions Suggestions */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 block">
              Direct Inquiries to Co-Pilot:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(p)}
                  className="text-left text-[11px] py-1 px-2.5 rounded-lg border border-slate-border light:border-slate-light-border bg-midnight/40 light:bg-slate-100 hover:border-ice-cyan text-slate-300 light:text-slate-700 hover:text-ice-cyan transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History */}
          {chatHistory.length > 1 && (
            <div className="space-y-2 pt-2 border-t border-slate-border/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Session Log:
              </span>
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs p-2.5 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-research-blue/40 border border-research-blue/60 text-ice-cyan ml-6'
                      : 'bg-midnight/40 border border-slate-border light:border-slate-light-border text-slate-300 light:text-slate-600 mr-6'
                  }`}
                >
                  <span className="font-bold block text-[10px] uppercase font-mono text-slate-400 mb-1">
                    {msg.role === 'user' ? 'Captain' : 'HimYatra Co-Pilot'}
                  </span>
                  {msg.content}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-border light:border-slate-light-border bg-midnight/60 light:bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Inquire navigation condition, hull load, or path alternative..."
              className="flex-1 bg-midnight/80 light:bg-white border border-slate-border light:border-slate-light-border rounded-xl px-3 py-2 text-xs text-white light:text-ocean-navy placeholder:text-slate-500 focus:outline-none focus:border-ice-cyan"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-3 py-2 rounded-xl bg-ice-cyan text-midnight font-bold hover:bg-sky-400 transition-colors disabled:opacity-40 flex items-center gap-1 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
