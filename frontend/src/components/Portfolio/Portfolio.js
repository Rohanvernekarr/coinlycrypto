import React, { useState, useEffect, useCallback } from 'react';
import { portfolioAPI } from '../../services/api';
import PortfolioCard from './PortfolioCard';
import AddCoin from './AddCoin';

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);

  const calculateTotals = useCallback(() => {
    let value = 0;
    let pnl = 0;

    portfolio.forEach(item => {
      const currentValue = item.amount * item.currentPrice;
      const purchaseValue = item.amount * item.purchasePrice;
      value += currentValue;
      pnl += currentValue - purchaseValue;
    });

    setTotalValue(value);
    setTotalPnL(pnl);
  }, [portfolio]);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const fetchPortfolio = async () => {
    try {
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoin = async (coinData) => {
    try {
      await portfolioAPI.addCoin(coinData);
      setShowAddForm(false);
      fetchPortfolio();
    } catch (error) {
      console.error('Error adding coin:', error);
    }
  };

  const handleUpdateCoin = async (id, coinData) => {
    try {
      await portfolioAPI.updateCoin(id, coinData);
      fetchPortfolio();
    } catch (error) {
      console.error('Error updating coin:', error);
    }
  };

  const handleDeleteCoin = async (id) => {
    try {
      await portfolioAPI.deleteCoin(id);
      fetchPortfolio();
    } catch (error) {
      console.error('Error deleting coin:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading portfolio...</div>;
  }

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <h1>My Portfolio</h1>
        <button 
          className="add-coin-btn"
          onClick={() => setShowAddForm(true)}
        >
          Add Coin
        </button>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Portfolio Value</h3>
          <span className="total-value">${totalValue.toLocaleString()}</span>
        </div>
        <div className="summary-card">
          <h3>Total P&L</h3>
          <span className={`total-pnl ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
          </span>
        </div>
        <div className="summary-card">
          <h3>Total P&L %</h3>
          <span className={`total-pnl-percent ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalValue > 0 ? ((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2) : 0}%
          </span>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="empty-portfolio">
          <h3>Your portfolio is empty</h3>
          <p>Add some coins to start tracking your investments</p>
        </div>
      ) : (
        <div className="portfolio-grid">
          {portfolio.map((item) => (
            <PortfolioCard
              key={item._id}
              item={item}
              onUpdate={handleUpdateCoin}
              onDelete={handleDeleteCoin}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <AddCoin
          onAdd={handleAddCoin}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

export default Portfolio;