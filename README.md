# Domy (o.O)

## Overview

Domy is a simple boolean-centric language.

In terms of language design, Domy shares features from both imperative and functional programming paradigms, supporting functions as first class citizens and state.

Core Ideas:

* Only boolean values exist
* Every construct has a boolean value

## Installation

Domy runs as a command line application on node.js.

```bash
Usage: domy <file path>
```

Requires npm or yarn:

```bash
npm i -g domy-lang
```

```bash
yarn global add domy-lang
```

## Implementation

The Lexer is inspired by Bob Nystrom's Crafting Interpreters Book [chapter on Scanning](http://craftinginterpreters.com/scanning.html).

The Parser is handmade and based on the grammar defined below, as I could not understand the TDOP Parser enough to implement it myself.

The Interpreter is a simple handmade tree walker.

## EBNF Grammer Definition

```text
program
   : expression*
   ;
expression
   | block
   | subexpr
   ;
block
   : '{' expression* '}'
   ;
subexpr
   : test
   | 'my' id '=' expression
   | id '=' expression
   ;
test
   : or
   | or '==' expression
   | or '!=' expression
   ;
or
   : xor
   | xor '|' expression
   ;
xor
   : and
   | and '^' expression
   ;
and
   : not
   | not '&' expression
   ;
not
   : term
   | '!' term
   ;
term
   : true
   | false
   | break
   | continue
   | 'return' expression?
   | 'do' arg_list block
   | 'while' expression block
   | id
   | id inv_list
   | '(' expression ')'
   | '(' expression ')' '?' (expression | block) ':' (expression | block)
   ;
id
   : letter (dash | letter | number)*
   ;
arg_list
   : '(' (id ',')* id? ')'
   ;
inv_list
   : '(' (inv ',')* inv? ')'
   ;
inv
   : expression
   ;
letter
   : [a-z] | [A-Z]
   ;
dash
   : '-' | '_'
   ;
number
   : [0-9]
   ;
WS
   : [\s\r\n\t] -> skip
   | '#' .* '\n' -> skip
   ;
```

## Motivation

Ever since I took [Principles of Programming Languages](https://www.cs.rutgers.edu/courses/principles-of-programming-languages) in Fall 2018, I have been fascinated with learning about different programming language paradigms

Naturally, the ongoing search piqued my curiosity as to now implement my own language!

I quickly learned how to create a lexer, but when it came to parsing, I had no success regardless of how many articles and tutorials I completed.

My hope is that domy will be my first complete language, regardless of how esoteric the nature and value of it is.

Also, I had a crazy line of thought where everything returns a boolean value with no language constructs, but some of the constructs were still useful for my own sanity and for turing completeness.

[syall](https://github.com/syall)

12/12/2019

Fun Fact: My favorite operator is the ternary operator
