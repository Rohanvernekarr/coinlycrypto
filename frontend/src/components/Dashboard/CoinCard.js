import React from 'react';
import { FaChartLine } from 'react-icons/fa';

function CoinCard({ coin, onClick, isSelected }) {
  const priceChangeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';

  return (
    <div 
      className={`coin-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(coin)}
    >
      <div className="coin-header">
        <img src={coin.image} alt={coin.name} className="coin-image" />
        <div className="coin-info">
          <h3>{coin.name}</h3>
          <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
        </div>
        <FaChartLine className="chart-icon" />
      </div>
      
      <div className="coin-price">
        <span className="price">₹{coin.current_price.toLocaleString()}</span>
        <span className={`price-change ₹{priceChangeClass}`}>
          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
          {coin.price_change_percentage_24h.toFixed(2)}%
        </span>
      </div>
      
      <div className="coin-stats">
        <div className="stat">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">₹{(coin.market_cap / 1e9).toFixed(2)}B</span>
        </div>
        <div className="stat">
          <span className="stat-label">Volume 24h</span>
          <span className="stat-value">₹{(coin.total_volume / 1e6).toFixed(2)}M</span>
        </div>
      </div>
    </div>
  );
}

export default CoinCard;