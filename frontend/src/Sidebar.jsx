import React from 'react'
import './sidebar.css'
import { Link } from 'react-router-dom'
import logo from './assets/Logo.png'

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <img src={logo} alt='logo'/>
    <div className="buttons">
      <Link to='/dashboard'><button className='btn'>Dashboard</button></Link>
      <Link to='/transactions'><button className='btn'>Transactions</button></Link>
      <Link to='/profile'><button className='btn'>Profile</button></Link>
      <Link to='/settings'><button className='btn'>Settings</button></Link>
    </div>
    </div>
  )
}

export default Sidebar
