import React, { useEffect, useState } from 'react';
import './Header.css';
import { IoPersonSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className='page-header'>
      <p className='user'>Welcome, {user?.name}</p>

      <div className='header-profile-container'>
        <p className='user-profile' onClick={() => setDropdownOpen(!dropdownOpen)}>
          <IoPersonSharp size={30} />
        </p>

        {dropdownOpen && (
          <div className='profile-dropdown'>
            <ul>
              <li onClick={() => navigate("/profile")}><IoPersonSharp/>Profile</li>
              <li onClick={() => navigate("/settings")}>Settings</li>
              <li onClick={() => setDropdownOpen(!dropdownOpen)} className= "close-btn">Close</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
