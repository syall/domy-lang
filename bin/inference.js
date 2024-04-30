// Hindley-Milner Type Inference
// Adapted from Robert Smallshire's Python implementation:
// https://github.com/rob-smallshire/hindley-milner-python/blob/master/inference.py

import { tokenTypes } from "./utils.js";

// =============================================================================
// Translation from Domy nodes to Inference nodes

/**
 * Type inference for Domy. Translates Domy AST to Inference AST.
 * 
 * Operations:
 * - variable-declaration
 * - variable-assignment
 * 
 * @param {Array} tree The Domy AST
 * @returns {Array[Lambda|Identifier|Apply|Let|Letrec]} The Inference AST root node(s)
 */
function inferTree(tree) {
    let roots = [];
    while (tree.length > 0) {
        const node = tree.shift();
        if (node === undefined) {
            break;
        }
        // console.log(node);
        if (node.type === tokenTypes.varDec || node.type === tokenTypes.varAss) {
            // console.log("Variable declaration or assignment");
            // Create a copy of the Let binding for each inferTree entry
            const value = infer(node.value);
            const substatements = inferTree(tree);

            for (const substatement of substatements) {
                roots.push(new Let(node.name, value, substatement));
            }
    
            return roots;
        }
        roots.push(infer(node));
    }
    return roots;
}

/**
 * Infer one statement from the Domy AST.
 * 
 * One statement operations:
 * - function-invocation
 * - function-declaration
 * - block
 * - terminal
 * - identifier
 * - and
 * - xor
 * - or
 * - test
 * 
 * @param {*} node a single statement or nested node
 * @returns {Lambda|Identifier|Apply|Let|Letrec} The Inference AST root node for the statement and potential block substatements
 */
function infer(node) {
    switch (node.type) {
        case tokenTypes.inv:
            // Since Apply only accepts one argument, we need to create a chain of functions
            // to represent multiple arguments.
            // console.log("Function invocation");
            if (node.args.length > 1) {
                let res = new Apply(new Identifier(node.name), infer(node.args[0]));
                for (let i = 1; i < node.args.length; i++) {
                    // Should end up as:
                    // Apply(Apply(Apply(node.name, arg1), arg2), arg3)
                    res = new Apply(res, infer(node.args[i]));
                }
                return res;
            }
            return new Apply(new Identifier(node.name), infer(node.args[0]));
        case tokenTypes.func:
            // Since Lambda only accepts one argument, we need to create a chain of functions
            // to represent multiple arguments.
            // console.log("Function declaration");
            // console.log(node);
            if (node.args.length > 1) {
                const nestedLambda = infer({
                    type: tokenTypes.func,
                    args: node.args.slice(1),
                    value: node.value
                });
                return new Lambda(node.args[0].text, nestedLambda);
            }
            return new Lambda(node.args[0].text, infer(node.value));
        case tokenTypes.block:
            // TODO: Fix block due to branching let statements
            // console.log("Block");
            return inferTree(node.value)[0];
        case tokenTypes.term:
            // console.log("Terminal");
            return new Identifier(node.value);
        case tokenTypes.id:
            // console.log("Identifier");
            return new Identifier(node.name);
        case tokenTypes.and:
            // console.log("And");
            return new Apply(new Apply(new Identifier('and'), infer(node.left)), infer(node.right));
        case tokenTypes.xor:
            // console.log("Xor");
            return new Apply(new Apply(new Identifier('xor'), infer(node.left)), infer(node.right));
        case tokenTypes.or:
            // console.log("Or");
            return new Apply(new Apply(new Identifier('or'), infer(node.left)), infer(node.right));
        case tokenTypes.test:
            // console.log("Test");
            return new Apply(new Apply(new Identifier('test'), infer(node.left)), infer(node.right));
        case tokenTypes.saved:
            switch (node.text) {
                case 'return':
                    // Ignore return keyword
                    return infer(node.value);
            }
        default:
            throw new Error(`Unhandled syntax node ${node.type}`);
    }
}

// =============================================================================
// Classes for AST

/**
 * Lambda abstraction
 * @class
 * @property {string} v
 * @property {string} body
 */
class Lambda {
    v;
    body;

    constructor(v, body) {
        this.v = v;
        this.body = body;
    }

    toString() {
        return `(fn ${this.v} => ${this.body})`;
    }
}

/**
 * Identifier
 * @class
 * @property {string} name
 */
