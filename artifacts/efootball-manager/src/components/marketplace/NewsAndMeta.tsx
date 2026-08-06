import React, { useState } from 'react';
import {
  Newspaper,
  Flame,
  ShieldCheck,
  Zap,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Filter,
  BarChart3,
} from 'lucide-react';

const patchHighlights = [
  'Escrow settlement now depends on live Paystack confirmation.',
  'Funds remain protected until the buyer approves or the hold window expires.',
  'Marketplace updates are driven by the configured backend, not sample content.',
];

const metaItems: Array<{ id: string; category: string; name: string; tier: string; roleOrStyle: string; pros: string[]; keyAttributes: string }> = [];

export const NewsAndMeta: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'Epics' | 'Showtimes' | 'Managers' | 'Formations'>('ALL');

  const filteredMetaItems = metaItems.filter(
    item => activeCategory === 'ALL' || item.category === activeCategory
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-indigo-950 border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden text-white">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 text-xs font-bold">
            <Newspaper className="w-4 h-4 text-orange-400" /> eFootball™ 2026 Patch Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Version <span className="text-orange-400">v5.2.0 Patch Notes</span> &amp; Meta Tier Lists
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
            Stay ahead of competitive Division 1 matchmaking. Review the latest gameplay balance changes, booster epics ranking, and top manager tactical playstyles.
          </p>
        </div>
      </div>

      {/* Grid: Patch Notes & Meta Tier List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (1 Col): Patch Notes v5.2.0 */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-[10px] font-extrabold border border-orange-300">
                  2026-08-01
                </span>
                <h3 className="text-lg font-black text-indigo-950 mt-1">Escrow Vault Update</h3>
              </div>
            </div>

            {/* Patch Highlights List */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600" /> Key Patch Highlights
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
                {patchHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 text-orange-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Meta Impact Analysis */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-900" /> Gameplay Meta Shift
              </h4>
              <div className="space-y-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-indigo-950">Live policy enforcement</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 font-black">
                      HIGH IMPACT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Release conditions are driven by the live backend and the configured Paystack confirmation state.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (2 Cols): Meta Tier List Hub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-indigo-950 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-500" /> Division 1 Meta Tier List (v5.2.0)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Rankings based on Division 1 win rates &amp; top 100 squad pick frequencies.</p>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {(['ALL', 'Epics', 'Showtimes', 'Managers', 'Formations'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-indigo-950 text-white font-extrabold'
                        : 'text-slate-600 hover:text-indigo-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Items Cards Grid */}
            <div className="space-y-4">
              {filteredMetaItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
                  Live meta data is not available yet. The marketplace will populate this section from the backend once content is connected.
                </div>
              ) : filteredMetaItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-orange-500 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-xl bg-indigo-950 text-orange-400 font-black text-sm shadow-sm font-mono border-b-2 border-orange-500">
                        {item.tier}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                          {item.category} • {item.roleOrStyle}
                        </span>
                        <h4 className="text-base font-black text-indigo-950">{item.name}</h4>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200 font-bold">
                      {item.keyAttributes}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-medium">
                    {item.pros.map((pro, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
