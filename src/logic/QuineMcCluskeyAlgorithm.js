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
    // Set currentGroups to the initial groups and create a shallow copy of each group array
    let currentGroups = groups.map(group => [...group]);

    // Push a deep copy of the initial groups as the first entry in simplification
    this.simplification.push(currentGroups.map(group => [...group]));

    while (true) {
      // Create newGroups with the same number of sub-arrays as currentGroups, each starting empty
      let newGroups = Array.from({ length: currentGroups.length }, () => []);

      // Track which minterms were successfully combined this iteration
      let combinedTerms = new Set();

      // Flag to detect if at least one combination occurred this iteration
      let anyCombined = false;

      // Iterate over each adjacent pair of groups (group i and group i+1)
      for (let i = 0; i < currentGroups.length - 1; i++) {

        // Iterate over each minterm in the current group i
        for (let j = 0; j < currentGroups[i].length; j++) {

          // Iterate over each minterm in the next group i+1
          for (let k = 0; k < currentGroups[i + 1].length; k++) {

            // Attempt to combine the minterm from group i with the minterm from group i+1
            let result = currentGroups[i][j].combineMinterms(currentGroups[i + 1][k]);

            if (result.success) {
              // Mark both source minterms as combined so they are not added as prime implicants
              combinedTerms.add(currentGroups[i][j]);
              combinedTerms.add(currentGroups[i + 1][k]);

              // Set the flag to indicate at least one combination happened this iteration
              anyCombined = true;

              // Check if an identical combined term (same binary representation) already exists in newGroups[i]
              let alreadyExists = newGroups[i].some(
                existing => existing.equals(result.minterm)
              );

              // Only add the combined term if it is not already present (avoid duplicates)
              if (!alreadyExists) {
                newGroups[i].push(result.minterm);
              }
            }
          }
        }
      }

      // If no combinations were found this iteration, all remaining terms are already prime implicants — exit the loop
      if (!anyCombined) break;

      // Any minterm in currentGroups that was never combined is a prime implicant — collect them
      for (let i = 0; i < currentGroups.length; i++) {
        for (let j = 0; j < currentGroups[i].length; j++) {

          // If this minterm was not marked as combined, it cannot be simplified further
          if (!combinedTerms.has(currentGroups[i][j])) {
            this.primeImplicants.push(currentGroups[i][j]);
          }
        }
      }

      // Advance to the next iteration using the newly combined terms
      currentGroups = newGroups;

      // Push a deep copy of the new groups into simplification to record this iteration
      this.simplification.push(currentGroups.map(group => [...group]));
    }

    // Remove duplicate prime implicants by keeping only the first occurrence of each unique binary representation
    this.primeImplicants = this.primeImplicants.filter(
      (pi, index, self) =>
        index === self.findIndex(other => other.equals(pi))
    );
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

  mintermToPOSExpression(minterm) {
    // Get the binary representation string from the minterm object
    let binaryRepresentation = minterm.getBinaryRepresentation();

    // Array to collect each literal before joining
    let literals = [];

    for (let i = 0; i < binaryRepresentation.length; i++) {
      // If the bit is '0', variable is uncomplemented in POS (e.g. "A")
      if (binaryRepresentation[i] === '0') {
        literals.push(this.variablesLetter[i]);
      }
      // If the bit is '1', variable is complemented in POS (e.g. "A'")
      else if (binaryRepresentation[i] === '1') {
        literals.push(this.variablesLetter[i] + "'");
      }
      // If the bit is '-', this variable was eliminated during combining — skip it
      else if (binaryRepresentation[i] === '-') {
        continue;
      }
    }

    // Join all literals with " + " and wrap in parentheses to form the POS clause
    return "(" + literals.join(" + ") + ")";
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