# Rupert

[![Build Status](https://travis-ci.org/btoll/rupert.svg?branch=master)](https://travis-ci.org/btoll/rupert)

**Rupert** is a JavaScript static code analysis tool and functional programming helper. Its aim is to aid in the transition of moving from an OOP paradigm to a more functional one.

## How It Works

**Rupert** analyzes a data stream for the following rules:
- FunctionNesting
- ImpureFunction
- NoLoops
- UnnecessaryBraces

### FunctionNesting
### ImpureFunction
### NoLoops
### UnnecessaryBraces

By default, all of the nodes that match a rule will be collected and printed when found in the source code. However, this can be controlled through bit flags.

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
    --file, -f | The file to analyze
    --html | Creates an html document of the analysis
    --verbose, -v | Show code snippets
    --help, -h | Show help

## Examples

Dump the tree to `stdout` (raw):

    rupert -f foo.js

Dump the tree to `stdout` (verbose, with code snippets that match the rules):

    rupert -f foo.js -v

Create an `html` document of the same tree (always verbose):

    rupert -f foo.js --html

Output only `ImpureFunction` and `NoLoops`:

    rupert -f foo.js --bitmask 6

Output only `FunctionNesting`, `NoLoops` and `UnnecessaryBraces`:

    rupert -f foo.js -b 13

The following are all the same (dumps all nodes matching any rule):

    rupert -f foo.js
    rupert -f foo.js -b 15
    rupert -f foo.js --bitmask 255

## License

[MIT](LICENSE)

## Author

Benjamin Toll

[Esprima]: http://esprima.org/

