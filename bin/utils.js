// Types
export const types = {
    terop: 'ternary:operator',
    binop: 'binary:operator',
    unop: 'unary:operator',
    paren: 'parenthesis:',
    brack: 'parenthesis:',
    comma: 'comma',
    assign: 'assignment',
    saved: 'reserved',
    name: 'word'
};
export const tokenTypes = {
    expr: 'expression',
    ternary: 'ternary-operation',
    inv: 'function-invocation',
    block: 'block',
    saved: 'reserved',
    loop: 'while-loop',
    func: 'function-declaration',
    term: 'terminal',
    paren: 'parenthesis',
    id: 'identifier',
    uno: 'unary-operation',
    and: 'and',
    xor: 'xor',
    or: 'or',
    test: 'test',
    varDec: 'variable-declaration',
    varAss: 'variable-assignment',
    std: 'std'
};

// Reserved Words
export const words = [
    'true',
    'false',
    'my',
    'do',
    'while',
    'return',
    'break',
    'continue',
];
export const reserved = new Set(words);

// Operators
export const operators = [
    '?',
    ':',
    '!=',
    '==',
    '|',
    '^',
    '&',
    '!',
];
export const unaryOperators = [
    '!'
];
export const binaryOperators = [
    '!=',
    '==',
    '|',
    '^',
    '&',
];
export const order = new Map([
    ['?', 40],
    [':', 40],
    ['!=', 50],
    ['==', 50],
    ['|', 60],
    ['^', 70],
    ['&', 80],
    ['!', 90]
]);
export const ops = new Set(operators);

// Utility Functions
export const isIrrelevant = c => c <= ' ' || c === ';';
export const isComment = c => c === '#';
export const isOperator = c => ops.has(c);
export const isDoubleOperator = (c, n) =>
    (c === '!' || c === '=') && n === '=';
export const isParenthesis = c => c === '(' || c === ')';
export const isBracket = c => c === '{' || c === '}';
export const isComma = c => c === ',';
export const isEqual = c => c === '=';
export const alphabet = /^[a-zA-Z]$/;
export const isAlphabetic = c => c.match(alphabet);
export const word = /^[-_a-zA-Z0-9]$/;
export const isWord = c => c && c.match(word);

// Error
export const printError = (fileContent, t, s, r, c, from, to) => {
    console.error(`${t} Error: ${s} at row ${r}, col ${c}.`);
    let start, end;
    for (start = from; start >= 0; start--)
        if (fileContent[start] === '\n')
            break;
    for (end = to; end < fileContent.length; end++)
        if (fileContent[end] === '\n')
            break;
    const rightTrim =
        fileContent
            .slice(start + 1, end)
            .trimRight();
    const trimmed = rightTrim.trimLeft();
    const offset = c - (rightTrim.length - trimmed.length);
    const line = `${r}: `;
    const blank = ' '.repeat(line.length + offset - 1);
    console.error(`${line}${trimmed}...`);
    console.error(`${blank}^`);
    console.error(`${blank}${c}`);
};

export class Scope {

    constructor(parent) {
        this.parent = parent;
        this.vars = new Map();
    }

    find(name) {
        let current = this;
        while (current !== null) {
            const value = current.vars.get(name);
            if (value !== undefined)
                return value;
            current = current.parent;
        }
        return undefined;
    }

    add(name, value) {
        this.vars.set(name, value);
    }

    reassign(name, value) {
        let current = this;
        while (current !== null) {
            const search = current.vars.get(name);
            if (search !== undefined)
                return current.vars.set(name, value);
            current = current.parent;
        }
        return undefined;
    }

}
