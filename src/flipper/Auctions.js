class Auctions {
    constructor() {
        this.MAX = 500000;
        this.MIN = 5;
        this.multiplier = 0.85;
        this.margin = 3;
        this.profit = 50000;
        this.auctions = [];
        this.totalAuctions = 0;
        this.filteredAuctions = [];
        this.done = false;
        this.finalAuctions = [];
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
            if (!items[auction.item_name]) {
                items[auction.item_name] = [auction];
            } else {
                items[auction.item_name].push(auction);
            }
        });
        for (const item in items) {
            var cheapest = [];
            if (items[item].length >= 10) {
                items[item].forEach(auction => {
                    cheapest.push(auction.starting_bid);
                });
                cheapest.sort((a, b) => a - b);
                cheapest = cheapest.slice(0, 2);
                if (cheapest.length == 2) {
                    const differnce = Math.round(cheapest[1] * this.multiplier - cheapest[0]);
                    const margin = Math.round(differnce / cheapest[0] * 100);
                    if (differnce >= this.profit && margin >= this.margin && items[item][0].tier == items[item][1].tier) {
                        this.finalAuctions.push({
                            name: items[item][0].item_name,
                            tier: items[item][0].tier,
                            price: cheapest[0],
                            price2: cheapest[1],
                            difference: differnce,
                            margin: margin,
                            ahid: items[item][0].uuid,
                            lore: items[item][0].item_lore
                        });
                    }
                    this.finalAuctions.sort((a, b) => a.margin - b.margin);
                }
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
}

module.exports = function () { return new Auctions(); };