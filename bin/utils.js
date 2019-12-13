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
    saved: 'reserved'
};

// Reserved Words
export const words = [
    'true',
    'false',
    'either',
    'my',
    'do',
    'while',
    'return',
    'break',
    'continue',
    'print'
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
export const isWord = c => c.match(word);
export const isReserveExpr = token =>
    token !== 'my' && words.includes(token);
export const isId = type => type === types.name;