class Identifier {
    name;

    constructor(name) {
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

/**
 * Function application
 * @class
 * @property {string} fn
 * @property {string} arg
 */
class Apply {
    fn;
    arg;

    constructor(fn, arg) {
        this.fn = fn;
        this.arg = arg;
    }

    toString() {
        return `(${this.fn} ${this.arg})`;
    }
}

/**
 * Let binding
 * @class
 * @property {string} v
 * @property {string} defn
 * @property {string} body
 */
class Let {
    v;
    defn;
    body;

    constructor(v, defn, body) {
        this.v = v;
        this.defn = defn;
        this.body = body;
    }

    toString() {
        return `(let ${this.v} = ${this.defn} in ${this.body})`;
    }
}

/**
 * Letrec binding
 * @class
 * @property {string} v
 * @property {string} defn
 * @property {string} body
 */
class Letrec {
    v;
    defn;
    body;

    constructor(v, defn, body) {
        this.v = v;
        this.defn = defn;
        this.body = body;
    }

    toString() {
        return `(letrec ${this.v} = ${this.defn} in ${this.body})`;
    }
}

// =============================================================================
// Exceptions

/**
 * Raised if the type inference algorithm cannot infer types successfully
 * @class
 * @property {string} message
 */
class InferenceError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }

    toString() {
        return this.message;
    }
}

/**
 * Raised if the type environment supplied for is incomplete
 * @class
 * @property {string} message
 */
class ParseError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }

    toString() {
        return this.message;
    }
}

// =============================================================================
// Types

/**
 * A type variable standing for an arbitrary type.
 * All type variables have a unique id, but names are only assigned lazily,
 * when required.
 * @class
 * @property {number} id
 * @property {string} name
 */
class TypeVariable {
    static nextVariableId = 0;
    static nextVariableName = 'a';

    id;
    __name;
    instance;

    constructor() {
        this.id = TypeVariable.nextVariableId;
        TypeVariable.nextVariableId += 1;
        this.instance = null;
        this.__name = null;
    }

    get name() {
        if (this.__name === null) {
            this.__name = TypeVariable.nextVariableName;
            TypeVariable.nextVariableName = String.fromCharCode(TypeVariable.nextVariableName.charCodeAt(0) + 1);
        }
        return this.__name;
    }

    toString() {
        if (this.instance !== null) {
            return this.instance.toString();
        } else {
            return this.name;
        }
    }
}

/**
 * An n-ary type constructor which builds a new type from old
 * @class
 * @property {string} name
 * @property {Array} types
 */
class TypeOperator {
    name;
    types;

    constructor(name, types) {
        this.name = name;
        this.types = types;
    }

    toString() {
        const num_types = this.types.length;
        if (num_types === 0) {
            return this.name;
        } else if (num_types === 2) {
            return `(${this.types[0]} ${this.name} ${this.types[1]})`;
        } else {
            return `${this.name} ${this.types.join(' ')}`;
        }
    }
}

/**
 * A binary type constructor which builds function types
 * @class
*/
class Function extends TypeOperator {
    constructor(fromType, toType) {
        super("->", [fromType, toType]);
    }
}

// Basic types
const Bool = new TypeOperator("bool", []);
const Integer = new TypeOperator("int", []);

// =============================================================================
// Type Inference

/**
 * Computes the type of the expression given by node.
 * 
 * The type of the node is computed in the context of the
 * supplied type environment env. Data types can be introduced into the
 * language simply by having a predefined set of identifiers in the initial
 * environment; this way there is no need to change the syntax or, more
 * importantly, the type-checking program when extending the language.
 * 
 * @param {Lambda|Identifier|Apply|Let|Letrec} node The root of the abstract syntax tree.
 * @param {Map<string, TypeOperator>} env The type environment is a mapping of expression identifier names to type assignments.
 * @param {Set<TypeVariable>} nonGeneric A set of non-generic variables, or null
 * @returns {TypeOperator} The computed type of the expression.
 * @throws {InferenceError} The type of the expression could not be inferred, for example if it is not possible to unify two types such as Integer and Bool
 * @throws {ParseError} The abstract syntax tree rooted at node could not be parsed
 */
