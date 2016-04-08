/* eslint-disable no-case-declarations,one-var */
'use strict';

module.exports = {
    visit: function (node, parent, results) {
        switch (node.type) {
            case 'ArrowFunctionExpression':
                const bodies = node.body.body;

                if (bodies) {
                    if (bodies.length === 1) {
                        results.push(parent);
                    } else {
                        bodies.forEach(body => this.visit(body, parent, results));
                    }
                }
                break;

            case 'AssignmentExpression':
                this.visit(node.right, node, results);
                break;

            case 'CallExpression':
                // TODO
                const callArgs = node.arguments;

                if (callArgs.length) {
                    callArgs.forEach(arg => this.visit(arg, node, results));
                } else if (node.callee.type === 'ArrowFunctionExpression') {
                    this.visit(node.callee, node, results);
                }
                break;

            case 'ExpressionStatement':
                this.visit(node.expression, node, results);
                break;

            case 'ForStatement':
            case 'ForInStatement':
            case 'ForOfStatement':
            case 'WhileStatement':
                results.push(node);
                break;

            case 'FunctionExpression':
                // TODO
                node.body.body.forEach(body => this.visit(body, parent, results));
                break;

            case 'Program':
                node.body.forEach(node => this.visit(node, parent, results));
                return results;

            case 'ReturnStatement':
                const returnArgs = node.argument.arguments;

                if (returnArgs) {
                    returnArgs.forEach(arg => this.visit(arg, parent, results));
                }
                break;

            case 'VariableDeclaration':
                this.visit(node.declarations[0].init, node, results);
                break;
        }
    }
};

