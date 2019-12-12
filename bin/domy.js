#!/usr/bin/env node --experimental-modules --no-warnings

// Import Node.js Modules
import { readFileSync, realpathSync } from 'fs';
import { join } from 'path';

// Import Local modules
import REPL from './repl.js';
import Lexer from './lexer.js';
import Parser from './parser.js';

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
	console.log(REPL);
	process.exit(0);
}

// Set File Argument
meta.argv = process.argv[meta.args - 1];

// Create File Path
meta.filePath = join(
	realpathSync('.'),
	meta.argv
);

// Load File Content
try {
	meta.fileContent = readFileSync(meta.filePath).toString();
} catch (error) {
	console.error(`Error: File "${meta.argv}" does not exist.`);
	process.exit(1);
}

// Create Tokens
meta.tokens = new Lexer(meta.fileContent);

// Create Parse Tree
meta.tree = new Parser(meta.tokens);

// Print Parse Tree
console.log(JSON.stringify(meta.tree, null, 2));
