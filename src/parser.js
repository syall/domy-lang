const symbol_table = {};
let token = null;
let scope = null;
let tokens = [];
let token_nr = 0;

const original_symbol = {
	nud: function () {
		throw new Error("Undefined.");
	},
	led: function (/* left */) {
		throw new Error("Missing operator.");
	}
};

const original_scope = {
	define: function (n) {
		const t = this.def[n.value];
		if (typeof t === "object") {
			throw new Error(
				t.reserved
					? "Already reserved."
					: "Already defined."
			);
		}
		this.def[n.value] = n;
		n.reserved = false;
		n.nud = itself;
		n.led = null;
		n.std = null;
		n.lbp = 0;
		n.scope = scope;
		return n;
	},
	find: function (n) {
		let e = this, o;
		let notFound = true;
		while (notFound) {
			o = e.def[n];
			if (o && typeof o !== 'function') {
				return e.def[n];
			}
			e = e.parent;
			if (!e) {
				o = symbol_table[n];
				return (
					o &&
						typeof o !== 'function'
						? o
						: symbol_table["(name)"]
				);
			}
		}
	},
	pop: function () {
		scope = this.parent;
	},
	reserve: function (n) {
		if (n.arity !== "name" || n.reserved) {
			return;
		}
		const t = this.def[n.value];
		if (t) {
			if (t.reserved) {
				return;
			}
			if (t.arity === "name") {
				throw new Error("Already defined.");
			}
		}
		this.def[n.value] = n;
		n.reserved = true;
	}
};

function symbol(id, bp) {
	let s = symbol_table[id];
	bp = bp || 0;
	if (s) {
		if (bp >= s.lbp) {
			s.lbp = bp;
		}
	} else {
		s = Object.create(original_symbol);
		s.id = s.value = id;
		s.lbp = bp;
		symbol_table[id] = s;
	}
	return s;
}

function advance(id) {
	if (id && token.id !== id) {
		throw new Error("Expected '" + id + "'.");
	}
	if (token_nr >= tokens.length) {
		token = symbol_table["(end)"];
		return;
	}
	const t = tokens[token_nr];
	token_nr += 1;
	const v = t.value;
	let a = t.type;
	let o;
	if (a === "name") {
		o = scope.find(v);
	} else if (a === "operator") {
		o = symbol_table[v];
		if (!o) {
			throw new Error("Unknown operator.");
		}
	} else if (a === "string" || a === "number") {
		o = symbol_table["(literal)"];
		a = "literal";
	} else {
		throw new Error("Unexpected token.");
	}
	token = Object.create(o);
	token.value = v;
	token.arity = a;
	return token;
}

function itself() {
	return this;
}

function new_scope() {
	const s = scope;
	scope = Object.create(original_scope);
	scope.def = {};
	scope.parent = s;
	return scope;
}

function expression(rbp) {
	let left;
	let t = token;
	advance();
	left = t.nud();
	while (rbp < token.lbp) {
		t = token;
		advance();
		left = t.led(left);
	}
	return left;
}

function infix(id, bp, led) {
	const s = symbol(id, bp);
	s.led = led || function (left) {
		this.first = left;
		this.second = expression(bp);
		this.arity = "binary";
		return this;
	};
	return s;
}

function infixr(id, bp, led) {
	const s = symbol(id, bp);
	s.led = led || function (left) {
		this.first = left;
		this.second = expression(bp - 1);
		this.arity = "binary";
		return this;
	};
	return s;
}

function prefix(id, nud) {
	const s = symbol(id);
	s.nud = nud || function () {
		scope.reserve(this);
		this.first = expression(70);
		this.arity = "unary";
		return this;
	};
	return s;
}

function assignment(id) {
	return infixr(id, 10, function (left) {
		if (left.id !== "." && left.id !== "[" &&
			left.arity !== "name") {
			throw new Error("Bad lvalue.");
		}
		this.first = left;
		this.second = expression(9);
		this.assignment = true;
		this.arity = "binary";
		return this;
	});
}

function constant(s, v) {
	const x = symbol(s);
	x.nud = function () {
		scope.reserve(this);
		this.value = symbol_table[this.id].value;
		this.arity = "literal";
		return this;
	};
	x.value = v;
	return x;
}

function statement() {
	const n = token;
	if (n.std) {
		advance();
		scope.reserve(n);
		return n.std();
	}
	const v = expression(0);
	if (!v.assignment && v.id !== "(") {
		throw new Error("Bad expression statement.");
	}
	advance(";");
	return v;
}

function statements() {
	const a = [];
	let s;
	let notEnd = true;
	while (notEnd) {
		if (token.id === "}" || token.id === "(end)") {
			break;
		}
		s = statement();
		if (s) {
			a.push(s);
		}
	}
	return a.length === 0 ? null : a.length === 1 ? a[0] : a;
}

function stmt(s, f) {
	const x = symbol(s);
	x.std = f;
	return x;
}

function block() {
	const t = token;
	advance("{");
	return t.std();
}

