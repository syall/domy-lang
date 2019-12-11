const lexer = source => {

	// Current Index and Character and Length of Source
	let i = 0;
	let c = source[i];
	let length = source.length;

	// From Index
	let from = i;

	// Value Holders for Number, String, and Quote
	let n = null;
	let str = '';
	let q = '';

	// Tokens Lexed
	const tokens = [];

	// Prefix and Suffix Matching for Operators
	const prefix = '<>+-&';
	const suffix = '=>&:';

	// Make a token object.
	const make = type => value => ({
		type: type,
		value: value,
		from: from,
		to: i
	});

	const isOutOfBounds = () =>
		i >= length;

	const isAlpha = c =>
		(c >= 'a' && c <= 'z') ||
		(c >= 'A' && c <= 'Z');

	const isNumeric = c =>
		(c >= '0' && c <= '9');

	const isUnder = c =>
		c === '_';

	const isDot = c =>
		c === '.';

	const isQuote = c =>
		c === '\'' || c === '"';

	const isEscape = c =>
		c === '\\';

	const isWhiteSpace = c =>
		c <= ' ';

	const isControl = c =>
		c < ' ';

	const isComment = c =>
		c === '/' && source[i + 1] === '/';

	const isBreakComment = c =>
		c === '\n' || c === '\r' || c === '';

	while (c) {
		from = i;
		// Whitespace
		if (isWhiteSpace(c)) {
			// Skip
			i += 1;
			c = source[i];
			continue;
		}

		// Alphanumeric
		if (isAlpha(c)) {

			// AlphaNumericUnder
			while (isAlpha(c) || isNumeric(c) || isUnder(c)) {
				str += c;
				i += 1;
				c = source[i];
			}

			// Push Token
			tokens.push(make('name')(str));

			// Reset
			str = '';
			continue;
		}

		// Number
		if (isNumeric(c)) {

			// Above Decimal
			while (isNumeric(c)) {
				str += c;
				i += 1;
				c = source[i];
			}

			// Decimal
			if (isDot(c)) {
				str += c;
				i += 1;
				c = source[i];
				while (isNumeric(c)) {
					str += c;
					i += 1;
					c = source[i];
				}
			}

			// Checks for Bad Number
			if (isAlpha(c)) {
				str += c;
				i += 1;
				make('number', str);
				throw new Error('Syntax Error: Bad Number');
			}

			// Get Value
			n = +str;
			if (!isFinite(n)) {
				make('number', str);
				throw new Error('Syntax Error: Bad Number');
			}

			// Push Token
			tokens.push(make('number')(n));

			// Reset
			str = '';
			n = null;
			continue;
		}

		// String
		if (isQuote(c)) {

			// Set Quote Type
			q = c;
			i += 1;
			c = source[i];

			// Contents
			let isNotEnd = true;
			while (isNotEnd) {

				// Unterminated String or Control Character
				if (isControl(c)) {
					make('string', str);
					make('', str);
					throw new Error(
						"Syntax Error: Unterminated String or Control Character"
					);
				}

				// Finding End Quote
				if (q === c) {
					isNotEnd = false;
					continue;
				}

				// Escape Character
				if (isEscape(c)) {

					// Skip Escape Character
					i += 1;
					c = source[i];

					// Unterminated String
					if (isOutOfBounds()) {
						make('string', str);
						throw new Error(
							"Syntax Error: Unterminated String"
						);
					}

					// Escape Characters
					switch (c) {
						case 'b':
							c = '\b';
							break;
						case 'f':
							c = '\f';
							break;
						case 'n':
							c = '\n';
							break;
						case 'r':
							c = '\r';
							break;
						case 't':
							c = '\t';
							break;
						// Unicode
						case 'u':
							c = parseInt(source.substr(i + 1, 4), 16);
							if (!isFinite(c) || c < 0) {
								make('string', str);
								throw new Error(
									"Syntax Error: Unterminated string"
								);
							}
							c = String.fromCharCode(c);
							i += 4;
							break;
					}

				}

				// Next
				str += c;
				i += 1;
				c = source[i];
			}

			// After Quote
			i += 1;
			tokens.push(make('string')(str));
			c = source[i];

			// Reset
			str = '';
			continue;
		}

		// Comment
		if (isComment(c)) {

			// Skip Comment
			i += 2;
			c = source[i];

			while (!isBreakComment(c)) {
				i += 1;
				c = source[i];
			}

			continue;
		}

		// Multi-Character Operators
		if (prefix.indexOf(c) >= 0) {

			// Add Guaranteed Prefix
			str += c;
			i += 1;
			c = source[i];

			// Get Other Characters
			let isValid = true;
			while (isValid) {
				if (isOutOfBounds() || suffix.indexOf(c) < 0) {
					isValid = false;
				} else {
					str += c;
					i += 1;
					c = source[i];
				}
			}

			// Push Token
			tokens.push(make('operator')(str));

			// Reset
			str = '';
			continue;
		}
		// Single Character Operators
		else {
			i += 1;
			tokens.push(make('operator')(c));
			c = source[i];
		}
	}

	return tokens;
};

export default lexer;
