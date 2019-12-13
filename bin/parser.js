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
            while (i < tokens.length) {
                const { text, type } = tokens[i];
                if (type === 'reserved') {
                    // Parse variable-declaration
                    // Parse function-declaraction
                    // Parse while-loop
                    // Parse true
                    // Parse false
                } else if (type === 'parenthesis:left') {
                    // Parse parenthesis-expr
                    // Parse parenthesis-term
                } else if (text === '!') {
                    // Parse unary-operator
                } else {
                    // Parse variable-assignment
                    // Parse function-invocation
                }
                i++;
            }
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
