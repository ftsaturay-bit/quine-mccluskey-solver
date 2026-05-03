import React from 'react';

function StepRow({ id, title, items, isMinterms }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 py-10 border-b border-white/5 group">
      {/* Step Header Column */}
      <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-orange-500/60 tabular-nums tracking-[0.3em] uppercase">0{id}</span>
          <div className="h-px flex-1 bg-orange-500/20"></div>
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-orange-400 transition-colors duration-300">
          {title}
        </h3>
      </div>

      {/* Data Content Column */}
      <div className="flex-1">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 hover:border-orange-500/20 transition-all duration-500 shadow-xl group-hover:shadow-orange-500/5">
          {isMinterms ? (
            <div className="flex flex-wrap gap-2">
              {items[0]?.split(',').map((m, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/5 border border-orange-500/10 text-orange-400 font-mono text-sm shadow-inner">
                  {m.trim()}
                </span>
              )) || <span className="text-slate-600 italic text-sm">System: All minterms successfully satisfied.</span>}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5 hover:bg-white/[0.03] hover:border-orange-500/10 transition-all duration-300 group/item">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/30 group-hover/item:bg-orange-500 transition-colors"></div>
                    <span className="font-mono text-sm text-slate-300 group-hover/item:text-white transition-colors">
                      {item.split('|')[0].replace(/^- /, '').trim()}
                    </span>
                  </div>
                  {item.includes('|') && (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-px bg-white/10"></div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover/item:text-slate-400 uppercase tracking-tighter tabular-nums">
                        {item.split('|')[1].trim()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FormattedTextViz({ content }) {
  if (!content) return null;

  const sections = [];
  const globalSummary = [];
  const lines = content.split('\n');
  let current = null;

  lines.forEach(line => {
    const text = line.trim();
    if (!text) return;

    // Global summary lines (typically at the end)
    if (text.toLowerCase().includes('total selected') || text.toLowerCase().includes('minterms are covered')) {
      globalSummary.push(text);
      return;
    }

    const headerMatch = text.match(/^(\d+)\.\s+(.*)/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { id: headerMatch[1], title: headerMatch[2].replace(':', ''), items: [] };
    } else if (current) {
      current.items.push(text);
    }
  });
  if (current) sections.push(current);

  return (
    <div className="flex flex-col px-4 max-w-5xl mx-auto pb-6">
      {/* Process Steps */}
      {sections.map((section, idx) => (
        <StepRow
          key={idx}
          id={section.id}
          title={section.title}
          items={section.items}
          isMinterms={section.title.toLowerCase().includes('minterms')}
        />
      ))}

      {/* FULL WIDTH STANDOUT SOLUTION CARD */}
      {globalSummary.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-orange-500/10 border-2 border-orange-500/20 p-6 shadow-[0_0_30px_rgba(249,115,22,0.1)] mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-center">
          {/* Background Glow Decor */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col gap-1">
            {globalSummary.map((text, i) => (
              <p key={i} className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">
                {text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
