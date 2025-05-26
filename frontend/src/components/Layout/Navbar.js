import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChartLine, FaWallet, FaSignOutAlt } from 'react-icons/fa';
import { SiBitcoin } from 'react-icons/si';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          <SiBitcoin className="logo-icon" />
          Coinly
        </Link>
        
        {user && (
          <div className="nav-menu">
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <FaChartLine className="nav-icon" />
              Dashboard
            </Link>
            <Link 
              to="/portfolio" 
              className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
            >
              <FaWallet className="nav-icon" />
              Portfolio
            </Link>
            <div className="nav-user">
              <span>Welcome, {user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt className="logout-icon" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;