import React from 'react';

// Renders a binary string with bit chips (supporting dashes)
function BinaryChips({ binary }) {
  return (
    <div className="flex gap-1 justify-center">
      {binary.split('').map((bit, i) => (
        <span
          key={i}
          className={`
            w-7 h-7 flex items-center justify-center rounded-md text-xs font-black font-mono
            transition-all duration-300
            ${bit === '-'
              ? 'bg-orange-500/10 text-orange-400/60 border border-orange-500/20'
              : bit === '1'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                : 'bg-slate-800/60 text-slate-500 border border-slate-700/50'
            }
          `}
        >
          {bit}
        </span>
      ))}
    </div>
  );
}

// Renders a single iteration table
function IterationTable({ iteration, groups }) {
  return (
    <div className="flex flex-col gap-4 mb-12 last:mb-0">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-orange-500/60">
          Iteration {iteration}
        </h4>
        <div className="h-px flex-1 bg-gradient-to-r from-orange-500/20 via-orange-500/20 to-transparent"></div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400">Group</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400 text-center">Binary</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400">Minterms Covered</th>
            </tr>
          </thead>
          {groups.map((group, gIdx) => (
            <tbody key={gIdx} className="group/row-group border-b border-white/5 last:border-0">
              {group.terms.map((term, tIdx) => (
                <tr
                  key={tIdx}
                  className="transition-colors group-hover/row-group:bg-white/[0.03]"
                >
                  {tIdx === 0 && (
                    <td
                      rowSpan={group.terms.length}
                      className="px-6 py-4 align-middle border-r border-white/5 bg-white/[0.01] group-hover/row-group:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white/20 group-hover/row-group:text-orange-500/40 transition-colors">{group.ones}</span>
                        <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-600 group-hover/row-group:text-orange-500/40 transition-colors">Ones</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 border-b border-white/5 group-last:border-0">
                    <BinaryChips binary={term.binary} />
                  </td>
                  <td className="px-6 py-4 border-b border-white/5 group-last:border-0">
                    <div className="flex flex-wrap gap-1">
                      {term.covers.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400 border border-white/5 group-hover/row-group:text-orange-400 group-hover/row-group:border-orange-500/20 transition-all">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

export default function SimplificationViz({ data }) {
  if (!data || !data.iterations) return null;

  return (
    <div className="flex flex-col gap-12">
      {data.iterations.map((iter) => (
        <IterationTable key={iter.iteration} iteration={iter.iteration} groups={iter.groups} />
      ))}
    </div>
  );
}
