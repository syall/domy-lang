import { types, tokenTypes, printError } from './utils.js';

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
        const parseError = s => {
            const { from, to, row, col } = peek();
            printError('Parser', s, row, col, from, to);
            process.exit(1);
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

        // EBNF Grammar Functions
        const term = () => {
            const { text } = peek();
            if (text === 'true') {
                advance('true');
                return {
                    type: tokenTypes.term,
                    value: true
                };
            } else if (text === 'false') {
                advance('false');
                return {
                    type: tokenTypes.term,
                    value: false
                };
            } else if (text === '(') {
                advance('(');
                const value = expression();
                advance(')');
                if (peek().text !== '?') {
                    return {
                        type: tokenTypes.paren,
                        value
                    };
                }
                advance('?');
                let left;
                if (peek().text === '{') {
                    left = block();
                } else {
                    left = expression();
                }
                advance(':');
                let right;
                if (peek().text === '{') {
                    right = block();
                } else {
                    right = expression();
                }
                return {
                    type: tokenTypes.ternary,
                    cond: value,
                    left,
                    right
                };
            } else if (text === 'return') {
                advance('return');
                if (peek().text !== '}')
                    return {
                        type: tokenTypes.saved,
                        text,
                        value: expression()
                    };
                else
                    return {
                        type: tokenTypes.saved,
                        text,
                    };
            } else if (text === 'continue') {
                advance('continue');

                return {
                    type: tokenTypes.saved,
                    text,
                };
            } else if (text === 'break') {
                advance('break');
                return {
                    type: tokenTypes.saved,
                    text,
                };
            } else if (text === 'while') {
                advance('while');
                const cond = expression();
                const value = block();
                return {
                    type: tokenTypes.loop,
                    cond,
                    value
                };
            } else if (text === 'do') {
                advance('do');
                const args = arg_list();
                const value = block();
                return {
                    type: tokenTypes.func,
                    args,
                    value
                };
            }
            const name = advance(null, types.name);
            if (peek().text === '(') {
                const args = inv_list();
                return {
                    type: tokenTypes.inv,
                    name: name.text,
                    args
                };
            }
            return {
                type: tokenTypes.id,
                name: name.text
            };
        };
        const not = () => {
            if (peek().text === '!') {
                advance('!');
                const value = term();
                return {
                    type: tokenTypes.uno,
                    value
                };
            } else return term();
        };
        const and = () => {
            const left = not();
            if (peek().text === '&') {
                advance('&');
                if (peek().row === 16) {
                    parseError();
                }
                const right = and();
                return {
                    type: tokenTypes.and,
                    left,
                    right
                };
            } else return left;
        };
        const xor = () => {
            const left = and();
            if (peek().text === '^') {
                advance('^');
                const right = xor();
                return {
                    type: tokenTypes.xor,
                    left,
                    right
                };
            } else return left;
        };
        const or = () => {
            const left = xor();
            if (peek().text === '|') {
                advance('|');
                const right = or();
                return {
                    type: tokenTypes.or,
                    left,
                    right
                };
            } else return left;
        };
        const test = () => {
            const left = or();
            if (peek().text === '==') {
                advance('==');
                const right = or();
                return {
                    type: tokenTypes.test,
                    value: '==',
                    left,
                    right
                };
            } else if (peek().text === '!=') {
                advance('!=');
                const right = or();
                return {
                    type: tokenTypes.test,
                    value: '!=',
                    left,
                    right
                };
            } else return left;
        };
        const subexpr = () => {
            if (peek().text === 'my') {
                advance('my');
                const name = advance(null, types.name);
                advance('=');
                const value = expression();
                return {
                    type: tokenTypes.varDec,
                    name,
                    value
                };
            } else if (peek(1).text === '=') {
                const name = advance(null, types.name);
                advance('=');
                const value = expression();
                return {
                    type: tokenTypes.varAss,
                    name,
                    value
                };
            } else return test();
        };
        const inv = () => {
            return expression();
        };
        const inv_list = () => {
            const args = [];
            advance('(');
            while (peek().text !== ')') {
                args.push(inv());
                if (peek().text === ',')
                    advance(',');
            }
            advance(')');
            return args;
        };
        const arg_list = () => {
            const args = [];
            advance('(');
            while (peek().text !== ')') {
                args.push(advance(null, types.name));
                if (peek().text === ',')
                    advance(',');
            }
            advance(')');
            return args;
        };
        const block = () => {
            const value = [];
            advance('{');
            while (peek().text !== '}') {
                value.push(expression());
            }
            advance('}');
            return {
                type: tokenTypes.block,
                value
            };
        };
        const expression = () => {
            const { text } = peek();
            if (text === '{') {
                return block();
            }
            const res = subexpr();
            return res;
        };
        const parseProgram = () => {
            while (peek().text !== '(end)')
                results.push(expression());
        };

        // Parse Program
        parseProgram();

        // Save to Record
        this.record.push(results);

        // Return Statements
        return results;
    }

    toString() {
        const options = [
            'type',
            'name',
            'text',
            'args',
            'cond',
            'left',
            'right',
            'result',
            'value',
        ];
        for (const record of this.record)
            console.log(JSON.stringify(record, options, '  |'));
    }

}
