const mineflayer = require('mineflayer');
const Auctions = require('../flipper/Auctions');
const { millify } = require("millify");

const bot = mineflayer.createBot({
    host: 'VexFlipperV2.feathermc.gg',
    username: 'VexFlipperV2',
    version: '1.8.9'
});

bot.on('login', () => {
    bot.chat('Logged in!');
    setInterval(() => {
        Auctions().getAuctions().then(auctions => {
            Auctions().fixAuctions(auctions).then(fixedAuctions => {
                // meow meow meow
            })
        });
    }, 5000);
});

bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message === 'auctions') {
        Auctions().getAuctions().then(auctions => {
            Auctions().fixAuctions(auctions).then(fixedAuctions => {
                bot.chat(`There are ${fixedAuctions.length} auctions!`);
            });
        });
    }
});

module.exports = { bot };