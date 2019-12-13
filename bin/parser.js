import { types, order } from './utils.js';

export default class DomyParser {

    constructor() {
        // Record of all Parses
        this.record = [];
    }

    parse(tokens) {

        // State
        let i = 0;
        let past = 0;

        // Parsing Functions
        const advance = (c, t) => {
            const { type, text } = tokens[i + 1];
            console.log({ type, text });
            if (c && c !== text)
                throw new Error(`Expected text ${c} but got ${text} instead.`);
            if (t && t !== type)
                throw new Error(`Expected type ${t} but got ${type} instead.`);
            i++;
            return tokens[i];
        };
        const invokeArgument = () => { };
        const argumentsInvocation = () => { };
        const argumentsDeclaration = () => { };
        const variableName = () => { };
        const falseTerm = () => { };
        const trueTerm = () => { };
        const whileLoop = () => { };
        const functionInvocation = () => { };
        const functionDeclaration = () => { };
        const variableAssignment = () => { };
        const variableDeclaration = () => { };
        const term = () => { };
        const parenthesis = () => { };
        const parenthesisTerm = () => { };
        const parenthesisExpr = () => { };
        const unaryOperator = () => { };
        const unaryOperation = () => { };
        const binaryOperator = () => { };
        const binaryOperation = () => { };
        const ternaryOperation = () => { };
        const expression = () => { };
        const statements = () => { };
        const block = () => { };

        // Parse Statements
        const parsed = statements();

        // Save to Record
        this.record.push(parsed);

        // Print Parse Tree
        // this.toString();

        // Return Statements
        return parsed;
    }

    toString() {
        for (const record of this.record)
            console.log(JSON.stringify(record, null, 2));
    }

}
