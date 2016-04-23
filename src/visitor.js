'use strict';

const list = new Set([
    'ForStatement',
    'ForInStatement',
    'ForOfStatement',
    'DoWhileStatement',
    'WhileStatement'
]);

const isLoopStatement = type => list.has(type);

const capture = (node, parent, results) =>
    results.push({
        node,
        type: 'DontUseLoops'
    });

const compareParams = (caller, callee) =>
    getParams(caller.params).indexOf(getParams(callee.arguments || callee.params)) === 0;

const getParams = params =>
    params.map(arg => arg.name).join(', ');

module.exports = {
    ArrowFunctionExpression(node, parent, results) {
        const bodies = node.body.body;

        if (bodies && Array.isArray(bodies)) {
            const type = bodies[0].type;

            // We don't want to capture the node if it's a loop statement or IfStatement.
            if (bodies.length === 1 && !(isLoopStatement(type) || type === 'IfStatement')) {
                results.push({
                    node: parent,
                    type: 'UnnecessaryBraces'
                });
            }

            bodies.forEach(body => this.visit(body, node, results));
        } else {
            this.visit(node.body, node, results);
        }
    },

    CallExpression(node, parent, results) {
        const body = parent.body.body;

        if (body && body.length === 1 && compareParams(parent, node)) {
            results.push({
                node: parent,
                type: 'UnnecessaryFunctionNesting'
            });
        }

        // TODO
        const callArgs = node.arguments;

        if (callArgs.length) {
            callArgs.forEach(node => this.visit(node, node, results));
        } else if (node.callee) {
            this.visit(node.callee, node, results);
        }
    },

    ForStatement: capture,
    ForInStatement: capture,
    ForOfStatement: capture,
    DoWhileStatement: capture,
    WhileStatement: capture
};