function analyse(node, env, nonGeneric = null) {
    if (nonGeneric === null) {
        nonGeneric = new Set();
    }

    if (node instanceof Identifier) {
        // console.log(`==Identifier: ${node.name}`);
        return getType(node.name, env, nonGeneric);
    } else if (node instanceof Apply) {
        // console.log(`==Apply: ${node.fn} ${node.arg}`);
        const funType = analyse(node.fn, env, nonGeneric);
        const argType = analyse(node.arg, env, nonGeneric);
        const resultType = new TypeVariable();

        unify(new Function(argType, resultType), funType);

        return resultType;
    } else if (node instanceof Lambda) {
        // console.log(`==Lambda: ${node.v} => ${node.body}`);
        const argType = new TypeVariable();
        const newEnv = new Map(env);
        const newNonGeneric = new Set(nonGeneric);

        newEnv.set(node.v, argType);
        newNonGeneric.add(argType);
        const resultType = analyse(node.body, newEnv, newNonGeneric);
        
        return new Function(argType, resultType);
    } else if (node instanceof Let) {
        // console.log(`==Let: ${node.v} = ${node.defn} in ${node.body}`);
        const defnType = analyse(node.defn, env, nonGeneric);
        const newEnv = new Map(env);

        newEnv.set(node.v, defnType);

        return analyse(node.body, newEnv, nonGeneric);
    } else if (node instanceof Letrec) {
        // console.log(`==Letrec: ${node.v} = ${node.defn} in ${node.body}`);
        const newType = new TypeVariable();
        const newEnv = new Map(env);
        const newNonGeneric = new Set(nonGeneric);

        newEnv.set(node.v, newType);
        newNonGeneric.add(newType);
        const defnType = analyse(node.defn, newEnv, newNonGeneric);
        unify(newType, defnType);

        return analyse(node.body, newEnv, nonGeneric);
    }
    throw new Error(`Unhandled syntax node ${node.constructor.name}`);
}

/**
 * Get the type of identifier name from the type environment env.
 * 
 * @param {string} name The identifier name
 * @param {Map<string, TypeOperator>} env The type environment mapping from identifier names to types
 * @param {Set<TypeVariable>} nonGeneric A set of non-generic TypeVariables
 * @returns {TypeOperator} The type of the identifier
 * @throws {ParseError} Raised if name is an undefined symbol in the type environment.
 */
function getType(name, env, nonGeneric) {
    if (env.has(name)) {
        return fresh(env.get(name), nonGeneric);
    } else if (isBooleanLiteral(name)) {
        return Bool;
    } else if (isIntegerLiteral(name)) {
        return Integer;
    } else {
        throw new ParseError(`Undefined symbol ${name}`);
    }
}

/**
 * Makes a copy of a type expression.
 * 
 * The type t is copied. The the generic variables are duplicated and the non_generic variables are shared.
 * 
 * @param {TypeOperator} t A type to be copied.
 * @param {Set<TypeVariable>} nonGeneric A set of non-generic TypeVariables
 * @returns {TypeOperator} The copied type
 */
function fresh(t, nonGeneric) {
    const mappings = new Map(); // A mapping of TypeVariables to TypeVariables

    function freshrec(tp) {
        const p = prune(tp);
        if (p instanceof TypeVariable) {
            if (isGeneric(p, nonGeneric)) {
                if (!mappings.has(p)) {
                    mappings.set(p, new TypeVariable());
                }
                return mappings.get(p);
            } else {
                return p;
            }
        } else if (p instanceof TypeOperator) {
            return new TypeOperator(p.name, p.types.map(x => freshrec(x)));
        }
    }

    return freshrec(t);
}

/**
 * Unify the two types t1 and t2.
 * 
 * Makes the types t1 and t2 the same.
 * 
 * @param {TypeOperator} t1 The first type to be made equivalent
 * @param {TypeOperator} t2 The second type to be be equivalent
 * @throws {InferenceError} Raised if the types cannot be unified.
 */
function unify(t1, t2) {
    let a = prune(t1);
    let b = prune(t2);
    if (a instanceof TypeVariable) {
        if (a !== b) {
            if (occursInType(a, b)) {
                throw new InferenceError("recursive unification");
            }
            a.instance = b;
        }
    } else if (a instanceof TypeOperator && b instanceof TypeVariable) {
        unify(b, a);
    } else if (a instanceof TypeOperator && b instanceof TypeOperator) {
        if (a.name !== b.name || a.types.length !== b.types.length) {
            throw new InferenceError(`Type mismatch: ${a} != ${b}`);
        }
        for (let i = 0; i < a.types.length; i++) {
            unify(a.types[i], b.types[i]);
        }
    } else {
        throw new Error("Not unified");
    }
}

