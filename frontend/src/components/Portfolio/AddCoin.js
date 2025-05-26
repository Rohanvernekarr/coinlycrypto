import React, { useState, useEffect } from 'react';
import { cryptoAPI } from '../../services/api';

function AddCoin({ onAdd, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    purchasePrice: ''
  });
  const [topCoins, setTopCoins] = useState([]);

  useEffect(() => {
    fetchTopCoins();
  }, []);

  const fetchTopCoins = async () => {
    try {
      const response = await cryptoAPI.getTopCoins();
      setTopCoins(response.data.slice(0, 20)); // Show top 20 coins
      setSearchResults(response.data.slice(0, 20));
    } catch (error) {
      console.error('Error fetching top coins:', error);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const filtered = topCoins.filter(coin =>
        coin.name.toLowerCase().includes(term.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(topCoins);
    }
  };

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
    setFormData({
      ...formData,
      purchasePrice: coin.current_price
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCoin || !formData.amount || !formData.purchasePrice) {
      alert('Please fill all fields');
      return;
    }

    const coinData = {
      coinId: selectedCoin.id,
      coinName: selectedCoin.name,
      symbol: selectedCoin.symbol,
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice)
    };

    onAdd(coinData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Coin to Portfolio</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="add-coin-form">
          {!selectedCoin ? (
            <>
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search for a coin..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>

              <div className="coin-list">
                {searchResults.map((coin) => (
                  <div
                    key={coin.id}
                    className="coin-option"
                    onClick={() => handleCoinSelect(coin)}
                  >
                    <img src={coin.image} alt={coin.name} className="coin-image-small" />
                    <div className="coin-info-small">
                      <span className="coin-name-small">{coin.name}</span>
                      <span className="coin-symbol-small">{coin.symbol.toUpperCase()}</span>
                    </div>
                    <span className="coin-price-small">${coin.current_price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="selected-coin">
                <img src={selectedCoin.image} alt={selectedCoin.name} />
                <span>{selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})</span>
                <button type="button" onClick={() => setSelectedCoin(null)}>Change</button>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purchase Price (USD)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="add-btn">Add to Portfolio</button>
                <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCoin;
  