import { useState } from 'react';
import InfiniteGrid from './components/TheInfiniteGrid';

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
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-black px-6 py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-wider text-xs border border-white/5"
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
        <section id="results" className="relative z-10 flex flex-col items-center px-4 py-24 border-t border-white/5 space-y-16">
          
          <div className="flex flex-col items-center gap-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter text-center">Optimization Journey</h2>
            <div className="h-1 w-24 bg-blue-500 rounded-full"></div>
          </div>

          <div className="w-full max-w-6xl flex gap-8 md:gap-16">
            
            {/* LEFT SIDE: VERTICAL STEPPER */}
            <div className="hidden md:flex flex-col items-center relative pt-10">
              {/* The Connecting Line */}
              <div className="absolute top-10 bottom-10 w-px bg-gradient-to-b from-blue-500 via-blue-500/50 to-transparent"></div>
              
              <div className="flex flex-col gap-[28rem]"> {/* Manual gap adjustment to match card heights roughly */}
                <StepIndicator num="1" />
                <StepIndicator num="2" />
                <StepIndicator num="3" />
                <StepIndicator num="4" />
                <StepIndicator num="5" />
              </div>
            </div>

            {/* RIGHT SIDE: THE CARDS */}
            <div className="flex-1 space-y-16">
              
              {/* STEP 1: Group Minterms */}
              <StepCard index="01" title="Group Minterms" content={results.grouped} />

              {/* STEP 2: Prime Implicants */}
              <StepCard index="02" title="Prime Implicants" content={results.pi} />

              {/* STEP 3: Prime Implicant Table */}
              <StepCard index="03" title="Prime Implicant Table" content={results.table} />

              {/* STEP 4: Essential Prime Implicants */}
              <StepCard index="04" title="Essential Prime Implicants" content={results.epi} />

              {/* STEP 5: Final Expression */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
                   <div className="flex items-center gap-6 mb-8">
                      <span className="text-6xl font-black text-blue-500/20 tabular-nums">05</span>
                      <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Final Expression</h3>
                   </div>
                   <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
                      <p className="text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-blue-400 break-words">
                        {results.final.replace("Final POS Expression: ", "")}
                      </p>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Helper Component for the Numbered Circles
function StepIndicator({ num }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-slate-950 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
        <span className="text-sm font-black text-white">{num}</span>
      </div>
    </div>
  );
}

// Helper Component for Steps
function StepCard({ index, title, content }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-white/5 rounded-[2.5rem] transition duration-500"></div>
      <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
        <div className="flex items-center gap-6 mb-8">
          <span className="text-5xl font-black text-slate-700 tabular-nums">{index}</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-300 uppercase tracking-widest">{title}</h3>
        </div>
        <pre className="w-full bg-black/40 rounded-2xl p-6 overflow-x-auto text-blue-300/80 font-mono text-sm leading-relaxed border border-white/5">
          {content}
        </pre>
      </div>
    </div>
  );
}

export default App;

