# Domy (o.O)

## Overview

Domy is a simple boolean-centric language.

In terms of language design, Domy shares features from both imperative and functional programming paradigms, supporting first class functions with no object-oriented nature!

Core Ideas:

* There are only boolean values!
* Every construct returns a boolean!

## Installation

Requires npm or yarn:

```bash
npm i -g domy-lang
```

```bash
yarn global add domy-lang
```

## Implementation

The Lexer is based on Bob Nystrom's Crafting Interpreters Book [chapter on Scanning](http://craftinginterpreters.com/scanning.html).

The Parser is a simplified version of the implementation in Douglas Crockford's Top Down Operator Precedence (a.k.a. TDOP) Parser [Article](http://crockford.com/javascript/tdop/tdop.html).

The Interpreter is self designed, traversing the Tree produced by the TDOP Parser.

Domy runs as a command line application on node.js.

## EBNF Grammer Definition

```text
program
    : statement*
    ;
statement
    : expression ";"?
    ;
expression
    : term
    : term operator expression
    ;
block
    : "{" statement* "}"
    ;
term
    : variable-declaration
    : variable-assignment
    : function-declaration
    : function-invocation
    : while-loop
    : "true"
    : "false"
    : "either"
    ;
variable-declaration
    : "my" variable-assignment
    ;
variable-assignment
    : variable-name "=" expression
    ;
variable-name
    : alphabet ( alphanumeric | "_" | "-" )*
    ;
alphabetic
    : ["a"-"z"] | ["A"-"Z"]
    ;
numeric
    : [0-9]
alphanumeric
    : alphabetic | numeric
    ;
function-declaration
    : "do" "(" arguments-declaration ")" block
    ;
arguments-declaration
    : ( variable-name "," )* variable-name?
    ;
function-invocation
    : variable-name "(" arguments-invocation ")"
    ;
arguments-invocation
    : ( invoke-argument "," )* invoke-argument?
    ;
invoke-argument
    : variable-name | expression
    ;
while-loop
    : "while"  "(" expression ")" block
    ;
operator
    : "?" expression ":"
    : "!="
    : "=="
    : "|"
    : "^"
    : "&"
    : "!"
    ;
```

## Motivation

Ever since I took [Principles of Programming Languages](https://www.cs.rutgers.edu/courses/principles-of-programming-languages) in Fall of 2018, I have been fascinated with learning about different programming language paradigms

Naturally, the ongoing search piqued my curiosity as to now implement my own language!

I quickly learned how to create a lexer, but when it came to parsing, I had no success regardless of how many articles and tutorials I completed.

My hope is that domy will be my first complete language, regardless of how esoteric the nature and value of it is.

Also, I had a crazy line of thought where everything returns a boolean value with no language constructs, but some of the constructs were still useful for my own sanity and for turing completeness.

[syall](https://github.com/syall)
12/12/2019

Fun Fact: My favorite operator is the ternary operator
