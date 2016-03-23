/* eslint-disable no-console */
'use strict';

(() => {
    const visitor = require('../visitor'),
        jsBeautify = require('js-beautify').js_beautify;

    module.exports = {
        print: function (results) {
            // A Promise isn't strictly necessary here.
            return new Promise((resolve) => {
                const rows = [];

                for (const res in results) {
                    const entry = results[res],
                        loc = entry.loc;

                    rows.push(
                        `\n// Type ${entry.type}, Lines ${loc.start.line} - ${loc.end.line}:`,
                        `\n${visitor.getNodeValue(entry)}`
                    );
                }

                resolve(jsBeautify(rows.join('\n')));
            });
        }
    };
})();

