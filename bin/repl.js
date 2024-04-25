import fs from 'fs';
import path from 'path';
import readlineSync from '../node_modules/readline-sync/lib/readline-sync.js';

import DomyInterpreter from './interpreter.js';
import DomyLexer from './lexer.js';
import DomyParser from './parser.js';

const { setDefaultOptions, promptCLLoop, } = readlineSync;
const { writeFileSync, readFileSync, realpathSync } = fs;
const { join } = path;

export default function DomyREPL() {
    let i = 0;
    const record = [];
    const errors = [];
    const lexer = new DomyLexer();
    const parser = new DomyParser();
    const runner = new DomyInterpreter();
    const meta = {};
    const pkg = JSON.parse(readFileSync('./package.json').toString());

    const backUp = () => {
        errors.length = 0;
        errors.push(meta.fileContent);
        save(true)('./domy-error.log');
        save(false)('./domy-backup.log');
        return true;
    };
    const save = error => p => {
        try {
            const filePath = join(realpathSync('.'), p);
            writeFileSync(
                filePath,
                (error ? errors : record).join('\n')
            );
        } catch (error) {
            return backUp();
        }
    };
    const load = p => {
        try {
            const filePath = join(realpathSync('.'), p);
            meta.fileContent = readFileSync(filePath).toString();
            lexer.tokenize(meta.fileContent);
            parser.parse(lexer.record[i]);
            runner.run(parser.record[i]);
            record.push(meta.fileContent);
            i++;
        } catch (error) {
            return backUp();
        }
    };
    const history = n => {
        console.group('History:');
        console.log(record.slice(!n ? -10 : -n).join('\n'));
        console.groupEnd();
    };
    const help = () => {
        console.group('Help:');
        console.log('.save <p>:\t Save record to a file <p>');
        console.log('.load <p>:\t Load file <p> into session');
        console.log('.history <n>:\t Show past <n> commands, default 10');
        console.log('.help:\t Prints usage information');
        console.log('.exit:\t Exit session');
        console.groupEnd();
    };
    const REPL = (...input) => {
        try {
            meta.fileContent = input.join(' ');
            lexer.tokenize(meta.fileContent, meta.fileContent);
            parser.parse(lexer.record[i], meta.fileContent);
            runner.run(parser.record[i]);
            record.push(meta.fileContent);
            i++;
        } catch (error) {
            return backUp();
        }
    };

    console.log(`Greetings from Domy v${pkg.version}!`);
    console.log(`Type '.help' for usage information.`);
    setDefaultOptions({ prompt: 'domy> ', history: false });
    promptCLLoop({
        '.save': save(false),
        '.load': load,
        '.history': history,
        '.help': help,
        '.exit': () => true,
        _: REPL
    });

    process.exit(0);
}
