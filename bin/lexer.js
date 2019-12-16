import {
	types,
	reserved,
	isIrrelevant,
	isComment,
	isOperator,
	isDoubleOperator,
	isParenthesis,
	isBracket,
	isComma,
	isEqual,
	isAlphabetic,
	isWord,
	printError
} from './utils.js';
import { meta } from './domy.js';

export default class DomyLexer {

	constructor() {
		// Record of all Lexes
		this.record = [];
	}

	tokenize(text) {
		// State
		let i = 0;
		let row = 1;
		let col = 1;

		// Tokens
		const tokens = [];
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
			} else if (isDoubleOperator(c, text[i + 1])) { // ==, !=
				addToken(
					`${c}=`,
					types.binop,
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
						? types.terop
						: c === '!'
							? types.unop
							: types.binop;
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
					types.assign,
					i,
					i + 1,
					row,
					col
				);
			} else if (isParenthesis(c)) { // (, )
				addToken(
					c,
					`${types.paren}${c === '(' ? 'left' : 'right'}`,
					i,
					i + 1,
					row,
					col
				);
			} else if (isBracket(c)) { // {, }
				addToken(
					c,
					`${types.brack}${c === '{' ? 'left' : 'right'}`,
					i,
					i + 1,
					row,
					col
				);
			} else if (isComma(c)) { // ,
				addToken(
					c,
					types.comma,
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
				const type = reserved.has(str)
					? types.saved
					: types.name;
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
				printError('Lexer', `Unable to lex ${c}`, row, col, i, i);
				throw new Error();
			}
			i++;
			col++;
		}

		// Add End Token
		addToken(
			'(end)',
			types.saved,
			-1,
			meta.fileContent.length,
			Infinity,
			Infinity
		);

		// Save to record
		this.record.push(tokens);

		// Return tokens
		return tokens;
	}

	toString() {
		const options = [
			'text',
			'row',
			'col'
		];
		console.table(this.record[this.record.length - 1], options);
	}

}
