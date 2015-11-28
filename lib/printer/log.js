/* eslint-disable no-console */

(() => {
    'use strict';

    let visitor = require('../visitor');

    let getTabs = (indent) => {
        let tabs = '';

        while (indent) {
            return getTabs(--indent) + '\t';
        }

        return tabs;
    },
    rows = [];

    module.exports = Object.setPrototypeOf({
        init: function (results) {
            // A Promise isn't strictly necessary here.
            return new Promise((resolve) => {
                let rows = [];

                this.print(results, rows);
                resolve(rows.join('\n'));
            });
        },

        captureRow: function (name, type) {
            // TODO: Does this need to be optimized?
            rows.push(`${getTabs(this.indent)}${type === 'it' ? 'it ->' : '(describe)'} ${name}`);
        },

        prettyPrint: function (node) {
            return `\n\t${node}`;
        },

        print: function (results, buf) {
            for (let res in results) {
                let entry = results[res],
                    loc = entry.loc;

                buf.push(
                    '\n<|====================================|>\n',
                    `Type ${entry.type}, Lines ${loc.start.line} - ${loc.end.line}:\n\n${visitor.getNodeValue(entry)}`);
            }
        }
    }, null);
})();

