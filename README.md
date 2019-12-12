# Domy

## Overview

Domy is a simple boolean-centric language.

In terms of language design, Domy shares features from
both imperative and functional programming paradigms.

Core Ideas:

* There are only boolean values
* Every line of code returns a boolean value,
  even constructs and assignment

## Installation

```bash
npm i -g domy-lang
```

```bash
yarn global add domy-lang
```

## Formal Grammer

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
    ;
variable-declaration
    : "my" variable-name "=" expression
    ;
variable-name
    : alphabet ( alphanumeric | "_" | "-" )*
    ;
alphabet
    : [a-z] | [A-z]
    ;
numeric
    : [0-9]
alphanumeric
    : alphabet | numeric
    ;
variable-assignment
    : variable-name "=" expression
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
    : "|"
    : "^"
    : "&"
    : "!"
    : "?" expression ":" expression
    ;
```

## Implementation

The Lexer is based on Bob Nystrom's Crafting Interpreters Book
[chapter on Scanning](http://craftinginterpreters.com/scanning.html).

The Parser is a simplified version of the implementation in Douglas
Crockford's Top Down Operator Precedence (a.k.a. TDOP) Parser
[Article](http://crockford.com/javascript/tdop/index.html).

The Interpreter is self designed, traversing the Tree produced by the TDOP
Parser.

Domy runs as a command line application on node.js.

## Motivation

Over the past year, I have been learning about different programming
language paradigms and have been curious about finally implementing my
own!

I quickly picked up how to create a lexer, but when it came to parsing,
I had no success regardless of how many articles and tutorials I
completed.

My hope is that domy will be my first complete language, regardless of
how esoteric the nature of it is.

Also, I had a crazy line of thought where everything returns a boolean
value with no language constructs, but some of the constructs were
still useful for my own sanity and for turing completeness.

syall
12/12/2019

Sidenote: My favorite operator is the ternary operator
