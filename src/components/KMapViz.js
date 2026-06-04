import React from "react";

// Splits a sorted list of K-Map axis indices into contiguous segments.
// If a gap exists in the indices, the group wraps around the map edge —
// so we return two sub-segments with open borders to indicate continuity.
// e.g. [0, 3] on a 4-col map → two halves: [0,0] and [3,3] with open edges.
function getSegments(indices, maxIndex) {
  if (indices.length === 0) return [];

  // Single cell: no wrapping possible
  if (indices.length === 1) return [{ start: indices[0], end: indices[0], openStart: false, openEnd: false }];

  // All cells on this axis are covered → one full-width segment, no open edges
  if (indices.length === maxIndex + 1) {
    return [{ start: 0, end: maxIndex, openStart: false, openEnd: false }];
  }

  // Detect a gap between consecutive indices — signals a wrap-around grouping
  let gapIndex = -1;
  for (let i = 0; i < indices.length - 1; i++) {
    if (indices[i + 1] - indices[i] > 1) {
      gapIndex = i;
      break;
    }
  }

  // No gap found → contiguous block, single rectangle
  if (gapIndex === -1) {
    return [{ start: indices[0], end: indices[indices.length - 1], openStart: false, openEnd: false }];
  } else {
    // Wrap-around: split into two edge segments with open borders facing the gap
    return [
      { start: 0, end: indices[gapIndex], openStart: true, openEnd: false },
      { start: indices[gapIndex + 1], end: indices[indices.length - 1], openStart: false, openEnd: true }
    ];
  }
}

// All grouping rectangles use a single orange color to match the app's POS theme
const BORDER_COLOR = "border-orange-500";
const BG_COLOR = "bg-orange-500/15";

