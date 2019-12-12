# Domy

## Overview

Domy is a simple boolean-centric language.

In terms of language design, Domy shares features from imperative and functional programming paradigms.

## Installation



## Formal Grammer

```bash



```

## Implementation

The Lexer is based on Bob Nystrom's Crafting Interpreters Book [chapter on Scanning](http://craftinginterpreters.com/scanning.html).

The Parser is a simplified version of the implementation in Douglas Crockford's Top Down Operator Precedence (a.k.a. TDOP) Parser [Article](http://crockford.com/javascript/tdop/index.html).

The Interpreter is self designed, traversing the Tree produced by the TDOP Parser.

Domy is a Command Line Application that runs on Node.js

## Motivation
