# Rupert

[![Build Status](https://travis-ci.org/btoll/rupert.svg?branch=master)](https://travis-ci.org/btoll/rupert)

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

