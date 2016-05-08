# Rupert

[![Build Status](https://travis-ci.org/btoll/rupert.svg?branch=master)](https://travis-ci.org/btoll/rupert)

## How It Works

**Rupert** analyzes a data stream looking for the following 'types':
- FunctionNesting
- ImpureFunction
- NoLoops
- UnnecessaryBraces

By default, all of the types will be collected and printed when found in the source code. However, this can be controlled through bit flags.

## Bit Flags and Bitmasks

Instead of requiring that each type to be captured is specified on the command line (which could get quite verbose), **Rupert** allows for setting a bit flag that is the sum of the desired types to be output.

The specified flag then becomes the bitmask against which each type is checked.

Output only `ImpureFunction` and `NoLoops`:

    rupert -f foo.js --flags 6

Output only `FunctionNesting`, `NoLoops` and `UnnecessaryBraces`:

    rupert -f foo.js --flags 13

The default bit flag is 255.

    Flag | Type
    --- | ---
    1 | FunctionNesting
    2 | ImpureFunction
    4 | NoLoops
    8 | UnnecessaryBraces

## Installation

`npm install https://github.com/btoll/rupert.git -g`

## Examples

Dump the tree to `stdout`:

    rupert -f Filters.js

Create an `html` document of the same tree:

    rupert -f Filters.js --html

## Usage

    Property | Description
    ------------ | -------------
    --debug, -d | Turns on debug logging
    --file, -f | The file to analyze
    --flags | Specifies which types are captured
    --html | Creates an html document of the analysis
    --verbose, -v | Shows code snippets
    --help, -h | Show help

## License

[MIT](LICENSE)

## Author

Benjamin Toll

[Esprima]: http://esprima.org/

