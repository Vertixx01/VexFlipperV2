const express = require('express')
const path = require('path')
const Auctions = require('../flipper/Auctions');

const app = express()
app.set('views', path.join(__dirname, 'web'))
app.set('view engine', 'ejs')
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

  app.get('/webview', (req, res) => {
    Auctions().getAuctions().then(auctions => {
      Auctions().fixAuctions(auctions).then(fixedAuctions => {
        res.render('auctions', { 
          min: Auctions().MIN,
          max: Auctions().MAX,
          amount: fixedAuctions.length, 
          auctions: fixedAuctions 
        });
      });
    });
  })

  app.listen(port, () => {
    console.log(`Webpage hosted: http://localhost:${port}/api`)
  })
}

module.exports = api;