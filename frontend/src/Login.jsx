import React, { useState } from 'react'
import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export const Login = () => {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        email: "",
        password: ""
    })

    function handleLogin(e) {
        e.preventDefault();
        axios.post("http://localhost:8081/login", user)
            .then(res => {
                if(res.data.success) {
                    console.log(res.data.user)
                    setUser(res.data.user); // store logged in user
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    alert("Login successful");
                    navigate("/dashboard");
                } else {
                    alert(res.data.message);
                }
            })
            .catch(err => console.log(err));
    }

  return (
    <>
        <div className='login'>
            <form onSubmit={handleLogin}>
                <div className='input-box'>
                    <label>Email</label>
                    <input 
                        type='email'
                        placeholder='Enter your email'
                        value={user.email}
                        onChange={(e) => setUser({...user, email: e.target.value})}
                    />
                </div>
                <div className='input-box'>
                    <label>Password</label>
                    <input 
                        type='password'
                        placeholder='Enter your password'
                        value={user.password}
                        onChange={(e) => setUser({...user, password: e.target.value})}
                    />
                </div>
                <button type='submit'>Sign In</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    </>
  )
}

export default Login