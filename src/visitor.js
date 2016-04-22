'use strict';

const list = new Set([
    'ForStatement',
    'ForInStatement',
    'ForOfStatement',
    'DoWhileStatement',
    'WhileStatement'
]);

const isLoopStatement = type => list.has(type);

const capture = (node, results) =>
    results.push({
        node,
        type: 'DontUseLoops'
    });

module.exports = {
    ArrowFunctionExpression(node, parent, results) {
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
    },
    // TODO: Clean this up.
    ForStatement: (node, parent, results) => capture(node, results),
    ForInStatement: (node, parent, results) => capture(node, results),
    ForOfStatement: (node, parent, results) => capture(node, results),
    DoWhileStatement: (node, parent, results) => capture(node, results),
    WhileStatement: (node, parent, results) => capture(node, results)
};

