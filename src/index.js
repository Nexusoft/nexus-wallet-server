import express from 'express';
import cors from 'cors';
import axios from 'axios';

const currencies =
  'BTC,USD,EUR,AUD,BRL,GBP,CAD,CLP,CNY,CZK,HKD,ILS,JPY,KRW,MYR,MXN,NZD,PKR,RUB,SAR,SGD,ZAR,CHF,TWD,AED,INR,PLN,VND,THB,MMK,IDR,PHP';
const url = `https://api.coingecko.com/api/v3/simple/price?ids=nexus&vs_currencies=${currencies}&include_24hr_change=true`;

let marketData = null;
let lastFetched = null;
let error = null;

const validTime = 15 * 60 * 1000; // data expires after 15 minutes
const isDataValid = () =>
  !!marketData &&
  !error &&
  !!lastFetched &&
  Date.now() - lastFetched <= validTime;

async function fetchMarketData() {
  try {
    const prices = await axios(url);

    if (!prices?.data?.nexus) {
      error = new Error('Invalid data returned from coingecko');
      return;
    }

    marketData = prices.data.nexus;
    lastFetched = Date.now();
    error = null;
  } catch (err) {
    error = err;
    console.error('Failed to fetch market data');
    console.error(err);
  }
}

function servePriceData(app) {
  app.use(
    cors({
      origin: /^http:\/\/localhost/,
    })
  );

  app.get('/market-data', (req, res) => {
    if (isDataValid()) {
      const baseCurrency = req.query?.base_currency?.toLowerCase();
      const price = marketData[baseCurrency];
      const changePct24Hr = marketData[`${baseCurrency}_24h_change`];
      res.json({
        price,
        changePct24Hr,
      });
    } else {
      res.status(500).json({ error });
    }
  });

  app.get('/market-price', (req, res) => {
    if (isDataValid()) {
      const baseCurrency = req.query?.base_currency?.toLowerCase();
      const price = marketData[baseCurrency];
      res.json({
        price,
      });
    } else {
      res.status(500).json({ error });
    }
  });
}

async function run() {
  await fetchMarketData();
  setInterval(fetchMarketData, 121000);

  const app = express();
  app.use(express.json());

  servePriceData(app);

  const port = process.env.PORT || 80;
  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}

run();
