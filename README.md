# Rupert

[![Build Status](https://travis-ci.org/btoll/rupert.svg?branch=master)](https://travis-ci.org/btoll/rupert)

## How It Works

**Rupert** analyzes a data stream looking for the following 'types':
- FunctionNesting
- ImpureFunction
- NoLoops
- UnnecessaryBraces

By default, all of the types will be printed if found in the source code. However, this can be controlled through bitmasks.

## Flags and Bitmasks

    Flag | Value
    ---- | ----
    1 | FunctionNesting
    2 | ImpureFunction
    4 | NoLoops
    8 | UnnecessaryBraces

## Installation

`npm install https://github.com/btoll/rupert.git -g`

## Example

Dump the tree to `stdout`:

    rupert -f Filters.js

Create an `html` document of the same tree:

    rupert -f Filters.js --html

Redirect:

    rupert -f Filters.js --html > foo

Pipe:

    rupert -f Filters.js | tee foo

## Usage

    Property | Description
    ------------ | -------------
    -f, --file | The file to analyze
    --html | Creates an html document of the tree
    -h, --help | Show help

## License

[MIT](LICENSE)

## Author

Benjamin Toll

[Esprima]: http://esprima.org/

