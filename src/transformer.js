/* eslint-disable no-case-declarations,one-var */
'use strict';

const needsPadding = new Set(['delete', 'instanceof', 'typeof']);

function getArrayElements(elements) {
    const arr = [];

    if (!elements.length) {
        return arr;
    }

    arr.push(this.getNodeValue(elements[0]));

    return arr.concat(getArrayElements.call(this, elements.slice(1)));
}

function makeForExpression(node, type) {
    // Return a joined array instead of just a template string for
    // better control over formatting.
    return [
        `for (${this.getNodeValue(node.left)} ${type} ${this.getNodeValue(node.right)}) {`,
        this.getNodeValue(node.body),
        '}'
    ].join('');
}

function makeOperatorExpression(node) {
    return [
        transformer.getNodeValue(node.left),
        node.operator,
        transformer.getNodeValue(node.right)
    ];
}

function parseArguments(args) {
    const params = args.reduce((acc, curr) => {
            acc.push(this.getNodeValue(curr));

            return acc;
        }, []);


    // Return (foo, bar, quux)
    return `(${params.join(', ')})`;
}

const transformer = {
    getNodeValue: function (node) {
        let value;

        // Satisfy null cases.
        if (!node) {
            return '';
        }

        switch (node.type) {
            case 'ArrayExpression':
                value = [
                    '[',
                    getArrayElements.call(this, node.elements).join(', '),
                    ']'
                ].join('');
                break;

            case 'ArrowFunctionExpression':
                value = this.getFunctionExpression(node, true);
                break;

            case 'AssignmentExpression':
                value = [
                    makeOperatorExpression(node).join(' ')
                ].join('');
                break;

            case 'BinaryExpression':
                value = makeOperatorExpression(node).join(' ');
                break;

            case 'BlockStatement':
                value = node.body.map(node => `${this.getNodeValue(node)} ;`).join('');
                break;

            case 'CallExpression':
                value = this.getCallExpression(node);
                break;

            case 'ConditionalExpression':
                value = `(${this.getNodeValue(node.test)}) ?
                    (${this.getNodeValue(node.consequent)}) :
                    (${this.getNodeValue(node.alternate)})`;
                break;

            case 'ExpressionStatement':
                value = this.getNodeValue(node.expression);
                break;

            case 'ForInStatement':
                value = makeForExpression.call(this, node, 'in');
                break;

            case 'ForOfStatement':
                value = makeForExpression.call(this, node, 'of');
                break;

            case 'ForStatement':
                // Return a joined array instead of just a tmplate string for better control over formatting.
                value = [
                    `for (${this.getNodeValue(node.init)}; ${this.getNodeValue(node.test)}; ${this.getNodeValue(node.update)}) {`,
                    this.getNodeValue(node.body),
                    '}'
                ].join('');
                break;

            case 'FunctionExpression':
                value = this.getFunctionExpression(node);
                break;

            case 'Identifier':
                value = node.name;
                break;

            case 'IfStatement':
                value = `if (${this.getNodeValue(node.test)}) {
                    ${this.getNodeValue(node.consequent)}
                }`;
                break;

            case 'Literal':
                value = node.raw;
                break;

            case 'LogicalExpression':
                value = makeOperatorExpression(node).join(' ');
                break;

            case 'MemberExpression':
                const nestedObj = node.object;

                // TODO
//                while (nestedObj) {
                    value = this.getNodeValue(nestedObj) + this.getProperty(node);
//                }
                break;

            case 'NewExpression':
                value = `new ${this.getCallExpression(node)}`;
                break;

            case 'ObjectExpression':
                const props = node.properties;

                value = !props.length ?
                    '{}' :
                    [
                        '{',
                        props.map(prop => {
                            return `${this.getNodeValue(prop.key)}: ${this.getNodeValue(prop.value)}`;
                        }),
                        '}'
                    ].join('');
                break;

            case 'ReturnStatement':
                value = `return ${this.getNodeValue(node.argument)}`;
                break;

            case 'SequenceExpression':
                const expressions = node.expressions,
                    res = [];

                if (!expressions.length) {
                    return res;
                }

                res.push(this.getNodeValue(expressions[0]));

                value = res.concat(this.getNodeValue(expressions.slice(1)));
                break;

            case 'TemplateLiteral':
                // TODO
                value = '`TODO: parse template strings`';
                break;

            case 'ThisExpression':
                value = 'this';
                break;

            case 'UnaryExpression':
            case 'UpdateExpression':
                const arg = node.argument;
                // Pad the operator in cases where it's `delete`, `typeof`, etc.
                let operator = node.operator;

                if (needsPadding.has(operator)) {
                    operator = ` ${operator} `;
                }

                while (arg) {
                    return (node.prefix) ?
                        operator + this.getNodeValue(arg) :
                        this.getNodeValue(arg) + operator;
                }

                value = node.name;
                break;

            case 'VariableDeclaration':
                value = `${node.kind} ${this.getVariableDeclarator(node.declarations)}`;
                break;

            case 'WhileStatement':
                // Return a joined array instead of just a tmplate string for
                // better control over formatting.
                value = [
                    `while (${this.getNodeValue(node.test)}) {`,
                    `${this.getNodeValue(node.body)}`,
                    '}'
                ].join('');
                break;
        }

        return value;
    },

    getCallExpression: function (node) {
        return this.getNodeValue(node.callee) + parseArguments.call(this, node.arguments);
    },

    getConditionalExpression: function (node) {
        return `(${this.getNodeValue(node.test)}) ?
            (${this.getNodeValue(node.consequent)}) :
            (${this.getNodeValue(node.alternate)})`;
    },

    getFunctionExpression: function (node, isArrowFunction) {
        const value = [];

        // Note if not arrow function make sure to wrap params in parens.
        value.push(
            `${!isArrowFunction ? 'function ' : ''}`,
            this.getParams(node.params),
            `${!isArrowFunction ? '' : ' => '} {`,
            this.getNodeValue(node.body),
            '}'
        );

        return value.join('');
    },

    getParams: params => {
        const p = [];

        p.push(
            '(',
            params.map(arg => arg.name).join(', '),
            ')'
        );

        return p.join('');
    },

    getProperty: function (node) {
        const computed = node.computed;

        return `${(computed ? '[' : '.')}${this.getNodeValue(node.property)}${(computed ? ']' : '')}`;
    },

    getVariableDeclarator: function (nodes) {
        return nodes.reduce((acc, curr) => {
            const init = curr.init;
            let tpl = `${this.getNodeValue(curr.id)}`;

            if (init) {
                tpl += ` = ${this.getNodeValue(init)}`;
            }

            acc.push(tpl);

            return acc;
        }, []).join(', ');
    }
};

module.exports = transformer;

