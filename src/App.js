import { useState } from 'react';
import InfiniteGrid from './components/TheInfiniteGrid';

function App() {
  const [minterms, setMinterms] = useState('');
  const [variables, setVariables] = useState('');
  const [output, setOutput] = useState('');
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
      setOutput(
        qm.displayGroupedMinterms() + '\n' +
        qm.displayCombiningTerms() + '\n' +
        qm.displayPrimeImplicantsTable() + '\n' +
        qm.displayEssentialPrimeImplicantsTable() + '\n' +
        qm.getPOS()
      );
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
      className="relative min-h-screen w-full font-sans text-slate-200 overflow-x-hidden"
    >
      {/* Background Component */}
      <div className="fixed inset-0 z-0">
        <InfiniteGrid mousePos={mousePos} />
      </div>

      {/* Main Content Overlay */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
              Logic <span className="text-blue-500">Minimizer</span>
            </h1>
            <p className="text-slate-400 font-medium">Quine-McCluskey Implementation</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Minterms</label>
                  <input
                    type="text"
                    value={minterms}
                    onChange={(e) => setMinterms(e.target.value)}
                    placeholder="e.g. 0, 1, 2, 5, 6, 7"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Variables</label>
                  <input
                    type="text"
                    value={variables}
                    onChange={(e) => setVariables(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="e.g. ABCD"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  MINIMIZE LOGIC
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all active:scale-95"
                >
                  CLEAR
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {output && (
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/10"></div>
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Optimization Results</h2>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
                <pre className="w-full bg-black/60 rounded-2xl p-6 overflow-x-auto text-blue-400 font-mono text-sm leading-relaxed border border-white/5">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;