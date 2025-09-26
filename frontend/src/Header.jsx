import React from 'react'
import './Header.css'
import logo from './assets/Logo.png'
import { IoNotifications, IoPersonSharp} from "react-icons/io5";

const Header = () => {
  return (
    <>
      <div className='header'>
        <p className='user'> <IoPersonSharp size={30}/>Ayomide Mamukuyomi</p>
        <p className='notification'>
            < IoNotifications size={25}/>
            <img src={logo} alt='logo'/>
        </p>
      </div>
    </>
  )
}

export default Header
