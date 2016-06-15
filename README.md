# Rupert

[![Build Status](https://travis-ci.org/btoll/rupert.svg?branch=master)](https://travis-ci.org/btoll/rupert)

**Rupert** is a JavaScript static code analysis tool and functional programming helper. Its aim is to aid in the transition of moving from an object-oriented programming paradigm to a more functional one.

## How It Works

**Rupert** analyzes a data stream for the following rules:

- FunctionNesting
- ImpureFunction
- NoLoops
- UnnecessaryBraces

By default, all of the nodes that match a rule will be collected and printed when found in the source code. However, this can be controlled through bit flags.

### FunctionNesting

Call expressions often are unnecessarily nested as in the example below. This is often seen in code structures that follow the callback pattern such as Promises.

The rule compares the `caller`'s params and the `callee`'s arguments and matches in the following scenarios:

- They are the same.
- The callee has the same identifier names in order but less of them than the caller.
- The callee has no function arguments.

Example:

    callback(function (data) {
        doSomething(data);
    });

This can be re-written as:

    callback(doSomething);

### ImpureFunction

A function that is pure contains no free variables.

Example:

    module.exports = {
        Identifier(node, parent) {
            if (bitmask & ImpureFunction) {
                captureManager.capture(node.name, (parent.type === 'VariableDeclaration'));
            }
        }
    };

This will match the `bitmask`, `ImpureFunction` and `captureManager` identifiers.

### NoLoops

Loops... don't use 'em! Matches:

- ForStatement
- ForInStatement
- ForOfStatement
- DoWhileStatement
- WhileStatement

Example:

    function double(nums) {
        for (let i = 0, len = nums.length; i < len; i++) {
            nums[i] *= 2;
        }

        return nums;
    }

    const nums = double([1, 2, 4]);

### UnnecessaryBraces

With the introduction of fat arrow functions, ES 2015 became a lot more expressive. Function bodies that contain a single expression can take advantage of the leaner syntax by dropping the curly braces.

Example:

    new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 1000);
    })
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.error(err);
    });

This can be re-written as:

    new Promise((resolve, reject) =>
        setTimeout(() => resolve('foo'), 1000)
    )
    .then(data => console.log(data))
    .catch(err => console.error(err));

Note that the callbacks suffer from the same unnecessary nesting as described in the `FunctionNesting` rule. To fix this, the sample could be even further simplified:

    new Promise((resolve, reject) =>
        setTimeout(() => resolve('foo'), 1000)
    )
    .then(console.log)
    .catch(console.error);

## Bit Flags and Bitmasks

Instead of requiring that each type to be captured is specified on the command line (which can get quite verbose), **Rupert** allows for setting a bitmask that is the sum of the bit flags of the desired rules to use to filter the source code.

In other words, just add the flags and use that number as the bitmask. This bitmask is then used to filter which nodes are printed. The default is 255, which will dump all nodes.

    Flag | Rule
    --- | ---
    1 | FunctionNesting
    2 | ImpureFunction
    4 | NoLoops
    8 | UnnecessaryBraces

## Installation

`npm install https://github.com/btoll/rupert.git -g`

## Usage

    Property | Description
    ------------ | -------------
    --bitmask, -b | The bitmask which determines the nodes to be captured
    --debug, -d | Turns on debug logging
    --html | Creates an html document of the analysis
    --target, -t | The target to analyze
    --verbose, -v | Show code snippets
    --help, -h | Show help

## Examples

Dump the tree to `stdout` (raw):

    rupert -t foo.js

Dump the tree to `stdout` (verbose, with code snippets that match the rules):

    rupert -t foo.js -v

Create an `html` document of the same tree (always verbose):

    rupert -t foo.js --html

Output only `ImpureFunction` and `NoLoops`:

    rupert -t foo.js --bitmask 6

Output only `FunctionNesting`, `NoLoops` and `UnnecessaryBraces`:

    rupert -t foo.js -b 13

The following are all the same (dumps all nodes matching any rule):

    rupert -t foo.js
    rupert -t foo.js -b 15
    rupert -t foo.js --bitmask 255

## License

[MIT](LICENSE)

## Author

Benjamin Toll

