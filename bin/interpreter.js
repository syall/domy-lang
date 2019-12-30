import { tokenTypes, Scope } from './utils.js';

export default class DomyInterpreter {

    constructor() {
        this.global = new Scope(null);
        this.global.add('print', {
            type: tokenTypes.std,
            args: ['toPrint'],
            value: arg => {
                console.log(JSON.stringify(
                    arg.type === tokenTypes.func
                        ? arg
                        : arg.value,
                    [
                        'name', 'text', 'type', 'args',
                        'value', 'cond', 'left', 'right'
                    ],
                    2
                ));
                return { value: true };
            }
        });
    }

    run(tree) {
        for (const statement of tree)
            this.evaluate(statement, this.global);
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

    ternaryOperation(node, scope) {
        if (node.left.type === tokenTypes.saved)
            throw new Error('Reserved words not allowed in condition');
        const cond = this.evaluate(node.cond, scope);
        const { value, type, ret } = this.evaluate(
            cond.value
                ? node.left
                : node.right,
            scope
        );
        return { value: ret || value, type };
    }

    unaryOperation(node, scope) {
        if (node.value.type === tokenTypes.saved)
            throw new Error('Reserved words only allowed in blocks');
        return {
            value:
                !(node.value.type === tokenTypes.block
                    ? this.validate(this.evaluate(node.value, scope)).value
                    : this.evaluate(node.value, scope).value)
        };
    }

    andExpression(node, scope) {
        const left = this.evaluate(node.left, scope);
        if (!left.value)
            return { value: left.value, type: left.type, ret: left.ret };
        const right = this.evaluate(node.right, scope);
        const value = right.ret === undefined
            ? left.value && right.value
            : left.value && right.ret;
        return { value, type: right.type };
    }

    xorExpression(node, scope) {
        const left = this.evaluate(node.left, scope);
        if (left.type)
            return { value: left.value, type: left.type, ret: left.ret };
        const right = this.evaluate(node.right, scope);
        const value = right.ret === undefined
            ? (left.value && !right.value) || (!left.value && right.value)
            : (left.value && !right.ret) || (!left.value && right.ret);
        return { value, type: right.type };
    }

    orExpression(node, scope) {
        const left = this.evaluate(node.left, scope);
        if (left.value || left.type)
            return { value: left.value, type: left.type, ret: left.ret };
        const right = this.evaluate(node.right, scope);
        return { value: right.ret || right.value, type: right.type };
    }

    comparison(node, scope) {
        if (node.left.type === tokenTypes.saved ||
            node.right.type === tokenTypes.saved)
            throw new Error('Reserved words only allowed in blocks');
        if (node.value === '==') return {
            value:
                (node.left.type === tokenTypes.block
                    ? this.validate(this.evaluate(node.left, scope)).value
                    : this.evaluate(node.left, scope).value) ===
                (node.right.type === tokenTypes.block
                    ? this.validate(this.evaluate(node.right, scope)).value
                    : this.evaluate(node.right, scope).value)
        };
        else return {
            value:
                (node.left.type === tokenTypes.block
                    ? this.validate(this.evaluate(node.left, scope)).value
                    : this.evaluate(node.left, scope).value) !==
                (node.right.type === tokenTypes.block
                    ? this.validate(this.evaluate(node.right, scope)).value
                    : this.evaluate(node.right, scope).value)
        };
    }

    variableDeclaration(node, scope) {
        if (node.value.type === tokenTypes.saved)
            throw new Error('Reserved words only allowed in blocks');
        const declaration = scope.find(node.name);
        if (declaration !== undefined)
            throw new Error(`${node.name} is already defined.`);
        scope.add(
            node.name,
            node.value.type === tokenTypes.block
                ? this.validate(this.evaluate(node.value, scope))
                : this.evaluate(node.value, scope)
        );
        return { value: true };
    }

    variableAssignment(node, scope) {
        if (node.value.type === tokenTypes.saved)
            throw new Error('Reserved words only allowed in blocks');
        const assignment = scope.find(node.name);
        if (assignment === undefined)
            throw new Error(`${node.name} is undefined.`);
        scope.reassign(
            node.name,
            node.value.type === tokenTypes.block
                ? this.validate(this.evaluate(node.value, scope))
                : this.evaluate(node.value, scope)
        );
        return { value: true };
    }

    validate(v) {
        const { value, type, ret } = v;
        if (type === 'return' && ret !== undefined)
            return ret;
        else if (type !== undefined)
            throw new Error(`Invalid type: ${type}.`);
        else
            return { value };
    }

    parenthesisGroup(node, scope) {
        if (node.value.type === tokenTypes.saved)
            throw new Error('Reserved words only allowed in blocks');
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
            for (const arg of node.args) {
                values.push(
                    arg.type === tokenTypes.id
                        ? scope.find(arg.name)
                        : arg.type === tokenTypes.block
                            ? this.validate(this.evaluate(arg.value, scope))
                            : this.evaluate(
                                arg.value !== undefined
                                    ? arg.value
                                    : arg,
                                scope)
                );
            }
            return this.validate(func.value(...values));
        } else {
            const next = new Scope(scope);
            for (let i = 0; i < func.args.length; i++) {
                next.add(
                    func.args[i].text,
                    node.args[i].type === tokenTypes.id
                        ? scope.find(node.args[i].text)
                        : node.args[i].type === tokenTypes.block
                            ? this.validate(this.evaluate(node.args[i], scope))
                            : this.evaluate(node.args[i], scope)
                );
            }
            return this.validate(this.evaluate(func.value, next));
        }
    }

    blockGroup(node, scope) {
        const next = new Scope(scope);
        for (const statement of node.value) {
            const { value, type, ret } = this.evaluate(statement, next);
            if (type !== undefined)
                return { value, type, ret };
        }
        return { value: true };
    }

    reservedWord(node, scope) {
        if (node.text === 'return')
            return {
                value: true, type: 'return',
                ret:
                    node.value !== undefined
                        ? node.value.type === tokenTypes.block
                            ? this.validate(this.evaluate(node.value, scope))
                            : this.evaluate(node.value, scope)
                        : undefined
            };
        if (node.text === 'continue')
            return { value: true, type: 'continue' };
        if (node.text === 'break')
            return { value: true, type: 'break' };
    }

    loopGroup(node, scope) {
        if (node.cond.type === tokenTypes.saved)
            throw new Error('Reserved words only allowed in blocks');
        while (true) {
            const cond = node.cond.type === tokenTypes.block
                ? this.validate(this.evaluate(node.cond, scope))
                : this.evaluate(node.cond, scope);
            if (!cond.value)
                break;
            const next = new Scope(scope);
            const { value, type, ret } = this.evaluate(node.value, next);
            if (type === 'return')
                return { value: ret !== undefined ? ret : value };
            if (type === 'break')
                break;
            if (type === 'continue')
                continue;
        }
        return { value: true };
    }

    functionDeclaration(node, scope) {
        return node;
    }

}