/**
 * Returns the currently defining instance of t.
 * 
 * As a side effect, collapses the list of type instances. The function Prune
 * is used whenever a type expression has to be inspected: it will always
 * return a type expression which is either an uninstantiated type variable or
 * a type operator; i.e. it will skip instantiated variables, and will
 * actually prune them from expressions to remove long chains of instantiated
 * variables.
 * 
 * @param {TypeOperator} t The type to be pruned
 * @returns {TypeVariable|TypeOperator} An uninstantiated TypeVariable or a TypeOperator
 */
function prune(t) {
    if (t instanceof TypeVariable) {
        if (t.instance !== null) {
            t.instance = prune(t.instance);
            return t.instance;
        }
    }
    return t;
}

/**
 * Checks whether a given variable occurs in a list of non-generic variables
 * 
 * Note that a variables in such a list may be instantiated to a type term,
 * in which case the variables contained in the type term are considered
 * non-generic.
 * 
 * Note: Must be called with v pre-pruned
 * 
 * @param {TypeVariable} v The TypeVariable to be tested for genericity
 * @param {Set<TypeVariable>} nonGeneric A set of non-generic TypeVariables
 * @returns {boolean} True if v is a generic variable, otherwise False
 */
function isGeneric(v, nonGeneric) {
    return !occursIn(v, Array.from(nonGeneric));
}

/**
 * Checks whether a type variable occurs in a type expression.
 * 
 * Note: Must be called with v pre-pruned
 * 
 * @param {TypeVariable} v The TypeVariable to be tested for
 * @param {TypeOperator} type2 The type in which to search
 * @returns {boolean} True if v occurs in type2, otherwise False
 */
function occursInType(v, type2) {
    const prunedType2 = prune(type2);
    if (prunedType2 === v) {
        return true;
    } else if (prunedType2 instanceof TypeOperator) {
        return occursIn(v, prunedType2.types);
    }
    return false;
}

/**
 * Checks whether a types variable occurs in any other types.
 * 
 * @param {TypeVariable} t The TypeVariable to be tested for
 * @param {Array<TypeOperator>} types The sequence of types in which to search
 * @returns {boolean} True if t occurs in any of types, otherwise False
 */
function occursIn(t, types) {
    return types.some(t2 => occursInType(t, t2));
}

/**
 * Checks whether name is an boolean literal string.
 * 
 * @param {string} name The identifier to check
 * @returns {boolean} True if name is an boolean literal, otherwise False
 */
function isBooleanLiteral(name) {
    return name.toString().localeCompare("true") === 0 || name.toString().localeCompare("false") === 0;
}

/*
def is_integer_literal(name):
    """Checks whether name is an integer literal string.

    Args:
        name: The identifier to check

    Returns:
        True if name is an integer literal, otherwise False
    """
    result = True
    try:
        int(name)
    except ValueError:
        result = False
    return result
*/
/**
 * Checks whether name is an integer literal string.
 * 
 * @param {string} name The identifier to check
 * @returns {boolean} True if name is an integer literal, otherwise False
 */
function isIntegerLiteral(name) {
    return !isNaN(parseInt(name));
}

// =============================================================================
// Run

export default class DomyInferenceGenerator {
    /**
    * Function to run the type inference algorithm.
    * @param {Array} tree 
    */
   run(tree) {
        let treeCopy = new Array(...tree);
        const var1 = new TypeVariable();
        const env = new Map([
            ["true", Bool],
            ["false", Bool],
            ["print", new Function(var1, var1)],
            ["and", new Function(Bool, new Function(Bool, Bool))],
            ["or", new Function(Bool, new Function(Bool, Bool))],
            ["xor", new Function(Bool, new Function(Bool, Bool))],
            ["test", new Function(Bool, new Function(Bool, Bool))]
        ]);

        const roots = inferTree(treeCopy);
        console.log("Type inference results:");
        for (const root of roots) {
            // console.log("----")
            // console.log(root);
            let copy = root;
            while (copy.body !== undefined) {
                copy = copy.body;
                // console.log(copy);
            }
        }
        for (const root of roots) {
            try {
                const t = analyse(root, env);
                console.log(t.toString());
            }
            catch (e) {
                console.log(e.message);
            }
        }
    }
}

