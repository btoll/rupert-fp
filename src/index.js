'use strict';

(() => {
    const esprima = require('esprima'),
        visitor = require('./lib/visitor'),
        fs = require('fs');

    function getSuite(file, isData) {
        return new Promise((resolve, reject) => {
            if (isData) {
                resolve(file);
            } else {
                fs.readFile(file, 'utf8', (err, fileContents) => {
                    if (err) {
                        reject('There was a problem processing the file.');
                    } else {
                        resolve(fileContents);
                    }
                });
            }
        });
    }

    function makeTree(file, printer, isData) {
        if (!file) {
            throw new Error('Rupert: No file given');
        }

        if (!printer) {
            throw new Error('Rupert: No printer given');
        }

        return getSuite(file, isData)
        .then(suite => {
            const contents = visitTree(suite);

            return !contents.length ?
                'No results found' :
                printer.print(contents);
        });
    }

    function visitTree(suite) {
        return visitor.visit(esprima.parse(suite, {
            loc: true
        }), []);
    }

    module.exports = makeTree;
})();

