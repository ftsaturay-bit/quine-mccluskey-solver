// src/logic/Minterm.js

export default class Minterm {

  constructor(value, numberOfVariables, setOfMinterms = null, binaryRepresentation = null) {
    //Mode 1: pag isang minterm lang nilagay:
    if(setOfMinterms === null){
      // saves the single decimal number
      this.value = value;

      //converts the store decimal to binary string
      this.binaryRepresentation = this.toBinaryString(value, numberOfVariables);

      //initialize a set object containing the single decimal only
      this.setOfMinterms = new Set([value]);
    }

    //Mode 2: setOfMinterms is provided:
    else{

    // Store the inputted binary terms directly
      this.binaryRepresentation = binaryRepresentation;

    //placeholder
      this.value = -1;

    //initialize a set object containing the provided set of minterms
      this.setOfMinterms = new Set(setOfMinterms);
    }

  }

  getValue() {
    return this.value;
  }

  getBinaryRepresentation() {
    return this.binaryRepresentation;
  }

  getSetOfMinterms() {
    return  this.setOfMinterms;
  }

  countNumberOfOnes() {
    let count = 0;
    for(let i = 0; i < this.binaryRepresentation.length; i ++){
      //checks if the specific no. in the binary representation = 1
      if(this.binaryRepresentation[i] === "1"){
        //increments the count if i = 1
        count++;
      }
    }
      return count;
  }

  toBinaryString(value, numberOfVariables) {
    let binaryString = "";
    while(value > 0){
      //modulo operator returns the remainder when value is divided by 2 (0 or 1) which serves as the ai coefficient for the binary string
      let remainders = value%2;

      //concatenates the remainder coefficient and appends to the binary string
      binaryString = remainders + binaryString;

      //starts the next loop with the next whole number
      value = Math.floor(value / 2);
    }

    //Left-pad with '0's until the string length equals numberOfVariables
    while(binaryString.length < numberOfVariables){
      binaryString = "0" + binaryString;
    }
    
    return binaryString;
  }

  combineMinterms(otherMinterm) {
    //Compare this.binaryRepresentation with the other minterms
    let difference = 0;
    let index = -1;
    //Since otherMinterm is an object, we use our previously defined getBinaryRepresentation function to get its binary form
    let otherString = otherMinterm.getBinaryRepresentation();

    for(let i = 0; i < this.binaryRepresentation.length; i++){
      //the ff block runs if there's different elements between the 2 minterms
      if(this.binaryRepresentation[i] !== otherString[i]){
        //increments the difference count
        difference++;
        //notes where the difference is
        index = i;
      }
    }

    //Only minterms with 1 difference can be merged, no more or less.
    if(difference === 1){
      //Create a new binary string identical to this one but with '-' at the differing position
      let newBinaryString = this.binaryRepresentation.substring(0,index) + "-" + this.binaryRepresentation.substring(index + 1);

      //Merge the two setOfMinterms into a new combined Set
      let combinedSet = new Set();

      for (let item of this.getSetOfMinterms()) {
        combinedSet.add(item);
      }
      for (let item of otherMinterm.getSetOfMinterms()) {
        combinedSet.add(item);
      }

      return { success: true, minterm: new Minterm(-1, null, combinedSet, newBinaryString) };
    }

    else{
      return { success: false };
    }
  }

  doesItMatch(mintermValue) {
    //Determines if the current mintermValue is in the set of minterms and returns true if it is, false otherwise
    return this.setOfMinterms.has(mintermValue);
  }

  mintermToExpression(variables) {
    let finalExpression = "";
    //Iterate over each character in this.binaryRepresentation
     for (let i = 0; i < this.binaryRepresentation.length; i++) {
      let bit = this.binaryRepresentation[i];

    //Skip positions where the character is '-'
      if (bit === '-') {
        continue; 
      }

      
    //For '0', append variables[i] + "'" (complemented literal) to the expression
      else if (bit === '0') {
        finalExpression += variables[i] + "'";
      }

      
    //For '1', append variables[i] (uncomplemented literal) to the expression
      else if (bit === '1') {
        finalExpression += variables[i];
      }
    }

    //Return the final expression string
    return finalExpression;
  }

  equals(other) {
    //Compares two binary numbers
    return this.binaryRepresentation === other.getBinaryRepresentation();
  }

  toString() {
    //Converts any object to a string 
    return this.binaryRepresentation;
  }
}