/* eslint-disable no-console */
(() => {
    'use strict';

    let esprima = require('esprima'),
        visitor = require('./visitor');

    function* generateTree(file, printer) {
        let contents = yield visitTree(file, printer);
        yield printer.init(contents, file);
    }

    function makeTree(file, printer) {
        // TODO: Need a generator/Promise pattern here.
        let it = generateTree(file, printer);

        it.next().value.then(function (results) {
            it.next(results).value
                .then(console.log)
                .catch(console.log);
        });
    }

    function visitTree(file, printer) {
        return new Promise((resolve, reject) => {
            console.log('Just a moment while we analyze your file...');

            require('fs').readFile(file, 'utf8', (err, fileContents) => {
                if (err) {
                    reject('[ERROR] There was a problem processing the file');
                } else {
                    visitor.setPrinter(printer);
                    resolve(visitor.visit(esprima.parse(fileContents, {
                        loc: true
                    }), []));
                }
            });
        });
    }

    module.exports = makeTree;
})();

