import { types, order, unaryOperators, binaryOperators } from './utils.js';

export default class DomyParser {

    constructor() {
        // Record of all Parses
        this.record = [];
    }

    parse(tokens) {

        // State
        let i = 0;
        const parsed = [];

        // Parsing Functions

        // Save to Record
        this.record.push(parsed);

        // Print Parse Tree
        this.toString();

        // Return Statements
        return parsed;
    }
    
    toString() {
        for (const record of this.record)
            console.log(JSON.stringify(record, null, 2));
    }

}
