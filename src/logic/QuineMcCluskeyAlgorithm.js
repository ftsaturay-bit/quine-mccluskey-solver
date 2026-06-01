import Minterm from "./Minterm";

export default class QuineMcCluskeyAlgorithm {
  constructor(mintermsDecimal, variablesLetter) {
    // Store the original list of minterms (mintermsDecimal) and the variable letters (variablesLetter)
    this.originalMinterms = [...mintermsDecimal];
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
    const mintermSet = new Set(minterms);

    let complementInput = [];

    // Collect all values from 0 to 2^n - 1 that are NOT in the minterm set (these are maxterms)
    for (let i = 0; i < 2 ** this.numberOfVariables; i++) {
      if (!mintermSet.has(i)) {
        complementInput.push(i);
      }
    }
    // Return the maxterms (complement of the given minterms)
    return complementInput;
  }

  solve() {
    // Call groupByOnes() to group minterms by their number of 1-bits
    let groups = this.groupByOnes();
    // Call findPrimeImplicants(groups) to iteratively combine groups
    this.findPrimeImplicants(groups);
    // Call createPrimeImplicantTable() to build the coverage table
    this.createPrimeImplicantTable();
    // Call findEssentialPrimeImplicants() to select the minimal cover
    this.findEssentialPrimeImplicants();
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
    let currentGroups = groups.map((group) => [...group]);

    // Push a deep copy of the initial groups as the first entry in simplification
    this.simplification.push(currentGroups.map((group) => [...group]));

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
            let result = currentGroups[i][j].combineMinterms(
              currentGroups[i + 1][k],
            );

            if (result.success) {
              // Mark both source minterms as combined so they are not added as prime implicants
              combinedTerms.add(currentGroups[i][j]);
              combinedTerms.add(currentGroups[i + 1][k]);

              currentGroups[i][j].isCombined = true;
              currentGroups[i + 1][k].isCombined = true;

              // Set the flag to indicate at least one combination happened this iteration
              anyCombined = true;

              // Check if an identical combined term (same binary representation) already exists in newGroups[i]
              let alreadyExists = newGroups[i].some((existing) =>
                existing.equals(result.minterm),
              );

              // Only add the combined term if it is not already present (avoid duplicates)
              if (!alreadyExists) {
                newGroups[i].push(result.minterm);
              }
            }
          }
        }
      }

      // If no combinations were found this iteration, all remaining terms in currentGroups
      // are prime implicants because they couldn't be simplified further.
      if (!anyCombined) {
        for (let i = 0; i < currentGroups.length; i++) {
          for (let j = 0; j < currentGroups[i].length; j++) {
            this.primeImplicants.push(currentGroups[i][j]);
          }
        }
        break;
      }

      // Otherwise, any minterm in currentGroups that was NOT combined is a prime implicant
      for (let i = 0; i < currentGroups.length; i++) {
        for (let j = 0; j < currentGroups[i].length; j++) {
          if (!combinedTerms.has(currentGroups[i][j])) {
            this.primeImplicants.push(currentGroups[i][j]);
          }
        }
      }

      // Advance to the next iteration using the newly combined terms
      currentGroups = newGroups;

      // Push a deep copy of the new groups into simplification to record this iteration
      this.simplification.push(currentGroups.map((group) => [...group]));
    }

    // Remove duplicate prime implicants by keeping only the first occurrence of each unique binary representation
    this.primeImplicants = this.primeImplicants.filter(
      (pi, index, self) =>
        index === self.findIndex((other) => other.equals(pi)),
    );
  }

  createPrimeImplicantTable() {
    // Start with an empty string that will build up the entire table
    let table = "";

    // Build the header row — blank space for the PI column, then each maxterm value
    let header = "        |";
    for (let m of this.mintermsDecimal) {
      // Add each maxterm decimal value as a column header
      header += ` ${m}  |`;
    }

    // Add the header row to the table
    table += header + "\n";

    // Add a separator line the same width as the header
    table += "-".repeat(header.length) + "\n";

    // Build one row for each prime implicant
    for (let pi of this.primeImplicants) {
      // Get the POS expression for this prime implicant e.g. "(A + B')"
      let expression = this.mintermToPOSExpression(pi);

      // Pad the expression to 8 characters so all rows are aligned
      let row = expression.padEnd(8) + "|";

      // For each maxterm, check if this prime implicant covers it
      for (let m of this.mintermsDecimal) {
        if (pi.doesItMatch(m)) {
          // This PI covers this maxterm — mark with X
          row += " X  |";
        } else {
          // This PI does not cover this maxterm — leave blank
          row += "    |";
        }
      }

      // Add this row to the table
      table += row + "\n";
    }

    // Store the finished table string into the display field
    this.primeImplicantTableDisplay = table;
  }

  getPrimeImplicantTableData() {
    return {
      // For each prime implicant, build an object with its expression and the minterms it covers
      primeImplicants: this.primeImplicants.map((pi) => ({
        // Convert the prime implicant to a POS expression string e.g. "(A + B')"
        expression: this.mintermToPOSExpression(pi),

        // getSetOfMinterms() returns a Set — spread it into a plain array e.g. [0, 3]
        minterms: [...pi.getSetOfMinterms()],
      })),

      // The full list of maxterm decimal values used as columns in the table
      minterms: this.mintermsDecimal,
    };
  }

  mintermToPOSExpression(minterm) {
    // Get the binary representation string from the minterm object
    let binaryRepresentation = minterm.getBinaryRepresentation();

    // Array to collect each literal before joining
    let literals = [];

    for (let i = 0; i < binaryRepresentation.length; i++) {
      // If the bit is '0', variable is uncomplemented in POS (e.g. "A")
      if (binaryRepresentation[i] === "0") {
        literals.push(this.variablesLetter[i]);
      }
      // If the bit is '1', variable is complemented in POS (e.g. "A'")
      else if (binaryRepresentation[i] === "1") {
        literals.push(this.variablesLetter[i] + "'");
      }
      // If the bit is '-', this variable was eliminated during combining — skip it
      else if (binaryRepresentation[i] === "-") {
        continue;
      }
    }

    // Join all literals with " + " and wrap in parentheses to form the POS clause
    return "(" + literals.join(" + ") + ")";
  }

  findEssentialPrimeImplicants() {
    let coverageMap = new Map();
    for (let PI of this.primeImplicants) {
      for (let term of PI.getSetOfMinterms()) {
        if (!coverageMap.has(term)) coverageMap.set(term, []);
        coverageMap.get(term).push(PI);
      }
    }

    let coveredMinterms = new Set();
    let selectedPIs = new Set();
    let epis = [];

    // 1. Find True Essential Prime Implicants (EPIs)
    for (let [term, PIsAtTerm] of coverageMap.entries()) {
      if (PIsAtTerm.length === 1) {
        let epi = PIsAtTerm[0];
        if (!selectedPIs.has(epi)) {
          selectedPIs.add(epi);
          epis.push(epi);
          for (let t of epi.getSetOfMinterms()) {
            coveredMinterms.add(t);
          }
        }
      }
    }

    // 2. Identify Minterms still uncovered after EPIs
    let initiallyUncovered = this.mintermsDecimal.filter(
      (m) => !coveredMinterms.has(m),
    );
    let additionalPIs = [];

    // 3. Greedily select Additional PIs to cover remaining terms
    while (coveredMinterms.size < this.mintermsDecimal.length) {
      let bestPI = null;
      let maxCoveredCount = 0;
      for (let PI of this.primeImplicants) {
        if (selectedPIs.has(PI)) continue;
        let coveredCount = 0;
        for (let term of PI.getSetOfMinterms()) {
          if (!coveredMinterms.has(term)) coveredCount++;
        }
        if (coveredCount > maxCoveredCount) {
          maxCoveredCount = coveredCount;
          bestPI = PI;
        }
      }
      if (!bestPI) break;
      selectedPIs.add(bestPI);
      additionalPIs.push(bestPI);
      for (let term of bestPI.getSetOfMinterms()) {
        coveredMinterms.add(term);
      }
    }

    // Store the final selected set
    this.essentialPrimeImplicants = [...epis, ...additionalPIs];

    // 4. Build the structured display string
    let display = "";

    display += "1. Essential Prime Implicants:\n";
    if (epis.length === 0) display += "   (None)\n";
    else
      epis.forEach(
        (pi) =>
          (display += `   - ${this.mintermToPOSExpression(pi)} | ${pi.toString()}\n`),
      );

    display += "\n2. Uncovered Minterms (after EPIs):\n";
    display += `   ${initiallyUncovered.length > 0 ? initiallyUncovered.join(", ") : "(All covered by EPIs)"}\n`;

    display += "\n3. Additional Prime Implicants (Greedy Selection):\n";
    if (additionalPIs.length === 0) display += "   (None)\n";
    else
      additionalPIs.forEach(
        (pi) =>
          (display += `   - ${this.mintermToPOSExpression(pi)} | ${pi.toString()}\n`),
      );

    display += "\n4. Final Prime Implicants (Complete Cover):\n";
    this.essentialPrimeImplicants.forEach(
      (pi) => (display += `   - ${this.mintermToPOSExpression(pi)}\n`),
    );

    display += `\nTotal selected: ${this.essentialPrimeImplicants.length}\n`;
    display += `All ${coveredMinterms.size} minterms are covered.`;

    this.essentialPrimeImplicantsDisplay = display;
  }

  getGroupedMintermsData() {
    const initialGroups = this.simplification[0];
    const groups = [];

    for (let i = 0; i < initialGroups.length; i++) {
      if (initialGroups[i].length === 0) continue;
      groups.push({
        ones: i,
        minterms: initialGroups[i].map((m) => ({
          decimal: m.getValue(),
          binary: m.getBinaryRepresentation(),
        })),
      });
    }

    return {
      originalMinterms: this.originalMinterms,
      complement: this.mintermsDecimal,
      groups,
    };
  }

  displayGroupedMinterms() {
    // Start with an empty string that will hold the entire display
    let display = "";

    // Show the original minterms that were passed in by the user
    display += `Original Minterms: ${this.originalMinterms}\n`;

    // Show the complement (maxterms) being used for POS simplification
    display += `Complement (Maxterms) Used: ${this.mintermsDecimal}\n\n`;

    // Get the first iteration groups from simplification (the initial grouping)
    let initialGroups = this.simplification[0];

    // Loop through each group (group 0 = zero 1-bits, group 1 = one 1-bit, etc.)
    for (let i = 0; i < initialGroups.length; i++) {
      // Skip empty groups — no minterms have this many 1-bits
      if (initialGroups[i].length === 0) continue;

      // Show the group number (number of 1-bits)
      display += `Group ${i} (${i} ones):\n`;

      // Show each minterm in this group with its decimal value and binary representation
      for (let minterm of initialGroups[i]) {
        display += `  ${minterm.getValue()} → ${minterm.getBinaryRepresentation()}\n`;
      }

      display += "\n";
    }

    return display;
  }

  getSimplificationData() {
    const iterations = this.simplification.map((iterGroups, iterIndex) => {
      const groups = [];
      for (let i = 0; i < iterGroups.length; i++) {
        if (iterGroups[i].length === 0) continue;
        groups.push({
          ones: i,
          terms: iterGroups[i].map((t) => ({
            binary: t.getBinaryRepresentation(),
            covers: Array.from(t.getSetOfMinterms()),
            isCombined: t.isCombined,
          })),
        });
      }
      return { iteration: iterIndex, groups };
    });

    return {
      iterations,
      primeImplicants: this.primeImplicants.map((pi) => ({
        binary: pi.getBinaryRepresentation(),
        covers: Array.from(pi.getSetOfMinterms()),
        pos: this.mintermToPOSExpression(pi),
      })),
    };
  }

  displayCombiningTerms() {
    // Start with an empty string that will hold the entire display
    let display = "";

    // Loop through each iteration starting from index 1 (index 0 is the initial grouping)
    for (let iter = 1; iter < this.simplification.length; iter++) {
      // Show which iteration we are on
      display += `Iteration ${iter}:\n`;

      // Get the groups for this iteration
      let iterationGroups = this.simplification[iter];

      // Loop through each group in this iteration
      for (let i = 0; i < iterationGroups.length; i++) {
        // Skip empty groups
        if (iterationGroups[i].length === 0) continue;

        // Show the group number
        display += `  Group ${i}:\n`;

        // Show each combined term with its binary representation and source minterms
        for (let minterm of iterationGroups[i]) {
          // Get the binary representation of this combined term e.g. "01-"
          let binary = minterm.getBinaryRepresentation();

          // Get the source minterms this term was combined from e.g. [0, 3]
          let sources = [...minterm.getSetOfMinterms()].join(", ");

          display += `    ${binary} (from: ${sources})\n`;
        }
      }

      display += "\n";
    }

    // After all iterations, list all prime implicants
    display += "";

    for (let pi of this.primeImplicants) {
      // Show the POS expression, binary representation, and maxterms it covers
      let expression = this.mintermToPOSExpression(pi);
      let binary = pi.getBinaryRepresentation();
      let covers = [...pi.getSetOfMinterms()].join(", ");

      display += `  ${expression} | ${binary} | covers: ${covers}\n`;
    }

    return display;
  }

  getPITableData() {
    return {
      minterms: this.mintermsDecimal,
      rows: this.primeImplicants.map((pi) => ({
        expression: this.mintermToPOSExpression(pi),
        binary: pi.getBinaryRepresentation(),
        coveredMinterms: Array.from(pi.getSetOfMinterms()),
      })),
    };
  }

  displayPrimeImplicantsTable() {
    // Return the text table built by createPrimeImplicantTable()
    return this.primeImplicantTableDisplay;
  }

  displayEssentialPrimeImplicantsTable() {
    // Return the display string built by findEssentialPrimeImplicants()
    return this.essentialPrimeImplicantsDisplay;
  }

  getPOS() {
    if (this.essentialPrimeImplicants.length === 0) {
      return "Final POS Expression: No solution found (all minterms covered or no maxterms to simplify).";
    }

    const posParts = this.essentialPrimeImplicants.map((pi) =>
      this.mintermToPOSExpression(pi),
    );
    return "Final POS Expression: " + posParts.join(" · ");
  }
}
