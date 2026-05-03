# Quine-McCluskey Boolean Minimizer

A React-based tool that minimizes Boolean expressions using the Quine-McCluskey algorithm (POS form).

---

## How to Run

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## What We Implemented

### Inputs

| Field | Description |
|-------|-------------|
| Minterms | Comma-separated decimal values (e.g. `0,1,2,5`) |
| Variables | A string of unique letters, max 6 (e.g. `ABCD`) |

### Output

The app should then display all intermediate steps and the final minimized POS expression in a `<pre>` block.

---

## Logic Files

### `src/logic/Minterm.js`

Represents a single minterm or a combined group of minterms.

**Methods to implement:**

| Method | What it does |
|--------|-------------|
| `constructor(value, n, setOfMinterms, binaryRep)` | Two modes: single minterm (compute binary from value) or combined minterm (use provided binary + set) |
| `getValue()` | Return the decimal value |
| `getBinaryRepresentation()` | Return the binary/dash string |
| `getSetOfMinterms()` | Return the Set of decimal minterms this term covers |
| `countNumberOfOnes()` | Count `1` characters in the binary string |
| `toBinaryString(value, n)` | Convert decimal to zero-padded binary string of length n |
| `combineMinterms(other)` | If terms differ in exactly 1 bit, return a new combined Minterm with `-` in that position; else return `{ success: false }` |
| `doesItMatch(value)` | Return true if value is in the setOfMinterms |
| `mintermToExpression(variables)` | Convert binary/dash string to SOP literal expression |
| `equals(other)` | Compare binary representations |
| `toString()` | Return the binary representation |

---

### `src/logic/QuineMcCluskeyAlgorithm.js`

Contains the full QMC algorithm. Takes a list of **minterms** and operates in **POS form** (using maxterms — the complement of the minterms).

**Methods to implement:**

| Method | What it does |
|--------|-------------|
| `constructor(mintermsDecimal, variablesLetter)` | Store inputs, generate complement (maxterms), convert each to a Minterm object |
| `generateComplement(minterms)` | Return all integers in `[0, 2^n)` NOT in minterms |
| `solve()` | Orchestrate steps 1–4 |
| `groupByOnes()` | Sort minterms into groups by their count of 1-bits |
| `findPrimeImplicants(groups)` | Iteratively combine adjacent groups; uncombined terms become prime implicants |
| `createPrimeImplicantTable()` | Build a text coverage table: PI rows × maxterm columns, mark 'X' where PI covers maxterm |
| `getPrimeImplicantTableData()` | Return structured `{ primeImplicants, minterms }` object for rendering |
| `mintermToPOSExpression(minterm)` | Convert binary/dash rep to POS clause string e.g. `(A + B')` |
| `findEssentialPrimeImplicants()` | Find EPIs (columns covered by one PI), then greedily cover remaining maxterms |
| `displayGroupedMinterms()` | Return formatted string of initial groups |
| `displayCombiningTerms()` | Return string showing all iteration steps and final prime implicants |
| `displayPrimeImplicantsTable()` | Return the prime implicant table string |
| `displayEssentialPrimeImplicantsTable()` | Return the EPI selection display string |
| `getPOS()` | Return the final minimized POS expression |

---

## Algorithm Steps

```
1. Generate complement (maxterms) from minterms
2. Convert each maxterm to binary; group by number of 1-bits
3. Iteratively combine adjacent groups (terms differing in exactly 1 bit)
   → Uncombined terms at each iteration become prime implicants
4. Build prime implicant table (PI rows × maxterm columns)
5. Find essential prime implicants (EPIs) — maxterms covered by exactly 1 PI
6. Greedily cover remaining maxterms with remaining PIs
7. Build POS expression: AND (·) all selected PI clauses together
```

---

## POS Expression Rules

For each bit in a prime implicant's binary representation:
- Skip `-` (don't-care) positions
- Bit `0` → variable is **uncomplemented** (e.g. `A`)
- Bit `1` → variable is **complemented** (e.g. `A'`)
- Wrap each term in parentheses and separate literals with ` + `
- Join all terms with ` · `

**Example:** minterms = `{0,1,2,5}`, variables = `ABCD` → `(A + B) · (A + C')`

---

## Frontend (`src/App.js`)

The form collects:
1. **Minterms** — text input, comma-separated integers
2. **Variables** — text input, uppercase letters only, max 6

On submit:
- Validate inputs (numbers only, letters only, no duplicates, values within range)
- Instantiate `QuineMcCluskeyAlgorithm` and call `.solve()`
- Display all step outputs in a `<pre>` block

On clear:
- Reset all fields and output

---

## Project Structure

```
src/
  App.js                  ← Main component (form + output)
  App.css                 ← Minimal styles
  index.js                ← React entry point
  index.css               ← Global reset
  logic/
    Minterm.js            ← Minterm class (TODO stubs)
    QuineMcCluskeyAlgorithm.js  ← QMC algorithm (TODO stubs)
    ALGORITHM.md          ← detailed explanation of logic 
```
