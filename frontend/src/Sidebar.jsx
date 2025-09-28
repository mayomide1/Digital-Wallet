import React, { useState } from 'react';
import './sidebar.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/Logo.png';

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user from localStorage
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/");
  };

  return (
    <div className='sidebar'>
      <img src={logo} alt='logo'/>

      <div className="buttons">
        <Link to='/dashboard'><button className='btn'>Dashboard</button></Link>
        <Link to='/savings'><button className='btn'>Savings</button></Link>
        <Link to='/transactions'><button className='btn'>Transactions</button></Link>
        <Link to='/profile'><button className='btn'>Profile</button></Link>
        <Link to='/settings'><button className='btn'>Settings</button></Link>
        <button className='btn' onClick={() => setShowLogoutModal(true)}>Logout</button>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Are you sure you want to logout?</h2>
            <button type="button" onClick={handleLogout}>Yes, Logout</button>
            <button className="close-btn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
