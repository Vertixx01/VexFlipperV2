const express = require('express')
const Auctions = require('../flipper/Auctions');
const app = express()
const port = 3000

const api = () => {
  app.get('/api', (req, res) => {
    Auctions().getAuctions().then(auctions => {
      Auctions().fixAuctions(auctions).then(fixedAuctions => {
        res.send({
            min: Auctions().MIN,
            max: Auctions().MAX,
            amount: fixedAuctions.length, 
            auctions: fixedAuctions 
          });
      });
    });
  })

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}

module.exports = api;