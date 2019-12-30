# The Domy Language

## Overview

Domy is a simple boolean-centric language.

In terms of language design, Domy shares features from both imperative and functional programming paradigms, supporting functions as first class citizens and state.

Core Ideas:

* Only boolean values exist
* Every construct has an equivalent boolean value

## Installation

Domy runs as a command line application on node.js (REPL and File Path Mode both available).

```bash
Usage: domy <filePath.do>?
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

The Interpreter is a simple handmade tree walker that runs the generated parse trees.

## EBNF Grammer Definition

```text
program
   : statement*
   ;
statement
   : expression
   | 'my' id '=' statement
   | id '=' statement
   ;
expression
   : or
   | or '==' expression
   | or '!=' expression
   ;
or
   : xor
   | xor '|' or
   ;
xor
   : and
   | and '^' xor
   ;
and
   : not
   | not '&' and
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
   | 'return' statement?
   | 'do' arg_list block
   | 'while' statement block
   | id
   | id inv_list
   | '(' statement ')'
   | '(' statement ')' '?' statement ':' statement
   | block
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
   : statement
   ;
block
   : '{' statement* '}'
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

## Updates

### The Beginning - 12/12/2019

Ever since I took [Principles of Programming Languages](https://www.cs.rutgers.edu/courses/principles-of-programming-languages) in Fall 2018, I have been fascinated with learning about different programming language paradigms

Naturally, the ongoing search piqued my curiosity as to now implement my own language!

I quickly learned how to create a lexer, but when it came to parsing, I had no success regardless of how many articles and tutorials I completed.

My hope is that domy will be my first complete language, regardless of how esoteric the nature and value of it is.

Also, I had a crazy line of thought where everything returns a boolean value with no language constructs, but some of the constructs were still useful for my own sanity and for turing completeness.

### MVP - 12/29/19

The language is now runnable, although there is no complete test suite as there is no language specification (so I expect tremendous amounts of undefined behavior).

It took me a long time to implement the keywords return, break, and continue, almost to the point of removing this element.

However, I realized my language would then only be boolean logic, which is pointless.

There is a great sense of relief now that I finished, as my previous languages were not even remotely close to being finished.

This journey felt like it took a lifetime although it really has been less than a  month.

I am glad I am not burnt out towards the topic of programming languages and have finally reached the first milestone!

My next steps are to consider compilation, although I will first take a break to gather any new ideas and study up.

[syall](https://github.com/syall)

Fun Fact: Domy got its name from the two language constructs `do` and `my`. Although they are not the only reserved words anymore, they were the inspiration for the name of the language.
