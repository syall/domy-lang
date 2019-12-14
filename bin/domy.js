#!/usr/bin/env node --experimental-modules --no-warnings

// Import Node.js Modules
import { readFileSync, realpathSync } from 'fs';
import { join } from 'path';

// Import Local modules
import DomyREPL from './repl.js';
import DomyLexer from './lexer.js';
import DomyParser from './parser.js';

// Meta Data
export const meta = {
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

// Lexer
meta.lexer = new DomyLexer();
console.group('Lexer');
console.time('Timer');
meta.lexer.tokenize(meta.fileContent);
console.timeEnd('Timer');
console.groupEnd();
meta.lexer.toString();
console.log();

// Parser
meta.parser = new DomyParser();
console.group('Parser');
console.time('Timer');
meta.parser.parse(meta.lexer.record.pop());
console.timeEnd('Timer');
console.groupEnd();
meta.parser.toString();
console.log();
