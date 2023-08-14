import express from 'express';
import cors from 'cors';
import axios from 'axios';

const currencies =
  'BTC,USD,EUR,AUD,BRL,GBP,CAD,CLP,CNY,CZK,HKD,ILS,JPY,KRW,MYR,MXN,NZD,PKR,RUB,SAR,SGD,ZAR,CHF,TWD,AED,INR,PLN,VND,THB,MMK,IDR,PHP';
const url = `https://api.coingecko.com/api/v3/simple/price?ids=nexus&vs_currencies=${currencies}&include_24hr_change=true`;

const interval = 90000;
let marketData = null;
let lastFetched = null;
let error = null;

const validTime = 15 * 60 * 1000; // data expires after 15 minutes
const isDataValid = () =>
  !!marketData && !!lastFetched && Date.now() - lastFetched <= validTime;

async function fetchMarketData() {
  let retryAfter = null;
  try {
    const prices = await axios(url);

    if (!prices?.data?.nexus) {
      error = new Error('Invalid data returned from coingecko');
      return;
    }

    marketData = prices.data.nexus;
    lastFetched = Date.now();
    error = null;
    console.log('[SUCCESS]');
  } catch (err) {
    error = err;
    console.error('[ERROR] Failed to fetch market data');
    if (err?.toJSON) {
      console.error(err.toJSON());
    }
    if (err?.message) {
      console.log('Error message: ', err.message);
    }
    if (err?.response) {
      console.error('Response headers: ', err.response.headers);
      console.error('Response data: ', err.response.data);
      if (err.response.status === 429) {
        // hit rate limit
        retryAfter = err.response.headers?.['retry-after'] || null;
      }
    }
  } finally {
    clearTimeout(global.timerId);
    global.timerId = setTimeout(
      fetchMarketData,
      retryAfter ? retryAfter * 1000 : interval
    );
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
  if (global.timerId) {
    clearTimeout(global.timerId);
  }
  await fetchMarketData();

  const app = express();
  app.use(express.json());

  servePriceData(app);

  const port = process.env.PORT || 80;
  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}

run();
