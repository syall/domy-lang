import {
    types,
    isId,
    isReserveExpr,
    tokenTypes
} from './utils.js';

export default class DomyParser {

    constructor() {
        // Record of all Parses
        this.record = [];
    }

    parse(tokens) {

        // State
        let i = 0;
        const results = [];

        // Utility Functions
        const parseError = (s) => {
            console.table(results);
            console.error('Could not parse token:');
            const { text, type, row, col } = tokens[i];
            console.table({ text, type, row, col });
            console.trace();
            if (s) throw new Error(s);
            else throw new Error();
        };
        const advance = (c, t) => {
            const { text, type } = tokens[i];
            if (c && c !== text)
                parseError(`Expected '${c}' but got '${text}'`);
            if (t && t !== type)
                parseError(`Expected '${t}' but got '${type}'`);
            return tokens[i++];
        };
        const peek = (offset = 0) => {
            return tokens[i + offset];
        };

        // Grammar Functions
        const term = () => { };
        const not = () => { };
        const and = () => { };
        const xor = () => { };
        const or = () => { };
        const test = () => { };
        const id = () => { };
        const subexpr = () => { };
        const inv = () => { };
        const inv_list = () => { };
        const arg_list = () => { };
        const block = () => { };
        const expression = () => {
            const { text, type } = peek();
            if (isReserveExpr(text)) {
                // definitely while, do, return, continue, or break
                return {
                    type: tokenTypes.saved,
                    value: text,
                    todo: true
                };
            } else if (text === '{') {
                // definitely block
                return {
                    type: tokenTypes.block,
                    value: text,
                    todo: true
                };
            } else if (isId(type) && peek(1).text === '(') {
                // definitely invocation
                return {
                    type: tokenTypes.inv,
                    value: text,
                    todo: true
                };
            }
            const cond = subexpr();
            // definitely not ternary-operation
            if (peek().text !== '?')
                return {
                    type: tokenTypes.expr,
                    value: text,
                    result: cond
                };
            // definitely ternary-operation
            advance('?');
            const left = subexpr();
            advance(':');
            const right = subexpr();
            return {
                type: tokenTypes.ternary,
                cond,
                left,
                right
            };
        };
        const parseProgram = async () => {
            while (i < tokens.length) {
                // Parse Expressions
                results.push(expression());
                // Temporary
                i++;
            }
        };

        parseProgram();

        // Save to Record
        this.record.push(results);

        // Return Statements
        return results;

    }

    toString() {
        for (const record of this.record)
            console.log(JSON.stringify(record, null, 2));
    }

}