const KMapViz = ({ minterms, variables, finalImplicants = [] }) => {
  const numVars = variables.length;

  // Standard 2D K-Maps only support up to 4 variables (4×4 grid)
  if (numVars > 4) {
    return (
      <div className="mt-8 p-6 bg-slate-900/60 border border-white/5 rounded-[1.5rem] text-center shadow-2xl">
        <p className="text-slate-400 font-medium">
          K-Map Visualization is only available for up to 4 variables. (You entered {numVars} variables).
        </p>
      </div>
    );
  }

  // Map variable count to Gray-coded row/column header labels.
  // Gray code ordering (00, 01, 11, 10) ensures adjacent cells differ by exactly 1 bit,
  // which is what makes K-Map groupings algebraically valid.
  let rowVars = "";
  let colVars = "";
  let rowLabels = [];
  let colLabels = [];

  if (numVars === 2) {
    rowVars = variables[0];
    colVars = variables[1];
    rowLabels = ["0", "1"];
    colLabels = ["0", "1"];
  } else if (numVars === 3) {
    rowVars = variables[0];
    colVars = variables.substring(1);
    rowLabels = ["0", "1"];
    colLabels = ["00", "01", "11", "10"];
  } else if (numVars === 4) {
    rowVars = variables.substring(0, 2);
    colVars = variables.substring(2);
    rowLabels = ["00", "01", "11", "10"];
    colLabels = ["00", "01", "11", "10"];
  }

  // Build a fast lookup of which decimal values are minterms (1s)
  const mintermSet = new Set(minterms);

  // Concatenate the row and column binary labels to get the cell's decimal value.
  // e.g. row="01", col="10" → "0110" → decimal 6
  const getCellDecimal = (rowLabel, colLabel) => {
    const binaryString = rowLabel + colLabel;
    return parseInt(binaryString, 2);
  };

  // Pre-build a decimal → grid coordinate map so grouping overlay
  // logic can locate cells without re-scanning the label arrays each render.
  const decimalToCoords = {};
  for (let r = 0; r < rowLabels.length; r++) {
    for (let c = 0; c < colLabels.length; c++) {
      const decimal = getCellDecimal(rowLabels[r], colLabels[c]);
      decimalToCoords[decimal] = { r, c };
    }
  }

  return (
    <div className="flex flex-col items-center w-full relative">
      <div className="text-center mb-6">
        <h4 className="text-sm md:text-base font-black text-slate-300 uppercase tracking-[0.3em]">
          Karnaugh Map Visualization
        </h4>
      </div>

      <div className="relative overflow-x-auto bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {/* CSS Grid chosen over <table> so grouping overlays can span multiple cells
            using grid-row/column placement — tables don't allow arbitrary overlapping children. */}
        <div 
          className="relative grid mx-auto"
          style={{
            // clamp() makes cells square and responsive:
            // min 2.5rem on tiny screens, scales with viewport, caps at 5rem on large screens
            gridTemplateColumns: `repeat(${colLabels.length + 1}, clamp(2.5rem, 13vw, 5rem))`,
            gridTemplateRows: `repeat(${rowLabels.length + 1}, clamp(2.5rem, 13vw, 5rem))`
          }}
        >
          {/* Top-Left Corner Header — diagonal split between row and column variable labels */}
          <div className="border-b border-r border-white/10 relative overflow-hidden" style={{ gridRow: 1, gridColumn: 1 }}>
            {/* Diagonal divider to visually separate the two axis labels */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              </svg>
            </div>
            {/* Column variable (e.g. CD) — top-right of the split cell */}
            <span className="absolute top-2 right-2 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
              {colVars}
            </span>
            {/* Row variable (e.g. AB) — bottom-left of the split cell */}
            <span className="absolute bottom-2 left-2 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
              {rowVars}
            </span>
          </div>

          {/* Column Headers (Gray-coded: 00, 01, 11, 10) */}
          {colLabels.map((col, idx) => (
            <div
              key={`header-col-${col}`}
              className="flex items-center justify-center font-mono text-slate-400 border-b border-white/10 text-[10px] sm:text-xs"
              style={{ gridRow: 1, gridColumn: idx + 2 }}
            >
              {col}
            </div>
          ))}

          {/* Row Headers and Data Cells */}
          {rowLabels.map((row, rIdx) => (
            <React.Fragment key={`row-${row}`}>
              {/* Row Header (Gray-coded: 00, 01, 11, 10) */}
              <div
                className="flex items-center justify-center font-mono text-slate-400 border-r border-white/10 text-[10px] sm:text-xs"
                style={{ gridRow: rIdx + 2, gridColumn: 1 }}
              >
                {row}
              </div>

              {/* Data Cells */}
              {colLabels.map((col, cIdx) => {
                const decimal = getCellDecimal(row, col);
                const isMinterm = mintermSet.has(decimal);
                // In POS minimization, maxterms (0s) are grouped — highlight them
                const isMaxterm = !isMinterm;

                return (
                  <div
                    key={`cell-${col}`}
                    className="relative border border-white/5 flex items-center justify-center transition-all duration-300 group hover:bg-white/5 cursor-default overflow-hidden"
                    style={{ gridRow: rIdx + 2, gridColumn: cIdx + 2 }}
                  >
                    {/* Decimal index shown on hover — useful for cross-referencing with the truth table */}
                    <div className="absolute top-1 left-1.5 text-[8px] sm:text-[9px] text-slate-600 font-mono select-none opacity-50 group-hover:opacity-100 transition-opacity">
                      {decimal}
                    </div>

                    {/* Maxterms (0s) glow white to draw attention to the grouped terms in POS context */}
                    <span
                      className={`text-2xl sm:text-3xl font-black font-mono transition-transform duration-300 group-hover:scale-110 z-10 relative
                        ${isMaxterm
                          ? "text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                          : "text-slate-700/50"
                        }`}
                    >
                      {isMinterm ? "1" : "0"}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}

          {/* Grouping Overlays — one colored rectangle per Essential Prime Implicant.
              Each PI maps to a set of covered maxterms; we compute which grid cells
              those occupy and place an absolutely-positioned box over them.
              Wrap-around groups (e.g. left + right columns) are split into two
              sub-rectangles with open borders on the wrap edge to show continuity. */}
          {finalImplicants.map((implicant, idx) => {
            const borderColor = BORDER_COLOR;
            const bgColor = BG_COLOR;

            // Map each covered maxterm decimal to its (row, col) grid coordinate
            const coords = implicant.coveredMinterms.map((m) => decimalToCoords[m]).filter(Boolean);
            if (coords.length === 0) return null;

            const rowIndices = [...new Set(coords.map((c) => c.r))].sort((a, b) => a - b);
            const colIndices = [...new Set(coords.map((c) => c.c))].sort((a, b) => a - b);

            // getSegments handles wrap-around by returning 1 or 2 segments per axis
            const rSegs = getSegments(rowIndices, rowLabels.length - 1);
            const cSegs = getSegments(colIndices, colLabels.length - 1);

            // Slight inset per group index prevents fully overlapping groups from obscuring each other
            const insetStr = `${(idx % 3) * 4 + 4}px`;

            return rSegs.flatMap((rSeg, rSegIdx) => 
              cSegs.map((cSeg, cSegIdx) => (
                <div
                  key={`group-${idx}-${rSeg.start}-${cSeg.start}`}
                  className={`absolute pointer-events-none border-[3px] rounded-2xl ${borderColor} ${bgColor} mix-blend-screen transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]`}
                  style={{
                    gridRowStart: rSeg.start + 2,
                    gridRowEnd: rSeg.end + 3,
                    gridColumnStart: cSeg.start + 2,
                    gridColumnEnd: cSeg.end + 3,
                    
                    // Open borders on wrap edges indicate the group continues on the other side
                    borderTopWidth: rSeg.openStart ? 0 : 3,
                    borderBottomWidth: rSeg.openEnd ? 0 : 3,
                    borderLeftWidth: cSeg.openStart ? 0 : 3,
                    borderRightWidth: cSeg.openEnd ? 0 : 3,
                    
                    // Flatten corner radius on any open edge for a clean half-rectangle look
                    borderTopLeftRadius: (rSeg.openStart || cSeg.openStart) ? 0 : '1rem',
                    borderTopRightRadius: (rSeg.openStart || cSeg.openEnd) ? 0 : '1rem',
                    borderBottomLeftRadius: (rSeg.openEnd || cSeg.openStart) ? 0 : '1rem',
                    borderBottomRightRadius: (rSeg.openEnd || cSeg.openEnd) ? 0 : '1rem',

                    // Inset keeps the border inside the cell boundary and separates overlapping groups
                    top: rSeg.openStart ? 0 : insetStr,
                    bottom: rSeg.openEnd ? 0 : insetStr,
                    left: cSeg.openStart ? 0 : insetStr,
                    right: cSeg.openEnd ? 0 : insetStr,
                    
                    zIndex: 20
                  }}
                />
              ))
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KMapViz;
