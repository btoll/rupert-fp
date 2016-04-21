/* eslint-disable no-case-declarations,one-var */
'use strict';

const isLoopStatement = (() => {
    const list = new Set([
        'ForStatement',
        'ForInStatement',
        'ForOfStatement',
        'DoWhileStatement',
        'WhileStatement'
    ]);

    return type => list.has(type);
})();

module.exports = {
    visit: function (node, parent, results) {
        const type = node.type;

        switch (type) {
            case 'ArrowFunctionExpression':
                const bodies = node.body.body;

                if (bodies && Array.isArray(bodies)) {
                    const type = bodies[0].type;

                    // We don't want to capture the node if it's a loop statement or IfStatement.
                    if (bodies.length === 1 && !(isLoopStatement(type) || type === 'IfStatement')) {
                        results.push({
                            node,
                            type: 'CombineArrowFunctionExpressions'
                        });
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
                } else if (node.callee) {
                    this.visit(node.callee, node, results);
                }
                break;

            case 'ExpressionStatement':
                this.visit(node.expression, node, results);
                break;

            // If it's a loop statement have the expression return the type
            // so it automatically matches the case.
            case isLoopStatement(type) && type:
                results.push({
                    node,
                    type: 'DontUseLoops'
                });
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

