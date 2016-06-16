'use strict';

let bitmask;

const FunctionNesting = 1;
const ImpureFunction = 2;
const NoLoops = 4;
const UnnecessaryBraces = 8;

const list = new Set([
    'ForStatement',
    'ForInStatement',
    'ForOfStatement',
    'DoWhileStatement',
    'WhileStatement'
]);

const captureManager = (() => {
    const stack = [];

    return {
        init(params) {
            const map = mapParams(params);

            stack.push({
                bound: new Set(),
                free: new Set(),
                params: map ?
                    new Set(map.split(',').reduce((acc, curr) => {
                        acc.push(curr);
                        return acc;
                    }, [])) :
                new Set()
            });
        },
        capture(v, isDeclared) {
            if (v === null) {
                return stack.pop();
            } else {
                // Always be in capture mode if there are any contexts on the stack.
                if (stack.length) {
                    const ctx = stack.pop();

                    // If declared in the function body immediately add to bound list.
                    // Else if not in the params list or bound list add to free list.
                    if (isDeclared) {
                        ctx.bound.add(v);
                    } else if (!(ctx.params.has(v) || ctx.bound.has(v))) {
                        ctx.free.add(v);
                    }

                    stack.push(ctx);
                }
            }
        }
    };
})();

const checkCallExpression = (parent, node, results) => {
    if (bitmask & FunctionNesting) {
        if (node.type === 'CallExpression' && compareSignature(parent, node)) {
            results.push({
                node: parent,
                type: 'FunctionNesting'
            });
        }
    }
};

const checkFunctionExpression = function (node, parent, results) {
    const bodies = node.body.body;
    const impureFunctionFlag = !!(bitmask & ImpureFunction);

    if (impureFunctionFlag) {
        captureManager.init(node.params);
    }

    if (bodies && bodies.length && Array.isArray(bodies)) {
        const firstBody = bodies[0],
            type = firstBody.type;

        if (bodies.length === 1) {
            if (bitmask & UnnecessaryBraces) {
                if (!(
                    isLoopStatement(type) ||
                    isObjectExpression(firstBody.argument) ||
                    type === 'IfStatement'
                )) {
                    results.push({
                        node,
                        type: 'UnnecessaryBraces'
                    });
                }
            }

            if (firstBody.expression) {
                checkCallExpression(node, firstBody.expression, results);
            }
        }

        bodies.forEach(body => this.visit(body, node, results));
    } else if (node.body) {
        checkCallExpression(node, node.body, results);
        this.visit(node.body, node, results);
    }

    // TODO: DRY!
    if (impureFunctionFlag) {
        const ctx = captureManager.capture(null);
        if (ctx.free.size) {
            results.push({
                node,
                type: 'ImpureFunction',
                desc: `Free variables: ${Array.from(ctx.free.values()).join(', ')}`
            });
        }
    }
};

const checkLoop = (node, parent, results) => {
    if (bitmask & NoLoops) {
        results.push({
            node,
            type: 'NoLoops'
        });
    }
};

const compareSignature = (caller, callee) => {
    const args = callee.arguments;

    // Note that we can't compare non-Identifiers in the callee, i.e.:
    //
    //      callee([1, 2, 4]);
    //
    // Always first make sure that we'd only ever be comparing Identifiers.
    return args.every(arg => arg.type === 'Identifier') ?
        mapParams(caller.params).indexOf(mapParams(args)) === 0 :
        false;
};

const mapParams = params =>
    params.map(arg => arg.name).join(',');

const isLoopStatement = type => list.has(type);

// An ObjectExpression cannot be a candidate for an UnnecessaryBrace type b/c the interpreter determines
// that a brace following a fat arrow function is a block. In other words, it is not able to accurately
// determine if the brace signifies the beginning of a block or an ObjectExpression.
const isObjectExpression = node => node && node.type === 'ObjectExpression';

module.exports = {
    ArrowFunctionExpression: checkFunctionExpression,
    FunctionExpression: checkFunctionExpression,

    FunctionDeclaration(node, parent, results) {
        const impureFunctionFlag = !!(bitmask & ImpureFunction);

        if (impureFunctionFlag) {
            captureManager.init(node.params);
        }

        node.body.body.forEach(body => this.visit(body, node, results));

        // TODO: DRY!
        if (impureFunctionFlag) {
            const ctx = captureManager.capture(null);
            if (ctx.free.size) {
                results.push({
                    node,
                    type: 'ImpureFunction',
                    desc: `Free variables: ${Array.from(ctx.free.values()).join(', ')}`
                });
            }
        }
    },

    ForStatement: checkLoop,
    ForInStatement: checkLoop,
    ForOfStatement: checkLoop,
    DoWhileStatement: checkLoop,
    WhileStatement: checkLoop,

    Identifier(node, parent) {
        if (bitmask & ImpureFunction) {
            captureManager.capture(node.name, (parent.type === 'VariableDeclaration'));
        }
    },

    ThisExpression() {
        captureManager.capture('this');
    },

    // TODO: This isn't a node type!
    setBitmask(b) {
        bitmask = b;
    }
};

