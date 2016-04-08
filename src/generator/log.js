'use strict';

const chalk = require('chalk'),
    jsBeautify = require('js-beautify').js_beautify,
    transformer = require('../transformer');

module.exports = {
    print: function (results) {
        // A Promise isn't strictly necessary here.
        return new Promise((resolve) => {
            const rows = [];

            for (const res in results) {
                const entry = results[res],
                    loc = entry.loc;

                rows.push(
                    `\n${chalk.bgWhite.blue(`// Type ${chalk.bold(entry.type)}, Lines ${loc.start.line} - ${loc.end.line}:`)}`,
                    `\n${jsBeautify(transformer.getNodeValue(entry))}`
                );
            }

            resolve(rows.join('\n'));
        });
    }
};

