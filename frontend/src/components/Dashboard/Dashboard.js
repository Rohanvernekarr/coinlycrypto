import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cryptoAPI, portfolioAPI } from '../../services/api';
import CoinCard from './CoinCard';
import PriceChart from './PriceChart';
import { FaPlus } from 'react-icons/fa';

function Dashboard() {
  const [topCoins, setTopCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    coinId: '',
    amount: '',
    purchasePrice: ''
  });
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchTopCoins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cryptoAPI.getTopCoins();
      setTopCoins(response.data);
      if (response.data.length > 0 && !selectedCoin) {
        setSelectedCoin(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching top coins:', error);
      setError('Failed to load coins. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCoin]);


  useEffect(() => {
    fetchTopCoins();
  }, []);

  
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchTopCoins();
    }
  }, [location.pathname, fetchTopCoins]);

  const handleAddCoin = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const selectedCoinData = topCoins.find(coin => coin.id === formData.coinId);
      if (!selectedCoinData) {
        throw new Error('Selected coin not found');
      }

      await portfolioAPI.addCoin({
        coinId: formData.coinId,
        coinName: selectedCoinData.name,
        symbol: selectedCoinData.symbol,
        amount: parseFloat(formData.amount),
        purchasePrice: parseFloat(formData.purchasePrice)
      });
      
      setShowAddForm(false);
      setFormData({ coinId: '', amount: '', purchasePrice: '' });
      alert('Coin added to portfolio successfully!');
      navigate('/portfolio');
    } catch (error) {
      console.error('Error adding coin:', error);
      setError(error.response?.data?.message || 'Failed to add coin to portfolio. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  if (loading && topCoins.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error && topCoins.length === 0) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchTopCoins} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
       
        <p>Real-time cryptocurrency prices and market data</p>
      </div>

      {selectedCoin && (
        <div className="chart-section">
          <PriceChart coin={selectedCoin} />
        </div>
      )}

      <div className="dashboard-actions">
        <button 
          className="add-coin-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <FaPlus className="btn-icon" />
          {showAddForm ? 'Cancel' : 'Add to Portfolio'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-coin-form" onSubmit={handleAddCoin}>
          <h2>Add to Portfolio</h2>
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="coinId">Select Coin</label>
              <select
                id="coinId"
                name="coinId"
                value={formData.coinId}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Select a coin</option>
                {topCoins.map(coin => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                step="any"
                min="0"
                required
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="purchasePrice">Purchase Price (USD)</label>
            <input
              type="number"
              id="purchasePrice"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              placeholder="Enter purchase price"
              step="any"
              min="0"
              required
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">Add to Portfolio</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="coins-grid">
        {topCoins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            onClick={handleCoinSelect}
            isSelected={selectedCoin?.id === coin.id}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;