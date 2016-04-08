'use strict';

const transformer = require('../transformer');

module.exports = Object.setPrototypeOf({
    init: function (results, file) {
        return new Promise((resolve, reject) => {
            const tpl = this.makeTpl(file, this.print(results, []));

            require('fs').writeFile(`${require('path').basename(file)}_.html`, tpl, 'utf8', (err) => {
                if (err) {
                    reject('[ERROR] Oh no, something went wrong!');
                } else {
                    resolve(`Functional pattern analysis of ${file} completed successfully.`);
                }
            });
        });
    },

    makeTpl: (file, results) => {
        return `<!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <style>
            * {
                margin: 0;
                padding: 0;
            }

            div {
                background: #207ab2;
                color: #eab560;
                font-family: monospace;
                margin: 0 40px;
                padding: 10px 10px 10px 50px;
            }

            div span {
                display: block;
                padding-left: 40px;
            }

            p.lines {
                background: #ddd;
                border: 1px solid #000;
                margin: 10px;
                padding: 10px;
            }

            p.lines span {
                font-weight: bold;
            }
            </style>
            </head>

            <body>
                <h3>Functional pattern analysis of file ${file}</h3>
                ${results}
            </body>
            </html>
        `;
    },

    prettyPrint: function (node) {
        return `<span>${node}`;
    },

    print: function (results, buf) {
        for (const entry of results) {
            const loc = entry.loc;

            buf.push(
               `<p class="lines">Type <span>${entry.type}</span>, Lines ${loc.start.line} - ${loc.end.line}</p>
                <div>
                    <p>${transformer.getNodeValue(entry)}</p>
                </div>`
            );
        }

        return buf.join('');
    }
}, null);