const parser = toks => {

	symbol(":");
	symbol(";");
	symbol(",");
	symbol(")");
	symbol("]");
	symbol("}");
	symbol("else");

	symbol("(end)");
	symbol("(name)");

	infix("+", 50);
	infix("-", 50);
	infix("*", 60);
	infix("/", 60);

	infix("==", 40);
	infix("!=", 40);
	infix("<", 40);
	infix("<=", 40);
	infix(">", 40);
	infix(">=", 40);

	symbol("(literal)").nud = itself;

	infix("?", 20, function (left) {
		this.first = left;
		this.second = expression(0);
		advance(":");
		this.third = expression(0);
		this.arity = "ternary";
		return this;
	});

	infix(".", 80, function (left) {
		this.first = left;
		if (token.arity !== "name") {
			throw new Error("Expected a property name.");
		}
		token.arity = "literal";
		this.second = token;
		this.arity = "binary";
		advance();
		return this;
	});

	infix("[", 80, function (left) {
		this.first = left;
		this.second = expression(0);
		this.arity = "binary";
		advance("]");
		return this;
	});

	infixr("&&", 30);
	infixr("||", 30);

	prefix("-");
	prefix("!");
	prefix("typeof");

	prefix("(", function () {
		const e = expression(0);
		advance(")");
		return e;
	});

	assignment("=");
	assignment("+=");
	assignment("-=");

	constant("true", true);
	constant("false", false);
	constant("null", null);

	stmt("{", function () {
		new_scope();
		const a = statements();
		advance("}");
		scope.pop();
		return a;
	});

	stmt("let", function () {
		const a = [];
		let n, t;
		let notEnd = true;
		while (notEnd) {
			n = token;
			if (n.arity !== "name") {
				throw new Error("Expected a new variable name.");
			}
			scope.define(n);
			advance();
			if (token.id === "=") {
				t = token;
				advance("=");
				t.first = n;
				t.second = expression(0);
				t.arity = "binary";
				a.push(t);
			}
			if (token.id !== ",") {
				break;
			}
			advance(",");
		}
		advance(";");
		return a.length === 0 ? null : a.length === 1 ? a[0] : a;
	});

	stmt("while", function () {
		advance("(");
		this.first = expression(0);
		advance(")");
		this.second = block();
		this.arity = "statement";
		return this;
	});

	stmt("if", function () {
		advance("(");
		this.first = expression(0);
		advance(")");
		this.second = block();
		if (token.id === "else") {
			scope.reserve(token);
			advance("else");
			this.third = token.id === "if" ? statement() : block();
		} else {
			this.third = null;
		}
		this.arity = "statement";
		return this;
	});

	stmt("break", function () {
		advance(";");
		if (token.id !== "}") {
			throw new Error("Unreachable statement.");
		}
		this.arity = "statement";
		return this;
	});

	stmt("return", function () {
		if (token.id !== ";") {
			this.first = expression(0);
		}
		advance(";");
		if (token.id !== "}") {
			throw new Error("Unreachable statement.");
		}
		this.arity = "statement";
		return this;
	});

	prefix("function", function () {
		const a = [];
		new_scope();
		if (token.arity === "name") {
			scope.define(token);
			this.name = token.value;
			advance();
		}
		advance("(");
		if (token.id !== ")") {
			let notEnd = true;
			while (notEnd) {
				if (token.arity !== "name") {
					throw new Error("Expected a parameter name.");
				}
				scope.define(token);
				a.push(token);
				advance();
				if (token.id !== ",") {
					break;
				}
				advance(",");
			}
		}
		this.first = a;
		advance(")");
		advance("{");
		this.second = statements();
		advance("}");
		this.arity = "function";
		scope.pop();
		return this;
	});

	infix("(", 80, function (left) {
		const a = [];
		if (left.id === "." || left.id === "[") {
			this.arity = "ternary";
			this.first = left.first;
			this.second = left.second;
			this.third = a;
		} else {
			this.arity = "binary";
			this.first = left;
			this.second = a;
			if ((left.arity !== "unary" || left.id !== "function") &&
				left.arity !== "name" && left.id !== "(" &&
				left.id !== "&&" && left.id !== "||" && left.id !== "?") {
				throw new Error("Expected a variable name.");
			}
		}
		if (token.id !== ")") {
			let notEnd = true;
			while (notEnd) {
				a.push(expression(0));
				if (token.id !== ",") {
					break;
				}
				advance(",");
			}
		}
		advance(")");
		return this;
	});

	symbol("this").nud = function () {
		scope.reserve(this);
		this.arity = "this";
		return this;
	};

	prefix("[", function () {
		const a = [];
		if (token.id !== "]") {
			let notEnd = true;
			while (notEnd) {
				a.push(expression(0));
				if (token.id !== ",") {
					break;
				}
				advance(",");
			}
		}
		advance("]");
		this.first = a;
		this.arity = "unary";
		return this;
	});

	prefix("{", function () {
		const a = [];
		if (token.id !== "}") {
			let notEnd = true;
			while (notEnd) {
				const n = token;
				if (n.arity !== "name" && n.arity !== "literal") {
					throw new Error("Bad key.");
				}
				advance();
				advance(":");
				var v = expression(0);
				v.key = n.value;
				a.push(v);
				if (token.id !== ",") {
					break;
				}
				advance(",");
			}
		}
		advance("}");
		this.first = a;
		this.arity = "unary";
		return this;
	});

	tokens = toks;
	token_nr = 0;
	scope = null;
	new_scope();
	advance();
	const s = statements();
	advance("(end)");
	scope.pop();
	return s;
};

export default parser;
