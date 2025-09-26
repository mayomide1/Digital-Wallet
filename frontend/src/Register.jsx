import React from 'react'

const Register = () => {
  return (
    <>
      <div>
        <form>
            <div>
                <label>Name</label>
                <input 
                type='text'
                placeholder='Enter your full name'
                />
            </div>
            <div>
                <label>Email</label>
                <input 
                type='email'
                placeholder='Enter your email'
                />
            </div>
            <div>
                <label>Phone Number</label>
                <input 
                type='text'
                placeholder='Enter your phone number'
                />
            </div>
            <div>
                <label>Password</label>
                <input 
                type='password'
                placeholder='Create a password'
                />
            </div>
            <button type='submit'>Sign Up</button>
        </form>
        <p>Already have an account? Sign In</p>
      </div>
    </>
  )
}

export default Register
