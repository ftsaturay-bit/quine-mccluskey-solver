import React, { useState } from 'react';
import InfiniteGrid from './components/TheInfiniteGrid';
import StarBorder from './components/StarBorder';
import GroupMintermsViz from './components/GroupMintermsViz';
import SimplificationViz from './components/SimplificationViz';
import PITableViz from './components/PITableViz';
import FormattedTextViz from './components/FormattedTextViz';

function App() {
  const [minterms, setMinterms] = useState('');
  const [variables, setVariables] = useState('');
  const [output, setOutput] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setOutput('');

    // Basic validation
    if (!minterms.trim() || !variables.trim()) {
      setError('Both minterms and variables are required.');
      return;
    }

    if (!/^[0-9,\s]*$/.test(minterms)) {
      setError('Minterms must be comma-separated numbers only.');
      return;
    }

    if (!/^[a-zA-Z]+$/.test(variables)) {
      setError('Variables must be letters only (e.g. ABCD).');
      return;
    }

    try {
      const QMC = require('./logic/QuineMcCluskeyAlgorithm').default;
      const mintermArray = minterms.split(',').map(s => parseInt(s.trim(), 10));
      const qm = new QMC(mintermArray, variables.toUpperCase());
      qm.solve();
      setResults({
        groupedData: qm.getGroupedMintermsData(),
        simplificationData: qm.getSimplificationData(),
        piTableData: qm.getPITableData(),
        grouped: qm.displayGroupedMinterms(),
        pi: qm.displayCombiningTerms(),
        table: qm.displayPrimeImplicantsTable(),
        epi: qm.displayEssentialPrimeImplicantsTable(),
        final: qm.getPOS()
      });
      setOutput(true);
      // Scroll to results after render
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setMinterms('');
    setVariables('');
    setOutput('');
    setError('');
  };
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full font-sans text-slate-200 overflow-x-hidden"
    >
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0">
        <InfiniteGrid mousePos={mousePos} />
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl flex flex-col items-center space-y-12">

          {/* Top: Title and Subtitle */}
          <div className="text-center space-y-6">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-white">
              Logic <span className="text-blue-500 italic">Minimizer</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
              Simplify boolean expressions using the Quine-McCluskey tabulation method.
              Get precise, minimized results instantly.
            </p>
          </div>

          {/* Bottom: Horizontal Input Bar */}
          <div className="w-full">
            <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-3 md:p-4 shadow-2xl relative group">
              <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

                {/* Minterms Input */}
                <div className="flex-1 min-w-[200px] relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Minterms</span>
                  </div>
                  <input
                    type="text"
                    value={minterms}
                    onChange={(e) => setMinterms(e.target.value)}
                    placeholder="0, 1, 2, 5, 6, 7"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-24 pr-6 py-5 focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-800 font-medium"
                  />
                </div>

                {/* Variables Input */}
                <div className="flex-none lg:w-64 relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Variables</span>
                  </div>
                  <input
                    type="text"
                    value={variables}
                    onChange={(e) => setVariables(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="ABCD"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-28 pr-6 py-5 focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-800 font-medium text-center"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-5 rounded-2xl transition-all shadow-lg shadow-blue-900/40 active:scale-95 uppercase tracking-wider text-xs whitespace-nowrap"
                  >
                    Minimize Logic
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="group relative bg-transparent hover:bg-orange-500/5 text-orange-500/50 hover:text-orange-400 font-black px-6 py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-wider text-xs border border-orange-500/20 hover:border-orange-500/50 shadow-[0_0_15px_rgba(234,88,12,0)] hover:shadow-[0_0_15px_rgba(234,88,12,0.1)]"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {error && (
              <div className="mt-4 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── RESULTS SECTION ── */}
      {output && results && (
        <section id="results" className="relative z-10 flex flex-col items-center px-4 py-24 border-t border-white/5 overflow-hidden">


          <div className="w-full max-w-6xl space-y-16">
            
            {/* STEP 1: Group Minterms */}
            <div className="flex gap-8 md:gap-16 relative group/step">
              <div className="flex flex-col items-center flex-none relative pt-8">
                <div className="w-12 h-12 rounded-full bg-orange-600 border-4 border-slate-950 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(249,115,22,0.5)] group-hover/step:scale-110 transition-transform">
                  <span className="text-sm font-black text-white">1</span>
                </div>
                <div className="absolute top-20 bottom-[-64px] w-0.5 bg-gradient-to-b from-orange-500/40 via-orange-500/10 to-transparent z-0"></div>
              </div>
              <div className="flex-1 min-w-0">
                <StepCard index="01" title="Group Minterms">
                  <GroupMintermsViz data={results.groupedData} />
                </StepCard>
              </div>
            </div>

            {/* STEP 2: Prime Implicants */}
            <div className="flex gap-8 md:gap-16 relative group/step">
              <div className="flex flex-col items-center flex-none relative pt-8">
                <div className="w-12 h-12 rounded-full bg-orange-600 border-4 border-slate-950 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(249,115,22,0.5)] group-hover/step:scale-110 transition-transform">
                  <span className="text-sm font-black text-white">2</span>
                </div>
                <div className="absolute top-20 bottom-[-64px] w-0.5 bg-gradient-to-b from-orange-500/40 via-orange-500/10 to-transparent z-0"></div>
              </div>
              <div className="flex-1 min-w-0">
                <StepCard index="02" title="Prime Implicants">
                  <SimplificationViz data={results.simplificationData} />
                </StepCard>
              </div>
            </div>

            {/* STEP 3: Prime Implicant Table */}
            <div className="flex gap-8 md:gap-16 relative group/step">
              <div className="flex flex-col items-center flex-none relative pt-8">
                <div className="w-12 h-12 rounded-full bg-orange-600 border-4 border-slate-950 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(249,115,22,0.5)] group-hover/step:scale-110 transition-transform">
                  <span className="text-sm font-black text-white">3</span>
                </div>
                <div className="absolute top-20 bottom-[-64px] w-0.5 bg-gradient-to-b from-orange-500/40 via-orange-500/10 to-transparent z-0"></div>
              </div>
              <div className="flex-1 min-w-0">
                <StepCard index="03" title="Prime Implicant Table">
                  <PITableViz data={results.piTableData} />
                </StepCard>
              </div>
            </div>

            {/* STEP 4: Essential Prime Implicants */}
            <div className="flex gap-8 md:gap-16 relative group/step">
              <div className="flex flex-col items-center flex-none relative pt-8">
                <div className="w-12 h-12 rounded-full bg-orange-600 border-4 border-slate-950 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(249,115,22,0.5)] group-hover/step:scale-110 transition-transform">
                  <span className="text-sm font-black text-white">4</span>
                </div>
                <div className="absolute top-20 bottom-[-64px] w-0.5 bg-gradient-to-b from-orange-500/40 via-orange-500/10 to-transparent z-0"></div>
              </div>
              <div className="flex-1 min-w-0">
                <StepCard index="04" title="Essential Prime Implicants">
                  <FormattedTextViz content={results.epi} />
                </StepCard>
              </div>
            </div>

            {/* STEP 5: Final Expression */}
            <div className="flex gap-8 md:gap-16 relative group/step">
              <div className="flex flex-col items-center flex-none relative pt-8">
                <div className="w-12 h-12 rounded-full bg-orange-600 border-4 border-slate-950 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(249,115,22,0.5)] group-hover/step:scale-110 transition-transform">
                  <span className="text-sm font-black text-white">5</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative group">
                  <StarBorder color="#f97316" speed="2.5s" thickness={6} className="w-full">
                    <div className="flex flex-col items-center py-2">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                          <span className="text-6xl font-black text-orange-500/10 tabular-nums">05</span>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                            Final Expression
                          </h3>
                          <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-slate-500 mt-1.5">Minimized POS Expression</p>
                        </div>
                      </div>
                      
                      <div className="relative w-full bg-slate-950/80 backdrop-blur-xl border border-orange-500/20 rounded-[1.5rem] p-6 md:p-10 text-center shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                        {/* Background Accents */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
                        
                        <p className="text-xl md:text-3xl font-mono font-black text-orange-400 break-words tracking-tight">
                          {results.final.replace("Final POS Expression: ", "")}
                        </p>
                      </div>
                    </div>
                  </StarBorder>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}
    </div>
  );
}

// Helper Component for Steps
function StepCard({ index, title, content, children }) {
  return (
    <div className="relative">
      <StarBorder color="#f97316" speed="2.5s" thickness={4} className="w-full">
        <div className="flex items-center gap-6 mb-8">
          <span className="text-5xl font-black text-white/5 tabular-nums">{index}</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-300 uppercase tracking-widest">{title}</h3>
        </div>
        {children ? (
          children
        ) : (
          <pre className="w-full bg-black/40 rounded-2xl p-6 overflow-x-auto text-blue-300/80 font-mono text-sm leading-relaxed border border-white/5">
            {content}
          </pre>
        )}
      </StarBorder>
    </div>
  );
}

export default App;

