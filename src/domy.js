#!/usr/bin/env node --experimental-modules --no-warnings

// Import Node.js Modules
import { readFileSync, realpathSync } from 'fs';
import { join } from 'path';

// Import Lexer and Parser
import Lexer from './lexer.js';
import Parser from './parser.js';

// Create File Path
const filePath = join(
	realpathSync('.'),
	process.argv[process.argv.length - 1]
);

// Load File Content
const fileContent = readFileSync(filePath).toString();

// Create Tokens
const tokens = new Lexer(fileContent);

// Create Parse Tree
const tree = new Parser(tokens);

// Print Parse Tree
console.log(JSON.stringify({ tree }, null, 2));
