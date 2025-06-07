const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});


router.use(apiLimiter);

// Get trending coins
router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');
    
    if (!response.data || !response.data.coins) {
      throw new Error('Invalid response from CoinGecko API');
    }
    
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      
      return res.status(error.response.status).json({ 
        message: 'Error from CoinGecko API', 
        error: error.response.data 
      });
    }
    res.status(500).json({ message: 'Error fetching trending coins', error: error.message });
  }
});

// Get top coins 
router.get('/top-coins', async (req, res) => {
  try {
    const { page = 1, per_page = 50 } = req.query;
    
    if (page < 1 || per_page < 1 || per_page > 250) {
      return res.status(400).json({ 
        message: 'Invalid pagination parameters' 
      });
    }

    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'inr',
        order: 'market_cap_desc',
        per_page: parseInt(per_page),
        page: parseInt(page),
        sparkline: false
      }
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response from CoinGecko API');
    }

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: 'Error from CoinGecko API', 
        error: error.response.data 
      });
    }
    res.status(500).json({ message: 'Error fetching top coins', error: error.message });
  }
});

// Get coin details
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Coin ID is required' });
    }

    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
    
    if (!response.data || !response.data.id) {
      throw new Error('Invalid response from CoinGecko API');
    }

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: 'Error from CoinGecko API', 
        error: error.response.data 
      });
    }
    res.status(500).json({ message: 'Error fetching coin details', error: error.message });
  }
});

// Get coin price history
router.get('/coin/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = '7' } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Coin ID is required' });
    }

    const validDays = ['1', '7', '14', '30', '90', '180', '365', 'max'];
    if (!validDays.includes(days)) {
      return res.status(400).json({ 
        message: 'Invalid days parameter. Must be one of: ' + validDays.join(', ') 
      });
    }
    
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days
      }
    });

    if (!response.data || !response.data.prices) {
      throw new Error('Invalid response from CoinGecko API');
    }

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: 'Error from CoinGecko API', 
        error: error.response.data 
      });
    }
    res.status(500).json({ message: 'Error fetching price history', error: error.message });
  }
});

module.exports = router;