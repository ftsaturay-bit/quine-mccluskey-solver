import { useState } from 'react';

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
      //Import and instantiate QuineMcCluskeyAlgorithm once logic is implemented
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

  return (
    <div className="app-container">
      <h1 className="animate-fade-in">Quine-McCluskey Minimizer</h1>

      <div className="card animate-fade-in stagger-1">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="minterms">Minterms (comma-separated)</label>
            <input
              id="minterms"
              type="text"
              value={minterms}
              onChange={(e) => setMinterms(e.target.value)}
              placeholder="e.g. 0, 1, 2, 5, 6, 7"
              className="hover-lift"
            />
          </div>

          <div className="form-group">
            <label htmlFor="variables">Variables (A-Z, max 6)</label>
            <input
              id="variables"
              type="text"
              value={variables}
              onChange={(e) => setVariables(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="e.g. ABCD"
              className="hover-lift"
            />
          </div>

          <div className="button-group">
            <button type="submit" className="hover-lift">Minimize Logic</button>
            <button type="button" onClick={handleClear} className="hover-lift">Clear All</button>
          </div>
        </form>

        {error && <div className="error-message animate-slide-in">{error}</div>}

        {output && (
          <div className="output-section animate-fade-in stagger-2">
            <h2>Optimization Results</h2>
            <pre>{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;