import React, { useState } from 'react';
import './sidebar.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../public/logo.png'

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoggingOut(true);
    // Clear user from localStorage
    localStorage.removeItem("user");
    // Redirect to login page
    setTimeout(() => {
      navigate("/");
    }, 3000); // 3 seconds
  };

  return (
    <div className='sidebar'>
      <img src={logo} alt='' onClick={() => navigate("/dashboard")}/>
      <div className="buttons">
        <Link to='/dashboard'><button className='btn'>Dashboard</button></Link>
        <Link to='/transactions'><button className='btn'>Transactions</button></Link>
        <Link to='/savings'><button className='btn'>Savings</button></Link>
      </div>
        <button className='logout' onClick={() => setShowLogoutModal(true)}>Logout</button>
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Are you sure you want to logout?</h2>
            <button type="button" onClick={handleLogout} disabled={loggingOut} style={{background: "#0077ff"}}>
              {loggingOut ? "Logging Out..." : "Yes, Logout"}
            </button>
            <button className="close-btn" onClick={() => setShowLogoutModal(false)} disabled={loggingOut}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
