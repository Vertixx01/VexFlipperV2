const { UI } = require('./utils/ui');
const Auctions = require('./flipper/Auctions');
let colors = require('colors');
const motdParser = require('@sfirew/mc-motd-parser');
const fs = require('fs');
const api = require('./api/api');

const ui = new UI();
ui.logo();

const main = async () => {
    api();
    var htmlresults = [];
    console.log('Starting...'.yellow);
    Auctions().getAuctions().then(auctions => {
        Auctions().fixAuctions(auctions).then(fixedAuctions => {
            console.log('Done!'.green);
            fixedAuctions.forEach(auction => {
                htmlresults.push(`
                <div>
                    <span style="color:#FFFFFF; font-weight: bold;">${auction.name}<br></span>${motdParser.textToHTML(auction.lore)}
                </div>
                replace
                `);
            });
            var finalhtml = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <title>Auctions</title>
                </head>
                <body>
                    <div class="h-screen bg-black">
                        <div class="grid grid-rows-4 grid-cols-3 bg-black place-items-center">
                            replace
                        </div>
                    </div>
                </body>
            </html>`;
            htmlresults.forEach(html => {
                finalhtml = finalhtml.replace('replace', html);
                finalhtml = finalhtml.replace('obfuscated;', '');
            });
            finalhtml = finalhtml.replace('replace', '');
            fs.writeFile('auctions.html', finalhtml, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        });
    });
}


main();
