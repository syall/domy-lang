export default class DomyParser {

    constructor() {
        // Record of all Parses
        this.record = [];
    }

    parse(tokens) {
        // State
        let i = 0;

        // Parsing Functions
        const statements = () => {
            while (i < tokens.length)
                i++;
            return [{ one: 1 }, { two: 2 }];
        };

        // Parse Statements
        const parsed = statements();

        // Save to Record
        this.record.push(parsed);

        // Return Statements
        return parsed;
    }

    toString() {
        for (const record of this.record)
            console.log(JSON.stringify(record, null, 2));
    }

}
