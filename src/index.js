import express from 'express';
import axios from 'axios';

const apiKey = process.env.API_KEY;
let marketData = null;
let error = null;

if (!apiKey) {
  console.log('API_KEY environment variable not found!');
}

async function fetchMarketData() {
  try {
    const [prices1, prices2] = await Promise.all([
      axios(
        `https://min-api.cryptocompare.com/data/pricemultifull?api_key=${apiKey}&fsyms=NXS,BTC&tsyms=BTC,USD,EUR,AUD,BRL,GBP,CAD,CLP,CNY,CZK,HKD,ILS,JPY,KRW,MYR,MXN`
      ),
      axios(
        `https://min-api.cryptocompare.com/data/pricemultifull?api_key=${apiKey}&fsyms=NXS,BTC&tsyms=NZD,PKR,RUB,SAR,SGD,ZAR,CHF,TWD,AED,INR,PLN`
      ),
    ]);

    if (!(prices1 && prices2 && prices1.data && prices2.data)) {
      marketData = null;
      error = { message: 'Invalid data returned from cryptocompare' };
      return;
    }

    marketData = {
      RAW: {
        NXS: {
          ...prices1.data.RAW.NXS,
          ...prices2.data.RAW.NXS,
        },
        BTC: {
          ...prices1.data.RAW.BTC,
          ...prices2.data.RAW.BTC,
        },
      },
      DISPLAY: {
        NXS: {
          ...prices1.data.DISPLAY.NXS,
          ...prices2.data.DISPLAY.NXS,
        },
        BTC: {
          ...prices1.data.DISPLAY.BTC,
          ...prices2.data.DISPLAY.BTC,
        },
      },
    };
    error = null;
  } catch (err) {
    marketData = null;
    error = err;
  }
}

function servePriceData(app) {
  // backward compatibility
  app.get('/displaydata', (req, res) => {
    if (marketData) {
      res.json(marketData);
    } else {
      res.status(500).json({ error });
    }
  });
}

async function run() {
  await fetchMarketData();
  setInterval(fetchMarketData, 60000);

  const app = express();
  app.use(express.json());

  servePriceData(app);

  const port = process.env.PORT || 80;
  app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
}

run();