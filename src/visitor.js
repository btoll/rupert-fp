/* eslint-disable no-case-declarations,one-var */
'use strict';

module.exports = {
    visit: function (node, parent, results) {
        switch (node.type) {
            case 'ArrowFunctionExpression':
                const bodies = node.body.body;

                if (bodies) {
                    if (bodies.length === 1) {
//                        results.push(parent);
                        results.push(node);
                    } else {
                        bodies.forEach(node => this.visit(node, parent, results));
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
                    callArgs.forEach(node => this.visit(node, node, results));
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
                node.body.body.forEach(node => this.visit(node, parent, results));
                break;

            case 'ObjectExpression':
                node.properties.forEach(node => this.visit(node, parent, results));
                return results;

            case 'Program':
                node.body.forEach(node => this.visit(node, parent, results));
                return results;

            case 'Property':
                this.visit(node.value, parent, results);
                return results;

            case 'ReturnStatement':
                const returnArgs = node.argument.arguments;

                if (returnArgs) {
                    returnArgs.forEach(node => this.visit(node, parent, results));
                }
                break;

            case 'VariableDeclarator':
                if (node.init) {
                    this.visit(node.init, parent, results);
                }
                break;

            case 'VariableDeclaration':
                node.declarations.forEach(node => this.visit(node, parent, results));
                break;
        }
    }
};