// =============================================================================
// Examples

/**
 * Try to evaluate a type printing the result or reporting errors.
 * 
 * @param {Map<string, TypeOperator>} env The type environment in which to evaluate the expression.
 * @param {Lambda|Identifier|Apply|Let|Letrec} node The root node of the abstract syntax tree of the expression.
 */
function try_exp(env, node) {
    let output = `${node} : `;
    try {
        const t = analyse(node, env)
        output += t.toString();
    }
    catch (e) {
        output += e.message;
    }
    console.log(output);
}

/**
 * The main example program.
 * 
 * Sets up some predefined types using the type constructors TypeVariable,
 * TypeOperator and Function.  Creates a list of example expressions to be
 * evaluated. Evaluates the expressions, printing the type or errors arising
 * from each.
 */
function main() {
    const var1 = new TypeVariable();
    const var2 = new TypeVariable();
    const pair_type = new TypeOperator("*", [var1, var2]);

    const var3 = new TypeVariable();

    const my_env = new Map([
        ["pair", new Function(var1, new Function(var2, pair_type))],
        ["true", Bool],
        ["cond", new Function(Bool, new Function(var3, new Function(var3, var3)))],
        ["zero", new Function(Integer, Bool)],
        ["pred", new Function(Integer, Integer)],
        ["times", new Function(Integer, new Function(Integer, Integer))]
    ]);

    const pair = new Apply(
        new Apply(
            new Identifier("pair"),
            new Apply(
                new Identifier("f"),
                new Identifier("4")
            )
        ),
        new Apply(
            new Identifier("f"),
            new Identifier("true")
        )
    );

    const examples = [
        // factorial
        new Letrec(
            "factorial",
            new Lambda(
                "n",
                new Apply(
                    new Apply(
                        new Apply(
                            new Identifier("cond"),
                            new Apply(
                                new Identifier("zero"),
                                new Identifier("n")
                            )
                        ),
                        new Identifier("1")
                    ),
                    new Apply(
                        new Apply(
                            new Identifier("times"),
                            new Identifier("n")
                        ),
                        new Apply(
                            new Identifier("factorial"),
                            new Apply(
                                new Identifier("pred"),
                                new Identifier("n")
                            )
                        )
                    )
                )
            ),
            new Apply(
                new Identifier("factorial"),
                new Identifier("5")
            )
        ),

        // Should fail:
        // fn x => (pair(x(3) (x(true)))
        new Lambda(
            "x",
            new Apply(
                new Apply(
                    new Identifier("pair"),
                    new Apply(
                        new Identifier("x"),
                        new Identifier("3")
                    )
                ),
                new Apply(
                    new Identifier("x"),
                    new Identifier("true")
                )
            )
        ),

        // pair(f(3), f(true))
        new Apply(
            new Apply(
                new Identifier("pair"),
                new Apply(
                    new Identifier("f"),
                    new Identifier("4")
                )
            ),
            new Apply(
                new Identifier("f"),
                new Identifier("true")
            )
        ),

        // let f = (fn x => x) in ((pair (f 4)) (f true))
        new Let(
            "f",
            new Lambda("x", new Identifier("x")),
            pair
        ),

        // fn f => f f (fail)
        new Lambda("f", new Apply(new Identifier("f"), new Identifier("f"))),

        // let g = fn f => 5 in g g
        new Let(
            "g",
            new Lambda("f", new Identifier("5")),
            new Apply(new Identifier("g"), new Identifier("g"))
        ),

        // example that demonstrates generic and non-generic variables:
        // fn g => let f = fn x => g in pair (f 3, f true)
        new Lambda(
            "g",
            new Let(
                "f",
                new Lambda("x", new Identifier("g")),
                new Apply(
                    new Apply(
                        new Identifier("pair"),
                        new Apply(new Identifier("f"), new Identifier("3"))
                    ),
                    new Apply(new Identifier("f"), new Identifier("true"))
                )
            )
        ),

        // Function composition
        // fn f (fn g (fn arg (f g arg)))
        new Lambda(
            "f",
            new Lambda(
                "g",
                new Lambda(
                    "arg",
                    new Apply(
                        new Identifier("g"),
                        new Apply(new Identifier("f"), new Identifier("arg"))
                    )
                )
            )
        )
    ];

    for (const example of examples) {
        try_exp(my_env, example);
    }
}

// main();