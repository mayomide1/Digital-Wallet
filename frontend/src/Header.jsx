import React, {useEffect, useState} from 'react'
import './Header.css'
import logo from './assets/Logo.png'
import { IoNotifications, IoPersonSharp} from "react-icons/io5";

const Header = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    console.log(storedUser)
  }, []);

  return (
    <>
      <div className='header'>
        <p className='user'> <IoPersonSharp size={30}/>{user?.name}</p>
        <p className='notification'>
            < IoNotifications size={25}/>
            <img src={logo} alt='logo'/>
        </p>
      </div>
    </>
  )
}

export default Header
