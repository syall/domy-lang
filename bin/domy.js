#!/usr/bin/env node --experimental-modules --experimental-json-modules --no-warnings

// Import Node.js Modules
import { readFileSync, realpathSync } from 'fs';
import { join } from 'path';

// Import Local modules
import DomyREPL from './repl.js';
import DomyLexer from './lexer.js';
import DomyParser from './parser.js';
import DomyInterpreter from './interpreter.js';

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
if (meta.args < 3)
	DomyREPL();

// Set File Argument
meta.argv = process.argv[meta.args - 1];

// Create File Path
meta.filePath = join(realpathSync('.'), meta.argv);

// Load File Content
try {
	meta.fileContent = readFileSync(meta.filePath).toString();
} catch (error) {
	console.error(`Error: File '${meta.argv}' could not be loaded.`);
	process.exit(1);
}

// Lexer
meta.lexer = new DomyLexer();
try {
	meta.lexer.tokenize(meta.fileContent);
} catch (error) {
	process.exit(1);
}

// Parser
meta.parser = new DomyParser();
meta.tokens = meta.lexer.record.pop();
try {
	meta.parser.parse(meta.tokens, meta.fileContent);
} catch (error) {
	process.exit(1);
}

// Interpreter
meta.interpreter = new DomyInterpreter();
meta.tree = meta.parser.record.pop();
try {
	meta.interpreter.run(meta.tree);
} catch (error) {
	console.error(error);
	process.exit(1);
}
