import { types, order, unaryOperators, binaryOperators } from './utils.js';

export default class DomyParser {

    constructor() {
        // Record of all Parses
        this.record = [];
    }

    parse(tokens) {

        // State
        let i = 0;

        // Parsing Functions
        const advance = (c, t) => {
            const { type, text } = tokens[i + 1];
            if (c && c !== text)
                throw new Error(`Expected text ${c} but got ${text} instead.`);
            if (t && t !== type)
                throw new Error(`Expected type ${t} but got ${type} instead.`);
            i++;
            return tokens[i];
        };
        const peek = (offset = 1) => {
            return tokens[i + offset];
        };

        const block = () => {
            advance('{');
            const result = statements(true);
            advance('}');
            return {
                type: 'block',
                result
            };
        };
        const invokeArgument = () => {
            let past = i;
            let result = variableName();
            if (result)
                return result;
            i = past;
            result = expression();
            if (result)
                return result;
            i = past;
            throw new Error(
                `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
            );
        };
        const argumentsInvocation = () => {
            const args = [];
            if (peek() === ')')
                return args;
            while (true) {
                const arg = invokeArgument();
                if (!arg)
                    throw new Error(
                        `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
                    );
                if (peek().text !== ')') {
                    advance(',');
                } else {
                    break;
                }
                args.push(arg);
            }
            return args;
        };
        const argumentsDeclaration = () => {
            const args = [];
            if (peek() === ')')
                return args;
            while (true) {
                const arg = variableName();
                if (!arg)
                    throw new Error(
                        `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
                    );
                if (peek().text !== ')') {
                    advance(',');
                } else {
                    break;
                }
                args.push(arg);
            }
            return args;
        };
        const variableName = () => {
            let name;
            try {
                name = advance();
                if (name.type !== types.name)
                    return false;
            } catch (error) {
                return false;
            }
            return {
                type: 'variable-name',
                name
            };
        };
        const reserveName = () => {
            let name;
            try {
                name = advance();
                if (name.type !== types.saved)
                    return false;
            } catch (error) {
                return false;
            }
            return {
                type: 'reserve-name',
                name
            };
        };
        const falseTerm = () => {
            if (peek(0).text === 'false')
                return {
                    type: 'term',
                    value: false
                };
            return false;
        };
        const trueTerm = () => {
            if (peek(0).text === 'true')
                return {
                    type: 'term',
                    value: true
                };
            return false;
        };
        const whileLoop = () => {
            try {
                advance('while');
            } catch (error) {
                return false;
            }
            advance('(');
            const condition = expression();
            advance(')');
            const inner = block();
            return {
                type: 'while-loop',
                condition,
                inner
            };
        };
        const functionInvocation = () => {
            let name;
            try {
                name = advance(null, types.name);
                advance('(');
            } catch (error) {
                return false;
            }
            const args = argumentsInvocation();
            advance(')');
            return {
                type: 'function-invocation',
                name,
                args
            };
        };
        const functionDeclaration = () => {
            try {
                advance('do');
            } catch (error) {
                return false;
            }
            advance('(');
            const args = argumentsDeclaration();
            advance(')');
            const inner = block();
            return {
                type: 'function-declaration',
                args,
                inner
            };
        };
        const variableAssignment = (declaration = false) => {
            let name;
            try {
                name = advance(null, types.name);
                advance('=');
            } catch (error) {
                if (declaration)
                    throw new Error(
                        `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
                    );
                return false;
            }
            let result = expression();
            if (result)
                return {
                    type: 'variable-assignment',
                    name,
                    result
                };
            throw new Error(
                `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
            );
        };
        const variableDeclaration = () => {
            try {
                advance('my');
            } catch (error) {
                return false;
            }
            const result = variableAssignment(true);
            if (!result)
                throw new Error(
                    `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
                );
            return {
                type: 'variable-declaration',
                result
            };
        };
        const term = () => {
            let past = i;
            let result = variableDeclaration();
            if (result)
                return result;
            i = past;
            result = variableAssignment();
            if (result)
                return result;
            i = past;
            result = functionDeclaration();
            if (result)
                return result;
            i = past;
            result = functionInvocation();
            if (result)
                return result;
            i = past;
            result = trueTerm();
            if (result)
                return result;
            i = past;
            result = falseTerm();
            if (result)
                return result;
            i = past;
            result = variableName();
            if (result)
                return result;
            i = past;
            result = reserveName();
            if (result)
                return result;
            i = past;
            result = whileLoop();
            i = past;
            throw new Error(
                `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
            );
        };
        const parenthesis = () => {
            try {
                advance('(');
            } catch (error) {
                return false;
            }
            const result = expression();
            if (!result)
                throw new Error(
                    `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
                );
            advance(')');
            return {
                type: 'parenthesis',
                result
            };
        };
        const parenthesisTerm = (ret = false) => {
            let past = i;
            let result;
            result = parenthesis();
            if (result)
                return result;
            i = past;
            result = term();
            if (result)
                return result;
            i = past;
            if (ret)
                return false;
            throw new Error(
                `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
            );
        };
        // const parenthesisTerm = () => {
        //     let past = i;
        //     let result = parenthesis();
        //     if (result)
        //         return result;
        //     i = past;
        //     result = expression();
        //     if (result)
        //         return result;
        //     i = past;
        //     throw new Error(
        //         `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
        //     );
        // };
        const unaryOperator = () => {
            const { text } = tokens[i];
            if (unaryOperators.includes(text))
                return {
                    type: 'unary-operator',
                    op: text,
                    order: order.get(text)
                };
            return false;
        };
        const unaryOperation = () => {
            let past = i;
            const op = unaryOperator();
            if (!op)
                return false;
            past = i;
            const right = parenthesisTerm();
            if (!right)
                throw new Error(
                    `Expression could not be parsed at ${tokens[past]}.`
                );
            return {
                type: 'unary-operation',
                op,
                right
            };
        };
        const binaryOperator = () => {
            const { text } = tokens[i];
            if (binaryOperators.includes[text])
                return {
                    type: 'binary-operator',
                    op: text,
                    order: order.get(text)
                };
            else
                return false;
        };
        const binaryOperation = () => {
            let past = i;
            const left = parenthesisTerm();
            if (!left)
                return false;
            past = i;
            const op = binaryOperator();
            if (!op)
                return false;
            past = i;
            const right = parenthesisTerm();
            if (!right)
                throw new Error(
                    `Expression could not be parsed at ${tokens[past]}.`
                );
            return {
                type: 'binary-operation',
                op,
                left,
                right
            };
        };
        const ternaryOperation = () => {
            let past = i;
            const left = parenthesisTerm();
            if (!left)
                return false;
            try {
                advance('?');
            } catch (error) {
                return false;
            }
            past = i;
            const middle = parenthesisTerm();
            if (!middle)
                throw new Error(
                    `Expression could not be parsed at ${tokens[past]}.`
                );
            advance(':');
            past = i;
            const right = parenthesisTerm();
            if (!right)
                throw new Error(
                    `Expression could not be parsed at ${tokens[past]}.`
                );
            return {
                type: 'ternary-operation',
                left,
                middle,
                right
            };
        };
        const expression = () => {
            let past = i;
            let result;
            result = ternaryOperation();
            if (result)
                return result;
            i = past;
            result = binaryOperation();
            if (result)
                return result;
            i = past;
            result = unaryOperation();
            if (result)
                return result;
            i = past;
            result = parenthesisTerm();
            if (result)
                return result;
            i = past;
            throw new Error(
                `Expression could not be parsed at ${JSON.stringify(tokens[i])}.`
            );
        };
        const statements = (block = false) => {
            const results = [];
            console.group('statements');
            if (block)
                while (peek().text !== '}') {
                    results.push(expression());
                }
            else
                while (i < tokens.length) {
                    results.push(expression());
                }
            console.groupEnd('statements');
            return results;
        };

        // Parse Statements
        const parsed = statements();

        // Save to Record
        this.record.push(parsed);

        // Print Parse Tree
        this.toString();

        // Return Statements
        return parsed;
    }

    toString() {
        for (const record of this.record)
            console.log(JSON.stringify(record, [
                'type',
                'name',
                'text',
                'result',
                'args',
                'inner'
            ], 4));
    }

}
