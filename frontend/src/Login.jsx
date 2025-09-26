import React from 'react'

export const Login = () => {
  return (
    <>
        <div className='login'>
            <form>
                <div>
                    <label>Email</label>
                    <input 
                        type='email'
                        placeholder='Enter your email'
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input 
                        type='password'
                        placeholder='Enter your password'
                    />
                </div>
                <button type='submit'>Sign In</button>
            </form>
            <p>forgotpassword</p>
            <p>Don't have an account? Register</p>
        </div>
    </>
  )
}

export default Login