const motdParser = require('@sfirew/mc-motd-parser');
const { millify } = require("millify");
const config = require('../config.json');

class Auctions {
    constructor() {
        this.MAX = config.flipper.maxPrice;
        this.MIN = config.flipper.minPrice;
        this.undercut = config.flipper.undercut;
        this.margin = config.flipper.minProfitPercent;
        this.profit = config.flipper.minProfit;
        this.auctions = [];
        this.totalAuctions = 0;
        this.filteredAuctions = [];
        this.done = false;
        this.finalAuctions = [];
        this.blacklist = config.filter.blacklistedWords;
    }


    async getAuctions() {
        var done = false;
        fetch('https://api.hypixel.net/skyblock/auctions').then(res => res.json()).then(async pages => {
            var currentPage = 0;
            Promise.all([...Array(pages.totalPages).keys()].map(async page => {
                fetch(`https://api.hypixel.net/skyblock/auctions?page=${page}`).then(res => res.json()).then(async auctionsData => {
                    this.auctions.push(JSON.stringify(auctionsData));
                    currentPage++;
                    if (currentPage == pages.totalPages) {
                        done = true;
                    }
                });
            }));
        });
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (done) {
                    clearInterval(interval);
                    resolve(this.auctions);
                }
            }, 1000);
        });
    }

    async fixAuctions(auctionsList) {
        var auctions = [];
        auctionsList.forEach(auction => {
            auctions.push(JSON.parse(auction));
        });
        auctions.forEach(auction => {
            let auctions = auction.auctions;
            auctions.forEach(auction => {
                if (auction.bin && auction.starting_bid >= this.MIN && auction.starting_bid <= this.MAX) {
                    this.totalAuctions++;
                    this.filteredAuctions.push(auction);
                };
            });
        });
        const items = {};
        this.filteredAuctions.forEach(auction => {
            if (!items.hasOwnProperty(auction.item_name)) {
                items[auction.item_name] = [auction];
            } else if (Array.isArray(items[auction.item_name])) {
                items[auction.item_name].push(auction);
            }
        });        
        for (const item in items) {
            var cheapest = [];
            if (items[item].length > config.filter.minItems) {
                items[item].forEach(auction => {
                    cheapest.push({ price: auction.starting_bid, tier: auction.tier, readable: millify(auction.starting_bid) });
                });
                cheapest.sort((a, b) => a.price - b.price);
                cheapest = cheapest.slice(0, 2);
                if (cheapest.length == 2) {
                    const differnce = Math.round(cheapest[1].price * this.undercut - cheapest[0].price);
                    const differenceReadable = millify(differnce);
                    const margin = Math.round(differnce / cheapest[0].price * 100);
                    if (differnce > this.profit && margin > this.margin && cheapest[0].tier == cheapest[1].tier) {
                        if (!this.blacklistRemover(items[item][0].item_name) && !this.blacklistRemover(items[item][0].item_lore)) {
                            this.finalAuctions.push({
                                name: items[item][0].item_name,
                                tier: cheapest[0].tier,
                                price: cheapest[0],
                                price2: cheapest[1],
                                difference: differnce,
                                differenceReadable: differenceReadable,
                                margin: margin,
                                ahid: `/viewauction ${items[item][0].uuid}`,
                                lore: items[item][0].item_lore,
                                htmllore: motdParser.textToHTML(items[item][0].item_lore)
                            });
                        }
                    }
                }
                this.finalAuctions.sort((a, b) => a.margin - b.margin);
            }
        }
        this.done = true;
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (this.done) {
                    clearInterval(interval);
                    resolve(this.finalAuctions);
                }
            }, 1000);
        });
    }

    blacklistRemover(item) {
        if(config.filter.blacklist) {
            var blacklisted = false;
            if (!this.blacklist.length == 0) {
                this.blacklist.forEach(word => {
                    if (item.includes(word)) {
                        blacklisted = true;
                    }
                });
                return blacklisted;
            } else return false;
        } else return false;
    }
}



module.exports = function () { return new Auctions(); };