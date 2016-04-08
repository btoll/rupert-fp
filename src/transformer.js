'use strict';

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
                value = this.getArrayExpression(node);
                break;

            case 'ArrowFunctionExpression':
                value = this.getArrowFunctionExpression(node);
                break;

            case 'AssignmentExpression':
                value = this.getAssignmentExpression(node);
                break;

            case 'BinaryExpression':
                value = this.getBinaryExpression(node);
                break;

            case 'BlockStatement':
                value = this.getBlockStatement(node);
                break;

            case 'CallExpression':
                value = this.getCallExpression(node);
                break;

            case 'ConditionalExpression':
                value = transformer.getConditionalExpression(node);
                break;

            case 'ExpressionStatement':
                value = this.getExpressionStatement(node);
                break;

            case 'ForInStatement':
                value = this.getForInStatement(node);
                break;

            case 'ForOfStatement':
                value = this.getForOfStatement(node);
                break;

            case 'ForStatement':
                value = this.getForStatement(node);
                break;

            case 'FunctionExpression':
                value = this.getFunctionExpression(node);
                break;

            case 'Identifier':
                value = this.getIdentifier(node);
                break;

            case 'IfStatement':
                value = this.getIfStatement(node);
                break;

            case 'Literal':
                value = this.getLiteral(node);
                break;

            case 'LogicalExpression':
                value = this.getLogicalExpression(node);
                break;

            case 'MemberExpression':
                value = this.getMemberExpression(node);
                break;

            case 'NewExpression':
                value = this.getNewExpression(node);
                break;

            case 'ObjectExpression':
                value = this.getObjectExpression(node);
                break;

            case 'ReturnStatement':
                value = this.getReturnStatement(node);
                break;

            case 'SequenceExpression':
                value = this.getSequenceExpression(node);
                break;

            case 'TemplateLiteral':
                value = this.getTemplateLiteral(node);
                break;

            case 'ThisExpression':
                value = 'this';
                break;

            case 'UnaryExpression':
            case 'UpdateExpression':
                value = this.getUnaryExpression(node);
                break;

            case 'VariableDeclaration':
                value = this.getVariableDeclaration(node);
                break;

            case 'WhileStatement':
                value = transformer.getWhileStatement(node);
                break;
        }

        return value;
    },

    getArrayExpression: function (node) {
        return [
            '[',
            getArrayElements.call(this, node.elements).join(', '),
            ']'
        ].join('');
    },

    getArrowFunctionExpression: function (node) {
        return this.getFunctionExpression(node, true);
    },

    getAssignmentExpression: node => {
        return [
            makeOperatorExpression(node).join(' ')
        ].join('');
    },

    getBinaryExpression: node => makeOperatorExpression(node).join(' '),

    getBlockStatement: function (node) {
        return node.body.map(node => `${this.getNodeValue(node)} ;`).join('');
    },

    getCallExpression: function (node) {
        return this.getNodeValue(node.callee) + parseArguments.call(this, node.arguments);
    },

    getConditionalExpression: function (node) {
        return `(${this.getNodeValue(node.test)}) ?
            (${this.getNodeValue(node.consequent)}) :
            (${this.getNodeValue(node.alternate)})`;
    },

    getExpressionStatement: function (node) {
        return this.getNodeValue(node.expression);
    },

    getForInStatement: function (node) {
        return makeForExpression.call(this, node, 'in');
    },

    getForOfStatement: function (node) {
        return makeForExpression.call(this, node, 'of');
    },

    getForStatement: function (node) {
        // Return a joined array instead of just a tmplate string for better control over formatting.
        return [
            `for (${this.getNodeValue(node.init)}; ${this.getNodeValue(node.test)}; ${this.getNodeValue(node.update)}) {`,
            this.getNodeValue(node.body),
            '}'
        ].join('');
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

    getIdentifier: node => node.name,

    getIfStatement: function (node) {
        return `if (${this.getNodeValue(node.test)}) {
            ${this.getNodeValue(node.consequent)}
        }`;
    },

    getLiteral: node => node.raw,

    getLogicalExpression: node => makeOperatorExpression(node).join(' '),

    getMemberExpression: function (node) {
        const nestedObj = node.object;

        while (nestedObj) {
            return this.getNodeValue(nestedObj) + this.getProperty(node);
        }
    },

    getNewExpression: function (node) {
        return `new ${this.getCallExpression(node)}`;
    },

    getObjectExpression: function (node) {
        const props = node.properties;

        return !props.length ?
            '{}' :
            [
                '{',
                props.map(prop => {
                    return `${this.getNodeValue(prop.key)}: ${this.getNodeValue(prop.value)}`;
                }),
                '}'
            ].join('');
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

    getReturnStatement: function (node) {
        return `return ${this.getNodeValue(node.argument)}`;
    },

    getSequenceExpression: function (node) {
        const expressions = node.expressions,
            res = [];

        if (!expressions.length) {
            return res;
        }

        res.push(this.getNodeValue(expressions[0]));

        return res.concat(this.getNodeValue(expressions.slice(1)));
    },

    getTemplateLiteral: function () {
        // TODO
        return '`TODO: parse template strings`';
    },

    getUnaryExpression: (() => {
        const needsPadding = new Set(['delete', 'instanceof', 'typeof']);

        return function (node) {
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

            return node.name;
        };
    })(),

    getVariableDeclaration: function (node) {
        return `${node.kind} ${this.getVariableDeclarator(node.declarations)}`;
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
    },

    getWhileStatement: function (node) {
        // Return a joined array instead of just a tmplate string for
        // better control over formatting.
        return [
            `while (${this.getNodeValue(node.test)}) {`,
            `${this.getNodeValue(node.body)}`,
            '}'
        ].join('');
    }
};

module.exports = transformer;

