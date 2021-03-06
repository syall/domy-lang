import { types, tokenTypes, printError } from './utils.js';

export default class DomyParser {

    constructor() {
        // Record of all Parses
        this.record = [];
    }

    parse(tokens, text) {

        // State
        let i = 0;
        const results = [];

        // Utility Functions
        const parseError = s => {
            const { from, to, row, col } = peek();
            printError(text, 'Parser', s, row, col, from, to);
            throw new Error();
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
            return tokens[i + offset] ? tokens[i + offset] : { text: '' };
        };

        // EBNF Grammar Functions
        const term = () => {
            const { text, type } = peek();
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
                const value = statement();
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
                    left = statement();
                }
                advance(':');
                let right;
                if (peek().text === '{') {
                    right = block();
                } else {
                    right = statement();
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
                        value: statement()
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
                const cond = statement();
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
            } else if (text === '{') {
                return block();
            } else if (type === types.name) {
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
            } else if (text === '(end)') {
                parseError('Reached end of input');
            } else parseError('Term could not be parsed');
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
        const expression = () => {
            const left = or();
            if (peek().text === '==') {
                advance('==');
                const right = expression();
                return {
                    type: tokenTypes.test,
                    value: '==',
                    left,
                    right
                };
            } else if (peek().text === '!=') {
                advance('!=');
                const right = expression();
                return {
                    type: tokenTypes.test,
                    value: '!=',
                    left,
                    right
                };
            } else return left;
        };
        const inv = () => {
            return statement();
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
                value.push(statement());
            }
            advance('}');
            return {
                type: tokenTypes.block,
                value
            };
        };
        const statement = () => {
            if (peek().text === 'my') {
                advance('my');
                const name = advance(null, types.name);
                advance('=');
                const value = statement();
                return {
                    type: tokenTypes.varDec,
                    name: name.text,
                    value
                };
            } else if (peek(1).text === '=') {
                const name = advance(null, types.name);
                advance('=');
                const value = statement();
                return {
                    type: tokenTypes.varAss,
                    name: name.text,
                    value
                };
            } else return expression();
        };
        const parseProgram = () => {
            while (peek().text !== '(end)')
                results.push(statement());
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
        console.log(JSON.stringify(
            this.record[this.record.length - 1],
            options,
            '  |'
        ));
    }

}
