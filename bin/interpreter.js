import { tokenTypes, Scope } from './utils.js';

export default class DomyInterpreter {
    run(tree) {
        const global = new Scope(null);
        for (const statement of tree)
            this.evaluate(statement, global);
    }

    evaluate(node, parent) {
        let scope = parent;
        const { type } = node;
        switch (type) {
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
            case tokenTypes.std:
                return node.exe(scope.find(node.args[0]));
            default:
                throw new Error('Invalid Token Type.');
        }
    }

    ternary(node, scope) {
        const choice = this.evaluate(node.cond, scope)
            ? node.left
            : node.right;
        const { value } = this.evaluate(choice, scope);
        return { value };
    }

    term(node) {
        return { value: node.value };
    }

    id(node, scope) {
        return scope.find(node.name);
    }

    unary(node, scope) {
        const { value, type } = this.evaluate(node.value, scope);
        const ret = { value };
        if (type) ret.type = type;
        return ret;
    }

    and(node, scope) {
        const { value: left, type: lType } = this.evaluate(node.left, scope);
        const { value: right, type } = this.evaluate(node.right, scope);
        if (lType)
            throw new Error(`Only allowed to have reserved words on right.`);
        return { value: left && right, type };
    }

    xor(node, scope) {
        const { value: left, type: lType } = this.evaluate(node.left, scope);
        const { value: right, type } = this.evaluate(node.right, scope);
        if (lType)
            throw new Error(`Only allowed to have reserved words on right.`);
        return (left && !right || !left && right)
            ? { value: true, type }
            : { value: false };
    }

    or(node, scope) {
        const { value: left, type: lType } = this.evaluate(node.left, scope);
        const { value: right, type } = this.evaluate(node.right, scope);
        if (lType)
            throw new Error(`Only allowed to have reserved words on right.`);
        const ret = { value: left && right };
        if (!left && right && type) ret.type = type;
        return ret;
    }

    test(node, scope) {
        const { value: left, type: lType } = this.evaluate(node.left, scope);
        const { value: right, type } = this.evaluate(node.right, scope);
        if (lType)
            throw new Error(`Only allowed to have reserved words on right.`);
        const ret = {
            value: node.value === '=='
                ? left === right
                : left !== right
        };
        if (type) ret.type = type;
        return ret;
    }

    variableDeclaration(node, scope) {
        const variable = scope.find(node.name);
        if (variable !== null)
            throw new Error(`Variable ${node.name} already exists.`);
        const value = this.evaluate(node.value, scope);
        scope.add(node.name, value);
        return { value: true };
    }

    variableAssignment(node, scope) {
        const variable = scope.find(node.name);
        if (variable === null)
            throw new Error(`Variable ${node.name} doesn't exist.`);
        const { value } = this.evaluate(node.value, scope);
        scope.reassign(node.name, value);
        return { value: true };
    }

    parenthesis(node, scope) {
        const { value, type } = this.evaluate(node.value, scope);
        const ret = { value };
        if (type) ret.type = type;
        return ret;
    }

    functionInvocation(node, scope) {
        const func = scope.find(node.name);
        if (!func)
            throw new Error(`Function ${node.name} does not exist.`);
        if (node.args.length !== func.args.length)
            throw new Error(`Invalid arguments provided to ${node.name}.`);
        const next = new Scope(scope);
        for (let i = 0; i < func.args.length; i++)
            if (node.args[i].type === tokenTypes.id)
                next.add(func.args[i].text, scope.find(node.args[i].name));
            else
                next.add(func.args[i].text, this.evaluate(node.args[i], scope));
        const { value, type } = this.evaluate(func.value, next);
        return { value, type };
    }

    block(node, scope) {
        const next = new Scope(scope);
        for (const statement of node.value) {
            const solve = this.evaluate(statement, next);
            if (solve.type)
                return { value: solve.value, type: solve.type };
        }
        return { value: true };
    }

    reserved(node, scope) {
        return node.text === 'return'
            ? {
                value: node.value !== null
                    ? this.evaluate(node.value, scope).value
                    : true,
                type: node.text
            }
            : {
                value: true,
                type: node.text
            };
    }

    loop(node, scope) {
        const next = new Scope(scope);
        while (true) {
            if (!this.evaluate(node.cond, next))
                break;
            const { value, type } = this.evaluate(node.value, next);
            if (type === 'return')
                return value ? value : true;
            if (type === 'continue')
                continue;
            if (type === 'break')
                break;
        }
        return true;
    }

    functionDeclaration(node) {
        return node;
    }

}
