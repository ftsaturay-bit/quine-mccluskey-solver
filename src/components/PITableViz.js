import React from 'react';

export default function PITableViz({ data }) {
  if (!data || !data.rows || !data.minterms) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-800/50 border-b border-white/10">
              <th className="sticky left-0 z-20 bg-slate-800 px-6 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400 border-r border-white/10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                Prime Implicants
              </th>
              {data.minterms.map((m) => (
                <th key={m} className="px-4 py-4 text-[10px] uppercase tracking-widest font-black text-slate-400 text-center border-r border-white/5 min-w-[50px]">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                <td className="sticky left-0 z-20 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-r border-white/10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-mono font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                      {row.expression}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {row.binary}
                    </span>
                  </div>
                </td>
                {data.minterms.map((m) => {
                  const isCovered = row.coveredMinterms.includes(m);
                  return (
                    <td key={m} className={`px-4 py-4 text-center border-r border-white/5 ${isCovered ? 'bg-orange-500/5' : ''}`}>
                      {isCovered && (
                        <div className="flex justify-center">
                          <svg 
                            className="w-4 h-4 text-orange-500 drop-shadow-[0_0_8px_rgba(234,88,12,0.6)]" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={4}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
