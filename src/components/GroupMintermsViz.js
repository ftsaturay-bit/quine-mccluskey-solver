import React from "react";

// Renders a single binary string as individual bit chips
function BinaryBits({ binary }) {
  return (
    <div className="flex gap-1">
      {binary.split("").map((bit, i) => (
        <span
          key={i}
          className={`
            w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-xs font-black font-mono
            transition-all duration-300
            ${
              bit === "1"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                : "bg-slate-800/60 text-slate-500 border border-slate-700/50"
            }
          `}
        >
          {bit}
        </span>
      ))}
    </div>
  );
}

// A single minterm row: bits + decimal
function MintermRow({ decimal, binary }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl bg-slate-900/50 border border-orange-500/10 hover:border-orange-500/40 hover:bg-slate-900/80 transition-all duration-200 group">
      <BinaryBits binary={binary} />
      <span className="text-slate-500 text-xs font-mono group-hover:text-orange-400 transition-colors whitespace-nowrap">
        = {decimal}
      </span>
    </div>
  );
}

// A single group column
function GroupColumn({ ones, minterms }) {
  const style = "from-blue-900/20 border-blue-700/30 text-blue-400";

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-gradient-to-b ${style} p-4 gap-3 min-w-fit flex-shrink-0`}
    >
      {/* Group Header */}
      <div className="text-center pb-3 border-b border-white/5">
        <span className="text-[10px] uppercase tracking-[0.25em] font-black opacity-60">
          Group
        </span>
        <div className="text-2xl font-black">{ones}</div>
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">
          {ones === 1 ? "1 one" : `${ones} ones`}
        </span>
      </div>
      {/* Minterms */}
      <div className="flex flex-col gap-2">
        {minterms.map((m) => (
          <MintermRow key={m.decimal} decimal={m.decimal} binary={m.binary} />
        ))}
      </div>
    </div>
  );
}

export default function GroupMintermsViz({ data }) {
  if (!data) return null;
  const { originalMinterms, complement, groups } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Info Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl px-4 py-3 transition-all hover:border-blue-500/20">
          <span className="text-[10px] uppercase tracking-widest font-black text-slate-600 block mb-1">
            Original Minterms
          </span>
          <span className="font-mono text-sm text-slate-300">
            {originalMinterms.join(", ")}
          </span>
        </div>
        <div className="flex-1 bg-slate-900/60 border border-orange-500/20 rounded-xl px-4 py-3 transition-all hover:border-orange-500/40 group/info">
          <span className="text-[10px] uppercase tracking-widest font-black text-orange-500/40 group-hover/info:text-orange-500/60 block mb-1 transition-colors">
            Complement (Maxterms)
          </span>
          <span className="font-mono text-sm text-orange-400/90 group-hover/info:text-orange-500 transition-colors">
            {complement.join(", ")}
          </span>
        </div>
      </div>

      {/* Group Columns — horizontal scroll on small screens */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar justify-start">
        {groups.map((g) => (
          <GroupColumn key={g.ones} ones={g.ones} minterms={g.minterms} />
        ))}
      </div>
    </div>
  );
}
