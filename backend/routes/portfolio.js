const express = require('express');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ userId: req.user._id });
    
    // Get current prices for all coins
    if (portfolio.length > 0) {
      
      const chunkSize = 50;
      const coinIds = portfolio.map(item => item.coinId);
      const chunks = [];
      
      for (let i = 0; i < coinIds.length; i += chunkSize) {
        chunks.push(coinIds.slice(i, i + chunkSize));
      }

      const priceResponses = await Promise.all(
        chunks.map(chunk => 
          axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
              ids: chunk.join(','),
              vs_currencies: 'usd',
              include_24hr_change: true
            }
          })
        )
      );

      const priceData = priceResponses.reduce((acc, response) => ({
        ...acc,
        ...response.data
      }), {});

      const portfolioWithPrices = portfolio.map(item => ({
        ...item.toObject(),
        currentPrice: priceData[item.coinId]?.usd || 0,
        priceChange24h: priceData[item.coinId]?.usd_24h_change || 0
      }));

      res.json(portfolioWithPrices);
    } else {
      res.json([]);
    }
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: 'Error from CoinGecko API', 
        error: error.response.data 
      });
    }
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});


router.post('/add', auth, async (req, res) => {
  try {
    const { coinId, coinName, symbol, amount, purchasePrice } = req.body;

  
    if (!coinId || !coinName || !symbol || !amount || !purchasePrice) {
      return res.status(400).json({ 
        message: 'All fields are required: coinId, coinName, symbol, amount, purchasePrice' 
      });
    }

    
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      return res.status(400).json({ message: 'Purchase price must be a positive number' });
    }

    
    try {
      await axios.get(`https://api.coingecko.com/api/v3/coins/₹{coinId}`);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid coin ID' });
    }

    
    const existingItem = await Portfolio.findOne({ 
      userId: req.user._id,
      coinId 
    });

    if (existingItem) {
      return res.status(400).json({ 
        message: 'You already have this coin in your portfolio. Use update instead.' 
      });
    }

    const portfolioItem = new Portfolio({
      userId: req.user._id,
      coinId,
      coinName,
      symbol,
      amount,
      purchasePrice
    });

    await portfolioItem.save();
    res.status(201).json(portfolioItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding coin to portfolio', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, purchasePrice } = req.body;
    
    
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (purchasePrice !== undefined && (isNaN(purchasePrice) || purchasePrice <= 0)) {
      return res.status(400).json({ message: 'Purchase price must be a positive number' });
    }

    const portfolioItem = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, purchasePrice },
      { new: true }
    );

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    res.json(portfolioItem);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid portfolio item ID' });
    }
    res.status(500).json({ message: 'Error updating portfolio item', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid portfolio item ID' });
    }
    res.status(500).json({ message: 'Error deleting portfolio item', error: error.message });
  }
});

module.exports = router;