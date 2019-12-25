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

    ternaryOperation(node, scope) { }

    unaryOperation(node, scope) { }

    andExpression(node, scope) { }

    xorExpression(node, scope) { }

    orExpression(node, scope) { }

    comparison(node, scope) { }

    variableDeclaration(node, scope) {
        const declaration = scope.find(node.name);
        if (declaration !== undefined)
            throw new Error(`${node.name} is already defined.`);
        scope.add(node.name, this.evaluate(node.value, scope));
        return { value: true };
    }

    variableAssignment(node, scope) {
        const assignment = scope.find(node.name);
        if (assignment === undefined)
            throw new Error(`${node.name} is undefined.`);
        scope.reassign(node.name, this.evaluate(node.value, scope));
        return { value: true };
    }

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
            const { value, type } = func.value(...values);
            if (type !== 'return')
                throw new Error(`Only return allowed in Functions.`);
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
            const { value, type } = this.evaluate(func.value, next);
            if (type !== undefined && type !== 'return')
                throw new Error(`Only return allowed in Functions.`);
            return { value };
        }
    }

    blockGroup(node, scope) {
        const next = new Scope(scope);
        for (const statement of node.value) {
            const { value, type } = this.evaluate(statement, next);
            if (type === 'return')
                return { value };
            else if (type !== undefined)
                throw new Error(`Only return allowed in Functions.`);
        }
        return { value: true };
    }

    reservedWord(node, scope) { }

    loopGroup(node, scope) { }

    functionDeclaration(node, scope) {
        return node;
    }

}
