'use strict';

(() => {
    let //        forInStatementTypes = new Set(['ForInStatement', 'ForOfStatement', 'ForStatement']),
        functionExpressionTypes = new Set(['ArrowFunctionExpression', 'FunctionExpression']),
        visitor;

    function argMatch(outer, inner) {
        // 1. Create a new flat array to test the inner nodes against.
        // 2. Check if ANY (some) node.name in the inner array matches
        //    one in the new array of outer array's node names.
        return outer.map((node) => {
            return node.name;
        }).every((name) => {
            return inner.some((node) => {
                return name === node.name;
            });
        });
    }

    function checkBody(body) {
        let res = true,
            // TODO: ReturnStatement will be body.argument!
            expression = body.expression || body.argument,
            args = expression && expression.arguments;

        if (expression && expression.type !== 'CallExpression') {
            return false;
        }

        if (expression && args && args.length) {
            let args = expression.arguments;

            res = args.every((node) => {
                return node.type === 'Identifier';
            });
        }

        return res;
    }

    function checkExpression(wrappingNode) {
        let body = wrappingNode.body.body,
            firstBody = body[0],
            res = false;

        if (checkBody(firstBody)) {
            // TODO: ReturnStatement will be firstBody.argument!
            let f = firstBody.expression || firstBody.argument;

            if (body.length === 1 && f) {
                res = argMatch(wrappingNode.params, f.arguments);
            }
        }

        return res;
    }

    function getArrayElements(elements) {
        let arr = [];

        if (!elements.length) {
            return arr;
        }

        arr.push(this.getNodeValue(elements[0]));

        return arr.concat(getArrayElements.call(this, elements.slice(1)));
    }

    /*
    function isForStatementType(type) {
        return forInStatementTypes.has(type);
    }
    */

    function isFunctionExpressionType(type) {
        return functionExpressionTypes.has(type);
    }

    function makeForExpression(node, type) {
        // Return a joined array instead of just a tmplate string for
        // better control over formatting.
        return [
            `for (${this.getNodeValue(node.left)} ${type} ${this.getNodeValue(node.right)}) {`,
            this.getNodeValue(node.body),
            '}'
        ].join('');
    }

    function makeOperatorExpression(node) {
        return [
            visitor.getNodeValue(node.left),
            node.operator,
            visitor.getNodeValue(node.right)
        ];
    }

    function parseArguments(args) {
        let params = args.reduce((acc, curr) => {
                acc.push(this.getNodeValue(curr));

                return acc;
            }, []);


        // Return (foo, bar, quux)
        return `(${params.join(', ')})`;
    }

    visitor = {
        collect: (node, results) => {
            let expression = node.expression,
                type = node.type;

            if (type === 'ExpressionStatement') {
                let type = expression.type;

                if (type === 'CallExpression') {
                    let firstArg = expression.arguments[0];

                    if (firstArg && isFunctionExpressionType(firstArg.type) && checkExpression(firstArg)) {
                        results.push(expression);
                    }
                }
            } else if (type === 'ForInStatement') {
                results.push(node);
            } else if (type === 'ForOfStatement') {
                results.push(node);
            } else if (type === 'ForStatement') {
                results.push(node);
            } else if (type === 'VariableDeclaration') {
                let n = node.declarations[0],
                    init = n.init;

                if (init && init.type === 'FunctionExpression') {
                    let /* p1 = init.params.length,*/
                        p2 = init.body.body[0];

                    if (p2.type === 'ExpressionStatement') {
//                        if (p2.expression.arguments.length === p1) {
                            results.push(node);
//                        }
                    }
                }
            } else if (type === 'WhileStatement') {
                results.push(node);
            }
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

        getAssignmentExpression: (node) => {
            return [
                makeOperatorExpression(node).join(' ')
            ].join('');
        },

        getBinaryExpression: (node) => {
            return makeOperatorExpression(node).join(' ');
        },

        getBlockStatement: function (node) {
            return node.body.map((node) => {
                return this.getNodeValue(node);
            }).join('');
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
            let value = [];

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

        getIdentifier: (node) => {
            return node.name;
        },

        getLiteral: (node) => {
            return node.raw;
        },

        getLogicalExpression: (node) => {
            return makeOperatorExpression(node).join(' ');
        },

        getMemberExpression: function (node) {
            let nestedObj = node.object;

            while (nestedObj) {
                return this.getNodeValue(nestedObj) + this.getProperty(node);
            }
        },

        getNewExpression: function (node) {
            return `new ${this.getCallExpression(node)}`;
        },

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
                    value = visitor.getConditionalExpression(node);
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
                    value = visitor.getWhileStatement(node);
                    break;
            }

            return value;
        },

        getObjectExpression: function (node) {
            let props = node.properties;

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

        getParams: (params) => {
            let p = [];

            p.push(
                '(',
                params.map((arg) => {
                    return arg.name;
                }).join(', '),
                ')'
            );

            return p.join('');
        },

        getProperty: function (node) {
            let computed = node.computed;

            return `${(computed ? '[' : '.')}${this.getNodeValue(node.property)}${(computed ? ']' : '')}`;
        },

        getReturnStatement: function (node) {
            return `return ${this.getNodeValue(node.argument)}`;
        },

        getSequenceExpression: function (node) {
            let expressions = node.expressions,
                res = [];

            if (!expressions.length) {
                return res;
            }

            res.push(this.getNodeValue(expressions[0]));

            return res.concat(this.getNodeValue(expressions.slice(1)));
        },

        /*
        getTemplateLiteral: function (node) {
            // TODO
            return '`TODO: parse template strings`';
        },
        */

        getUnaryExpression: (() => {
            let needsPadding = new Set(['delete', 'instanceof', 'typeof']);

            return function (node) {
                let arg = node.argument,
                    // Pad the operator in cases where it's `delete`, `typeof`, etc.
                    operator = node.operator;

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
                let init = curr.init,
                    tpl = `${this.getNodeValue(curr.id)}`;

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
        },

        getPrinter: function () {
            return this.printer;
        },

        setPrinter: function (printer) {
            this.printer = printer;
        },

        visit: (() => {
            let blacklist = new Set(['comments', 'loc']);

            return function (object, results) {
                this.collect(object, results);

                for (let key of Object.keys(object)) {
                    if (!blacklist.has(key)) {
                        let obj = object[key];

                        if (typeof obj === 'object' && obj !== null) {
                            this.visit(obj, results);
                        }
                    }
                }

                return results;
            };
        })()
    };

    module.exports = Object.setPrototypeOf(visitor, null);
})();

