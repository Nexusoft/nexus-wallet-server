import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { parse, gte } from 'semver';

import featuredModules from './featuredModules';

const apiKey = process.env.API_KEY;
const batch1 =
  'BTC,USD,EUR,AUD,BRL,GBP,CAD,CLP,CNY,CZK,HKD,ILS,JPY,KRW,MYR,MXN';
const batch2 =
  'NZD,PKR,RUB,SAR,SGD,ZAR,CHF,TWD,AED,INR,PLN,VND,THB,MMK,IDR,PHP';
const getUrl = (tsyms) =>
  `https://min-api.cryptocompare.com/data/pricemultifull?api_key=${apiKey}&fsyms=NXS,BTC&tsyms=${tsyms}`;

let marketData = null;
let error = null;

const latestModuleList = featuredModules.find((list) => list.latest).modules;

if (!apiKey) {
  console.log('API_KEY environment variable not found!');
}

async function fetchMarketData() {
  try {
    const [prices1, prices2] = await Promise.all([
      axios(getUrl(batch1)),
      axios(getUrl(batch2)),
    ]);

    if (!prices1?.data || !prices2?.data) {
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
  app.use(
    cors({
      origin: /^http:\/\/localhost/,
    })
  );

  // backward compatibility
  app.get('/displaydata', (req, res) => {
    if (marketData) {
      res.json(marketData);
    } else {
      res.status(500).json({ error });
    }
  });

  app.get('/market-data', (req, res) => {
    if (marketData) {
      const baseCurrency = req.query?.base_currency;
      const data = marketData.RAW.NXS[baseCurrency];
      const price = data.PRICE;
      const changePct24Hr = data.CHANGEPCT24HOUR;
      res.json({
        price,
        changePct24Hr,
      });
    } else {
      res.status(500).json({ error });
    }
  });

  app.get('/market-price', (req, res) => {
    if (marketData) {
      const baseCurrency = req.query?.base_currency;
      const price = marketData.RAW.NXS[baseCurrency].PRICE;
      res.json({
        price,
      });
    } else {
      res.status(500).json({ error });
    }
  });

  /**
   * Featured modules
   */
  app.use(
    '/resources',
    express.static('../resources', {
      etag: false,
      immutable: true,
      maxAge: 1000 * 60 * 60 * 24 * 90,
      index: false,
    })
  );

  app.get('/featured-modules', (req, res) => {
    const walletVersion = req.query?.wallet_version;
    const parsedVersion = parse(walletVersion);
    if (!parsedVersion) {
      res.json(latestModuleList);
    } else {
      const matchedList = featuredModules.find(
        (list) => parsedVersion.compareMain(list.fromWalletVersion) >= 0
      );
      const { modules } = matchedList;
      res.json(modules);
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
