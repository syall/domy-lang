import { readFileSync, realpathSync } from 'fs';
import { join } from 'path';
import lexer from './lexer.js';
import parser from './parser.js';

console.log('Finding File Path...');
const filePath = join(realpathSync('.'), 'examples', 'test.js');
console.log('Found File Path!\n');

console.log('Reading File...');
const fileContent = readFileSync(filePath).toString();
console.log('Read File!\n');

console.log('Start Lexing...');
const tokens = lexer(fileContent);
console.log('Finished Lexing!\n');

console.log('Start Parsing...');
const tree = parser(tokens);
console.log('Finished Parsing!\n');

const displayParseOptions = [
	'name', 'message',
	'from', 'to',
	'key', 'value',
	'first', 'second', 'third', 'fourth'
];
console.log('Parse Tree:');
console.log(JSON.stringify(tree, displayParseOptions, 2));
