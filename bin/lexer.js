export default class DomyLexer {

	constructor() {
		// Record of all Lexes
		this.record = [];
		// Types
		this.type = {
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
		// Reserved Words
		this.saved = new Set([
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
		]);
		// Operators
		this.ops = new Set([
			'?',
			'!',
			'|',
			'^',
			'&',
			':'
		]);
	}

	tokenize(text) {
		// State
		let i = 0;
		let row = 1;
		let col = 1;

		// Tokens
		const tokens = [];

		// Utility Functions
		const isIrrelevant = c => c <= ' ' || c === ';';
		const isComment = c => c === '#';
		const isOperator = c => this.ops.has(c);
		const isDoubleOperator = c =>
			(c === '!' || c === '=') &&
			text[i + 1] === '=';
		const isParenthesis = c => c === '(' || c === ')';
		const isBracket = c => c === '{' || c === '}';
		const isComma = c => c === ',';
		const isEqual = c => c === '=';
		const alphabet = /^[a-zA-Z]$/;
		const isAlphabetic = c => c.match(alphabet);
		const word = /^[-_a-zA-Z0-9]$/;
		const isWord = c => c.match(word);
		const addToken = (text, type, from, to, row, col) =>
			tokens.push({ text, type, from, to, row, col });

		// Text Traversal
		while (i < text.length) {
			const c = text[i];
			if (isIrrelevant(c)) { // Ignore Whitespace and ;
				if (c === '\n') {
					row++;
					col = 0;
				}
			} else if (isComment(c)) { // Single Line Comment #
				let cur = text[i];
				while (cur !== '\n') {
					i++;
					cur = text[i];
				}
				i--;
				col = 0;
			} else if (isDoubleOperator(c)) { // ==, !=
				addToken(
					`${c}=`,
					this.type.binop,
					i,
					i + 2,
					row,
					col
				);
				i++;
				col++;
			} else if (isOperator(c)) { // :, &, |, ^, ?, !
				const type =
					c === '?' || c === ':'
						? this.type.terop
						: c === '!'
							? this.type.unop
							: this.type.binop;
				addToken(
					c,
					type,
					i,
					i + 1,
					row,
					col
				);
			} else if (isEqual(c)) { // =
				addToken(
					c,
					this.type.assign,
					i,
					i + 1,
					row,
					col
				);
			} else if (isParenthesis(c)) { // (, )
				addToken(
					c,
					`${this.type.paren}${c === '(' ? 'left' : 'right'}`,
					i,
					i + 1,
					row,
					col
				);
			} else if (isBracket(c)) { // {, }
				addToken(
					c,
					`${this.type.brack}${c === '{' ? 'left' : 'right'}`,
					i,
					i + 1,
					row,
					col
				);
			} else if (isComma(c)) { // ,
				addToken(
					c,
					this.type.comma,
					i,
					i + 1,
					row,
					col
				);
			} else if (isAlphabetic(c)) { // Words
				let past = i;
				let str = '';
				let cur = text[i];
				while (isWord(cur)) {
					str += cur;
					i++;
					cur = text[i];
				}
				const type = this.saved.has(str)
					? this.type.saved
					: this.type.name;
				addToken(
					str,
					type,
					past,
					i--,
					row,
					col
				);
				col += i - past;
			} else { // No Match
				throw new Error(`Error: ${c} at row: ${row} col: ${col} cannot be lexed.`);
			}
			i++;
			col++;
		}

		// Save to record
		this.record.push(tokens);

		// Return tokens
		return tokens;
	}

	toString() {
		for (const record of this.record)
			console.table(record);
	}

}
