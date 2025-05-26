import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { cryptoAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function PriceChart({ coin }) {
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState('7');
  const [loading, setLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
    if (!coin) return;
    
    setLoading(true);
    try {
      const response = await cryptoAPI.getCoinHistory(coin.id, timeframe);
      const prices = response.data.prices;
      
      const labels = prices.map(price => {
        const date = new Date(price[0]);
        return timeframe === '1' 
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      const data = prices.map(price => price[1]);

      setChartData({
        labels,
        datasets: [
          {
            label: `${coin.name} Price (USD)`,
            data,
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [coin, timeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${coin?.name} Price Chart`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
  };

  return (
    <div className="price-chart">
      <div className="chart-header">
        <h2>{coin?.name} Price Chart</h2>
        <div className="timeframe-buttons">
          {['1', '7', '30', '90'].map((days) => (
            <button
              key={days}
              className={`timeframe-btn ${timeframe === days ? 'active' : ''}`}
              onClick={() => setTimeframe(days)}
            >
              {days === '1' ? '24H' : `${days}D`}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="chart-loading">Loading chart...</div>
      ) : chartData ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="chart-error">Error loading chart data</div>
      )}
    </div>
  );
}

export default PriceChart;