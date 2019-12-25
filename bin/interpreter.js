import { tokenTypes, Scope } from './utils.js';

export default class DomyInterpreter {

    run(tree) {
        const global = new Scope(null);
        for (const statement of tree)
            this.evaluate(statement, global);
    }

    evaluate(node, scope) {
        switch (node.type) {
            case tokenTypes.ternary:
                return this.ternary(node, scope);
            case tokenTypes.term:
                return this.term(node);
            case tokenTypes.id:
                return this.id(node, scope);
            case tokenTypes.uno:
                return this.unary(node, scope);
            case tokenTypes.and:
                return this.and(node, scope);
            case tokenTypes.xor:
                return this.xor(node, scope);
            case tokenTypes.or:
                return this.or(node, scope);
            case tokenTypes.test:
                return this.test(node, scope);
            case tokenTypes.varDec:
                return this.variableDeclaration(node, scope);
            case tokenTypes.varAss:
                return this.variableAssignment(node, scope);
            case tokenTypes.paren:
                return this.parenthesis(node, scope);
            case tokenTypes.inv:
                return this.functionInvocation(node, scope);
            case tokenTypes.block:
                return this.block(node, scope);
            case tokenTypes.saved:
                return this.reserved(node, scope);
            case tokenTypes.loop:
                return this.loop(node, scope);
            case tokenTypes.func:
                return this.functionDeclaration(node);
            default:
                throw new Error('Invalid Token Type.');
        }
    }

    ternary(node, scope) {
    }

    term(node) {
    }

    id(node, scope) {
    }

    unary(node, scope) {
    }

    and(node, scope) {
    }

    xor(node, scope) {
    }

    or(node, scope) {
    }

    test(node, scope) {
    }

    variableDeclaration(node, scope) {
    }

    variableAssignment(node, scope) {
    }

    parenthesis(node, scope) {
    }

    functionInvocation(node, scope) {
    }

    block(node, scope) {
    }

    reserved(node, scope) {
    }

    loop(node, scope) {
    }

    functionDeclaration(node) {
    }

}
