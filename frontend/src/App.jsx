import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from './Register'
import Login  from './Login'
import Transactions from './Transactions'
import Profile from './Profile'
import Settings from './Settings'
import Dashboard from './Dashboard'
import Savings from './Savings'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/dashboard' element={<Dashboard />}/>
          <Route path='/savings' element={<Savings />}/>
          <Route path='/transactions' element={<Transactions />}/>
          <Route path='/profile' element={<Profile />}/>
          <Route path='/settings' element={<Settings />}/>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
