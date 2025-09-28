import React, { useState } from 'react'
import './Register.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  function handleRegister(e){
    e.preventDefault();
    axios.post("http://localhost:8081/register", form)
    .then(res => {
      console.log(res.data)
      setForm(res.data)
      alert("The registration was successful! You will be redireted to the login page.")
      navigate("/")
    })
  }
  return (
    <div className='register-container'>
      <form className='register-form' onSubmit={handleRegister}>
        <div>
            <label>Name</label>
            <input 
            type='text'
            placeholder='Enter your full name'
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            />
        </div>
        <div>
            <label>Email</label>
            <input 
            type='email'
            placeholder='Enter your email'
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            />
        </div>
        <div>
            <label>Phone Number</label>
            <input 
            type='text'
            placeholder='Enter your phone number'
            value={form.phone}
            onChange={(e) => setForm({...form, phone: e.target.value})}
            />
        </div>
        <div>
            <label>Password</label>
            <input 
            type='password'
            placeholder='Create a password'
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            />
        </div>
        <button type='submit'>Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/">Sign In</Link></p>
    </div>
  )
}

export default Register
