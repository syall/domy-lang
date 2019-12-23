import { tokenTypes } from './utils.js';

class Scope {
    constructor(parent) {
        this.parent = parent;
        this.vars = new Map();
        this.vars.set('print', (...args) => console.log(...args) || true);
    }

    find(name) {
        let current = this;
        while (current !== null) {
            const value = current.vars.get(name);
            if (value !== null)
                return value;
            current = current.parent;
        }
        throw new Error(`${name} is not defined in scope.`);
    }
}

export default class DomyInterpreter {
    run(tree) {
        const global = new Scope(null);
        for (const statement of tree)
            this.evaluate(statement, global);
    }

    evaluate(node, parent) {
        const scope = new Scope(parent);
        const { type } = node;
        switch (type) {
            case tokenTypes.expr: // TODO: expr
                console.log(type);
                break;
            case tokenTypes.ternary: // TODO: ternary
                console.log(type);
                break;
            case tokenTypes.inv: // TODO: function invocation
                console.log(type);
                break;
            case tokenTypes.block: // TODO: block
                console.log(type);
                break;
            case tokenTypes.saved: // TODO: saved
                console.log(type);
                break;
            case tokenTypes.loop: // TODO: loop
                console.log(type);
                break;
            case tokenTypes.func: // TODO: func
                console.log(type);
                break;
            case tokenTypes.term: // TODO: term
                console.log(type);
                break;
            case tokenTypes.paren: // TODO: paren
                console.log(type);
                break;
            case tokenTypes.id:
                console.log(type);
                return scope.find(node.name);
            case tokenTypes.uno: // TODO: unary-operation
                console.log(type);
                break;
            case tokenTypes.and: // TODO: and
                console.log(type);
                break;
            case tokenTypes.xor: // TODO: xor
                console.log(type);
                break;
            case tokenTypes.or: // TODO: or
                console.log(type);
                break;
            case tokenTypes.test: // TODO: comparison
                console.log(type);
                break;
            case tokenTypes.varDec: // TODO: variable declaration
                console.log(type);
                break;
            case tokenTypes.varAss: // TODO: variable assignment
                console.log(type);
                break;
            default:
                throw new Error('Invalid Token Type.');
        }
    }
}
