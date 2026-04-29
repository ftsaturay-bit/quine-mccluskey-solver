# Quine-McCluskey Algorithm — Logic Explanation

## What It Does

The Quine-McCluskey (QMC) algorithm systematically minimizes a Boolean function into its **Product of Sums (POS)** form. It is a tabular method that produces the same result as a Karnaugh map but works for any number of variables (up to ~6 in practice).

**Given:** A list of minterms (the input terms where the function equals 1)  
**Output:** A minimized POS Boolean expression

---

## Key Concepts

### Minterms vs Maxterms

| Term | Meaning | Function value |
|------|---------|---------------|
| Minterm | A specific input combination where output = **1** | f = 1 |
| Maxterm | A specific input combination where output = **0** | f = 0 |

For **POS minimization**, we work with the **maxterms** — the complement of the given minterms.

> If minterms = {0, 1, 3} and we have 3 variables (2³ = 8 total),  
> then maxterms = {2, 4, 5, 6, 7}

---

## Step-by-Step Algorithm

### Step 0 — Generate Maxterms (Complement)

Convert the given minterms to their complement:

```
totalTerms = 2 ^ numberOfVariables
maxterms = [0 .. totalTerms-1] that are NOT in minterms
```

All subsequent steps operate on these **maxterms**.

---

### Step 1 — Convert to Binary and Group by Number of 1-bits

Each maxterm decimal value is converted to a binary string of fixed length (padded with leading zeros).

Terms are sorted into groups based on how many `1` bits they contain.

**Example** (4 variables, maxterms = {2, 4, 5, 6, 7}):

```
Group 1 (one 1):   2 → 0010,   4 → 0100
Group 2 (two 1s):  5 → 0101,   6 → 0110
Group 3 (three 1s):7 → 0111
```

---

### Step 2 — Combine Adjacent Groups (Find Prime Implicants)

Compare every pair of terms from adjacent groups (group i and group i+1).

**Combining rule:** Two terms can be combined **if and only if they differ in exactly one bit position**. The differing position is replaced with a dash `-` (don't-care).

```
0010 (2)
0100 (4)
→ differ in 3 positions → CANNOT combine

0100 (4)
0101 (5)
→ differ in 1 position (last bit) → COMBINE → 010- (covers 4, 5)
```

This iterates until no more combinations are possible. **Any term that could not be combined in a given iteration is a Prime Implicant.**

**Iteration tracking:**
- Iteration 0: original maxterm groups
- Iteration 1: combinations of iteration 0
- Iteration 2: combinations of iteration 1
- ... and so on

---

### Step 3 — Build the Prime Implicant Table

Create a grid:

- **Rows** = each Prime Implicant found in Step 2
- **Columns** = each original maxterm
- Mark `X` where a Prime Implicant **covers** a maxterm (i.e., the maxterm is in the PI's set of covered terms)

```
Prime Implicant  | 2    4    5    6    7
-----------------+------------------------
010-             |      X    X         
-110             |           X    X    
-111             |                X    X
```

---

### Step 4 — Find Essential Prime Implicants (EPIs)

A **column (maxterm) covered by exactly one Prime Implicant** identifies an **Essential Prime Implicant** — it MUST be included in the final expression.

```
If maxterm 2 is only covered by PI "010-"
→ "010-" is an Essential Prime Implicant
```

**Process:**
1. Identify all EPIs this way
2. Mark all maxterms covered by those EPIs
3. For any **still-uncovered** maxterms, greedily pick the PI that covers the most remaining maxterms
4. Repeat until all maxterms are covered

---

### Step 5 — Convert PIs to POS Expression

Each selected PI has a binary/dash string. Convert it to a POS **sum clause**:

| Bit value | Meaning in POS | Example (variable A) |
|-----------|---------------|----------------------|
| `0` | Variable is **uncomplemented** | `A` |
| `1` | Variable is **complemented** | `A'` |
| `-` | Don't-care — **skip this variable** | _(omit)_ |

- Literals are joined with ` + ` inside parentheses: `(A + B')`
- All clauses are ANDed together with ` · `: `(A + B') · (C + D)`

**Example:**

```
PI binary: 010-   Variables: ABCD
→ A=0 → A (uncomplemented)
→ B=1 → B' (complemented)
→ C=0 → C (uncomplemented)
→ D=- → skip
→ Result: (A + B' + C)
```

---

## Full Worked Example

**Input:** minterms = `{0, 1, 2, 5}`, variables = `ABCD` (4 variables, 16 total)

**Step 0 — Generate maxterms:**
```
Maxterms = {3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
```

**Step 1 — Group by 1-bits:**
```
Group 1: 4→0100,  8→1000
Group 2: 3→0011,  6→0110,  9→1001,  10→1010,  12→1100
Group 3: 7→0111,  11→1011, 13→1101, 14→1110
Group 4: 15→1111
```

**Step 2 — Combine and find Prime Implicants** (iterate until no more combinations)

**Step 3 — Prime Implicant Table** (mark coverage)

**Step 4 — Select EPIs + greedy cover**

**Step 5 — Build POS expression** joining all selected PI clauses

---

## Data Flow Through the Code

```
minterms input
     │
     ▼
generateComplement()   → maxterms
     │
     ▼
groupByOnes()          → groups (iteration 0)
     │
     ▼
findPrimeImplicants()  → primeImplicants[]
     │
     ▼
createPrimeImplicantTable()  → coverage table
     │
     ▼
findEssentialPrimeImplicants()  → essentialPrimeImplicants[]
     │
     ▼
getPOS()              → "(A + B') · (C + D)" 
```

---

## Minterm Class Role

The `Minterm` class represents **one row** at any stage of the algorithm — either:
- A single original maxterm (e.g. `4 → 0100`, covers `{4}`)
- A combined term from a later iteration (e.g. `010-`, covers `{4, 5}`)

Key operations it supports:
- `combineMinterms(other)` — try to merge two terms (differ by 1 bit)
- `countNumberOfOnes()` — determines which group it belongs to
- `doesItMatch(value)` — used to fill in the prime implicant table
- `equals(other)` — deduplication of combined terms

---

## Important Notes

- A term with **`-` (don't-care)** in its binary string covers **multiple** maxterms
- The algorithm works on **maxterms** for POS, but would work on **minterms** for SOP (Sum of Products)
- `n` variables → `2^n` total possible terms
- Max practical `n` is about 6 due to exponential growth in combinations
