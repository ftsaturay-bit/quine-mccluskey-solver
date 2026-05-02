import Minterm from './Minterm';

export default class QuineMcCluskeyAlgorithm {

  constructor(mintermsDecimal, variablesLetter) {
    //Store the original list of minterms (mintermsDecimal) and the variable letters (variablesLetter)
    this.mintermsDecimal = mintermsDecimal;
    this.variablesLetter = variablesLetter;

    //Get the number Of Variables 
    this.numberOfVariables = variablesLetter.length;

    //Generate the maxterms
    //       and store the result as this.mintermsDecimal
    this.mintermsDecimal = this.generateComplement(mintermsDecimal);

    //Initialize minterm list
    this.mintermList = [];

    //Initialize an empty array that will hold groups at each iteration
    this.simplification = [];

    //Initialize an empty array that will store prime implicants
    this.primeImplicants = [];

    //Initialize an empty array that will store essential prime implicants
    this.essentialPrimeImplicants = [];

    //Initialize the ff display string fields: this.simplificationDisplay, this.primeImplicantTableDisplay, this.essentialPrimeImplicantsDisplay
    this.simplificationDisplay = "";
    this.primeImplicantTableDisplay = "";
    this.essentialPrimeImplicantsDisplay = "";

    //Convert each decimal value in this.mintermsDecimal into a Minterm object and push it to this.mintermList
    for (let i = 0; i < this.mintermsDecimal.length; i++) {
      let decimalValue = this.mintermsDecimal[i];
      let MintermObject = new Minterm(decimalValue, this.numberOfVariables);
      this.mintermList.push(MintermObject);
    }
  }

  // TODO: Given the original minterms array, compute and return all integers in range [0, 2^n)
  //       that are NOT in the minterms list — these are the maxterms (complement)
  generateComplement(minterms) {

    // Convert input minterms array to a Set for fast lookup
    const mintermSet = new Set(this.mintermsDecimal)

    let complementInput = [];

    // Collect all values from 0 to 2^n - 1 that are NOT in the minterm set (these are maxterms)
    for (let i = 0; i < (2 ** this.numberOfVariables) - 1; i++) {
      if (!mintermSet.has(i)) {
        complementInput.push(i);
      }
    }
    // Return the maxterms (complement of the given minterms)
    return complementInput;
  }

  solve() {
    // TODO: Step 1 — Call groupByOnes() to group minterms by their number of 1-bits
    // TODO: Step 2 — Call findPrimeImplicants(groups) to iteratively combine groups
    // TODO: Step 3 — Call createPrimeImplicantTable() to build the coverage table
    // TODO: Step 4 — Call findEssentialPrimeImplicants() to select the minimal cover
  }

  groupByOnes() {
    // Initialize (numberOfVariables + 1) empty groups, one per possible count of 1s
    let groups = Array.from({ length: this.numberOfVariables + 1 }, () => []);

    // Place each minterm into the group matching its number of 1-bits
    for (let minterm of this.mintermList) {
      groups[minterm.countNumberOfOnes()].push(minterm);
    }

    return groups;
  }

  findPrimeImplicants(groups) {
    // TODO: Set currentGroups = groups and push a deep copy as the first entry in this.simplification
    // TODO: Loop until no new combinations are found:
    //   a) Create newGroups array
    //   b) Track which terms were combined this iteration (combinedTerms Set)
    //   c) For each adjacent pair of groups (i, i+1), try to combine every pair of minterms
    //      using minterm1.combineMinterms(minterm2)
    //   d) If a combination succeeds, mark both source minterms as combined and add
    //      the new combined term to newGroups (avoiding exact duplicates)
    //   e) Any term in currentGroups that was NOT combined becomes a prime implicant
    //   f) If no combinations were found at all, break the loop
    //   g) Set currentGroups = newGroups and push a deep copy into this.simplification
    // TODO: Remove duplicate prime implicants (compare by binary representation)
  }

  createPrimeImplicantTable() {
    // TODO: Build a text table where:
    //   - Columns represent each maxterm decimal value
    //   - Rows represent each prime implicant
    //   - Mark an 'X' where a prime implicant covers a maxterm (pi.doesItMatch(m))
    // TODO: Store result in this.primeImplicantTableDisplay
  }

  getPrimeImplicantTableData() {
    // TODO: Return a structured object:
    //   {
    //     primeImplicants: [ { expression: string, minterms: number[] }, ... ],
    //     minterms: number[]
    //   }
    // TODO: Use mintermToPOSExpression(pi) for the expression string
    // TODO: Spread pi.getSetOfMinterms() into an array for minterms
  }

  // TODO: Convert a Minterm's binary representation into a POS (sum) clause string.
  //   - Wrap result in parentheses: e.g. "(A + B')"
  //   - For each bit position that is NOT '-':
  //     * If the bit is '0', write the variable name as-is (uncomplemented in POS)
  //     * If the bit is '1', write the variable name with a prime (complemented): e.g. "A'"
  //   - Separate literals with " + "
  mintermToPOSExpression(minterm) {
    // TODO: Get the binary representation from minterm.getBinaryRepresentation()
    // TODO: Iterate over each character in the binary string
    // TODO: Build and return the expression string following the POS rules above
  }

  findEssentialPrimeImplicants() {
    // TODO: Build a coverageMap: Map<maxterm, PrimeImplicant[]>
    //       mapping each maxterm to the list of prime implicants that cover it
    // TODO: Find essential prime implicants (EPIs) — maxterms covered by exactly one PI
    //       Add each such PI to this.essentialPrimeImplicants (avoid duplicates)
    //       Track all maxterms covered by EPIs in a coveredMinterms Set
    // TODO: For any uncovered maxterms remaining:
    //       Greedily select the PI that covers the most uncovered maxterms
    //       Repeat until all maxterms are covered
    // TODO: Build this.essentialPrimeImplicantsDisplay string showing:
    //       - All EPIs found
    //       - Any additional PIs added to cover remaining maxterms
    //       - Final list of selected prime implicants
  }

  displayGroupedMinterms() {
    // TODO: Return a formatted string from this.simplification[0] (first iteration groups)
    // TODO: Show the original minterms, the complement being used, and each group with
    //       its decimal value and binary representation
  }

  displayCombiningTerms() {
    // TODO: Return a string showing each iteration (from simplification index 1 onwards)
    // TODO: For each iteration show each group's combined terms with their binary rep
    //       and the list of source minterms they were combined from
    // TODO: After all iterations, list all final prime implicants with their expressions
    //       and the maxterms they cover
  }

  displayPrimeImplicantsTable() {
    // TODO: Return this.primeImplicantTableDisplay (set by createPrimeImplicantTable)
  }

  displayEssentialPrimeImplicantsTable() {
    // TODO: Return this.essentialPrimeImplicantsDisplay (set by findEssentialPrimeImplicants)
  }

  getPOS() {
    // TODO: If essentialPrimeImplicants is empty, return a "no solution" message
    // TODO: Otherwise, join each EPI's POS expression with " · " (product/AND symbol)
    //       and return the full POS expression string
  }
}