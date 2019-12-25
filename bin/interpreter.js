import { tokenTypes, Scope } from './utils.js';

export default class DomyInterpreter {

    run(tree) {
        const global = new Scope(null);
        global.add('print', {
            type: tokenTypes.std,
            args: ['toPrint'],
            value: arg => {
                console.log(
                    arg.type !== tokenTypes.func
                        ? arg.value
                        : arg
                );
                return { value: true, type: 'return' };
            }
        });
        for (const statement of tree)
            this.evaluate(statement, global);
    }

    evaluate(node, scope) {
        switch (node.type) {
            case tokenTypes.term:
                return this.terminal(node, scope);
            case tokenTypes.id:
                return this.identifier(node, scope);
            case tokenTypes.ternary:
                return this.ternaryOperation(node, scope);
            case tokenTypes.uno:
                return this.unaryOperation(node, scope);
            case tokenTypes.and:
                return this.andExpression(node, scope);
            case tokenTypes.xor:
                return this.xorExpression(node, scope);
            case tokenTypes.or:
                return this.orExpression(node, scope);
            case tokenTypes.test:
                return this.comparison(node, scope);
            case tokenTypes.varDec:
                return this.variableDeclaration(node, scope);
            case tokenTypes.varAss:
                return this.variableAssignment(node, scope);
            case tokenTypes.paren:
                return this.parenthesisGroup(node, scope);
            case tokenTypes.inv:
                return this.functionInvocation(node, scope);
            case tokenTypes.block:
                return this.blockGroup(node, scope);
            case tokenTypes.saved:
                return this.reservedWord(node, scope);
            case tokenTypes.loop:
                return this.loopGroup(node, scope);
            case tokenTypes.func:
                return this.functionDeclaration(node, scope);
            default:
                throw new Error('Invalid Token Type.');
        }
    }

    terminal(node, scope) {
        return { value: node.value };
    }

    identifier(node, scope) {
        return scope.find(node.name);
    }

    // TODO: ternary
    ternaryOperation(node, scope) { }

    // TODO: unary
    unaryOperation(node, scope) { }

    // TODO: and
    andExpression(node, scope) { }

    // TODO: xor
    xorExpression(node, scope) { }

    // TODO: or
    orExpression(node, scope) { }

    // TODO: comparison
    comparison(node, scope) { }

    // TODO: declaration
    variableDeclaration(node, scope) {
        const declaration = scope.find(node.name);
        if (declaration !== undefined)
            throw new Error(`${node.name} is already defined.`);
        scope.add(node.name, this.evaluate(node.value, scope));
        return { value: true };
    }

    // TODO: assignment
    variableAssignment(node, scope) {
        const assignment = scope.find(node.name);
        if (assignment === undefined)
            throw new Error(`${node.name} is undefined.`);
        scope.reassign(node.name, this.evaluate(node.value, scope));
        return { value: true };
    }

    // TODO: parenthesis
    parenthesisGroup(node, scope) {
        return this.evaluate(node.value, scope);
    }

    functionInvocation(node, scope) {
        const func = scope.find(node.name);
        if (func === undefined)
            throw new Error(`Function ${node.name} is not defined.`);
        if (func.args.length !== node.args.length)
            throw new Error(`Argument Length does not match.`);
        if (func.type === tokenTypes.std) {
            const values = [];
            for (const arg of node.args)
                values.push(
                    arg.type === tokenTypes.id
                        ? scope.find(arg.name)
                        : this.evaluate(arg.value, scope)
                );
            const { value, type, ret } = func.value(...values);
            if (type !== undefined && type !== 'return')
                throw new Error(`Only return allowed in Functions.`);
            if (type === 'return')
                return { value: ret ? ret : value };
            else
                return { value };
        } else {
            const next = new Scope(scope);
            for (let i = 0; i < func.args.length; i++) {
                next.add(
                    func.args[i].text,
                    node.args[i].type === tokenTypes.id
                        ? scope.find(node.args[i].text)
                        : this.evaluate(node.args[i], scope)
                );
            }
            const { value, type, ret } = this.evaluate(func.value, next);
            if (type !== undefined && type !== 'return')
                throw new Error(`Only return allowed in Functions.`);
            if (type === 'return')
                return { value: ret ? ret : value };
            else
                return { value };
        }
    }

    blockGroup(node, scope) {
        const next = new Scope(scope);
        for (const statement of node.value) {
            const { value, type, ret } = this.evaluate(statement, next);
            if (type === 'return')
                return { value, type, ret };
            else if (type !== undefined)
                throw new Error(`Only return allowed in Functions.`);
        }
        return { value: true };
    }

    reservedWord(node, scope) {
        if (node.text === 'return')
            return {
                value: true, type: 'return',
                ret: node.value
                    ? this.evaluate(node.value, scope)
                    : undefined
            };
        if (node.text === 'continue')
            return { value: true, type: 'continue' };
        if (node.text === 'break')
            return { value: true, type: 'break' };
    }

    // TODO: loop
    loopGroup(node, scope) { }

    functionDeclaration(node, scope) {
        return node;
    }

}
