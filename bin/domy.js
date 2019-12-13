#!/usr/bin/env node --experimental-modules --no-warnings

// Import Node.js Modules
import { readFileSync, realpathSync } from 'fs';
import { join } from 'path';

// Import Local modules
import DomyREPL from './repl.js';
import DomyLexer from './lexer.js';
import DomyParser from './parser.js';

// Meta Data
const meta = {
	args: process.argv.length,
};

// Too many Arguments
if (meta.args > 3) {
	console.error(`Error: Too many Arguments Provided.`);
	console.error(`Usage: domy <file path>`);
	process.exit(1);
}

// REPL
if (meta.args < 3) {
	try {
		const repl = new DomyREPL();
		repl.run();
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

// Set File Argument
meta.argv = process.argv[meta.args - 1];

// Create File Path
meta.filePath = join(realpathSync('.'), meta.argv);

// Load File Content
try {
	meta.fileContent = readFileSync(meta.filePath).toString();
} catch (error) {
	console.error(`Error: File "${meta.argv}" does not exist.`);
	process.exit(1);
}

// Create Tokens
try {
	const lexer = new DomyLexer();
	meta.tokens = lexer.tokenize(meta.fileContent);
} catch (error) {
	console.error(error);
	process.exit(1);
}

// Create Parse Tree
try {
	const parser = new DomyParser();
	meta.tree = parser.parse(meta.tokens);
	parser.toString();
} catch (error) {
	console.error(error);
	process.exit(1);
}
