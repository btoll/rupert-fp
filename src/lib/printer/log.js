/* eslint-disable no-console */

(() => {
    'use strict';

    let visitor = require('../visitor'),
        getTabs = (indent) => {
            let tabs = '';

            while (indent) {
                return getTabs(--indent) + '\t';
            }

            return tabs;
        },
        rows = [];

    module.exports = {
        print: function (results) {
            // A Promise isn't strictly necessary here.
            return new Promise((resolve) => {
                for (let res in results) {
                    let entry = results[res],
                        loc = entry.loc;

                    rows.push(
                        '\n<|====================================|>\n',
                        `Type ${entry.type}, Lines ${loc.start.line} - ${loc.end.line}:\n\n${visitor.getNodeValue(entry)}`
                    );
                }

                resolve(rows.join('\n'));
            });
        },

        captureRow: function (name, type) {
            // TODO: Does this need to be optimized?
            rows.push(`${getTabs(this.indent)}${type === 'it' ? 'it ->' : '(describe)'} ${name}`);
        },

        prettyPrint: function (node) {
            return `\n\t${node}`;
        }
    };
})();

