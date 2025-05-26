import React, { useState } from 'react';

function PortfolioCard({ item, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    amount: item.amount,
    purchasePrice: item.purchasePrice
  });

  const currentValue = item.amount * item.currentPrice;
  const purchaseValue = item.amount * item.purchasePrice;
  const pnl = currentValue - purchaseValue;
  const pnlPercent = purchaseValue > 0 ? ((pnl / purchaseValue) * 100) : 0;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(item._id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      amount: item.amount,
      purchasePrice: item.purchasePrice
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${item.coinName} from your portfolio?`)) {
      onDelete(item._id);
    }
  };

  const handleInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  return (
    <div className="portfolio-card">
      <div className="card-header">
        <h3>{item.coinName}</h3>
        <span className="coin-symbol">{item.symbol.toUpperCase()}</span>
      </div>

      <div className="card-content">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={editData.amount}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Purchase Price</label>
              <input
                type="number"
                name="purchasePrice"
                value={editData.purchasePrice}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
            <div className="edit-buttons">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="portfolio-stats">
              <div className="stat">
                <span className="stat-label">Amount</span>
                <span className="stat-value">{item.amount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Current Price</span>
                <span className="stat-value">${item.currentPrice.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Purchase Price</span>
                <span className="stat-value">${item.purchasePrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="portfolio-values">
              <div className="value-row">
                <span>Current Value:</span>
                <span className="current-value">${currentValue.toLocaleString()}</span>
              </div>
              <div className="value-row">
                <span>P&L:</span>
                <span className={`pnl ${pnl >= 0 ? 'positive' : 'negative'}`}>
                  {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()} ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="card-actions">
              <button className="edit-btn" onClick={handleEdit}>Edit</button>
              <button className="delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PortfolioCard;