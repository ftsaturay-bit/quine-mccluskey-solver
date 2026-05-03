import { useState } from 'react';
import './App.css';

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
    <div className="app">
      <h1>Quine-McCluskey Minimizer</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="minterms">Minterms (comma-separated):</label>
          <br />
          <input
            id="minterms"
            type="text"
            value={minterms}
            onChange={(e) => setMinterms(e.target.value)}
            placeholder="e.g. 0,1,2,5,6,7"
          />
        </div>

        <div>
          <label htmlFor="variables">Variables (letters only, max 6):</label>
          <br />
          <input
            id="variables"
            type="text"
            value={variables}
            onChange={(e) => setVariables(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="e.g. ABCD"
          />
        </div>

        <div>
          <button type="submit">Minimize</button>
          <button type="button" onClick={handleClear}>Clear</button>
        </div>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {output && (
        <div>
          <h2>Output</h2>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}

export default App;