import React, { useState} from 'react';
import Backg from '../assets/Background.jpg'
import { GrGoogle } from 'react-icons/gr';
import { Link, useNavigate} from "react-router-dom";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../firebase/auth';
import { useAuth } from '../Contexts/AuthContext';



function Login() {
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
          const user = await doSignInWithEmailAndPassword(email, password);
          console.log('User logged in:', user);
          navigate("/"); // Navigate to dashboard or other protected page after successful login
      } catch (error) {
          console.error('Error logging in with email/password:', error);
      }
  };

  const handleGoogleLogin = async () => {
      try {
          const user = await doSignInWithGoogle();
          console.log('User logged in with Google:', user);
          navigate("/");
      } catch (error) {
          console.error('Error logging in with Google:', error);
      }
  };
    
  return (
    <div className='w-full h-screen'>
    <div className='hidden md:block w-full h-screen'>
    <img src={Backg } alt='Background' className='w-full h-full object-cover' />
    <div className='absolute w-full h-full top-0 left-0 bg-gray-900/50'></div>
    <div className='absolute top-0  flex flex-col justify-center w-full h-full'>
      <div className='flex justify-center w-full h-full p-10'>
        <form className=' bg-black/70 p-10 w-[420px] ' onSubmit={handleLogin} >
        <h1 className='text-[#6e44ff] text-4xl font-extrabold py-3 '>Dicson Mo.</h1> 
          <h1 className='text-xl text-white font-medium'>Log in to your account</h1>
          <p className='pt-1 pb-8 text-sm font-extralight text-gray-400'>Welcome back! Please enter your details</p>
          <div className='py-2'>
            <label className='text-sm text-white'>Email</label>
            <input placeholder='pablo@example.com' 
            type='email' 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required className='p-2 w-full rounded-md mt-2 border-none focus:outline-[#e2ddff]' />
          </div>
          <div className='pt-2'>
            <label className='text-sm text-white'>Password</label>
            <input placeholder='*********' 
            type='password' 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required className='p-2 w-full rounded-md mt-2 border-none focus:outline-[#e2ddff] ' />
          </div>
          <p className='pt-1 text-sm font-extralight text-white'>Must be at least 8 characters</p>
          <button
          type='submit'
          className='my-2 p-2 flex justify-center  bg-[#6e44ff] border border-none rounded-md w-full text-white font-medium'>Log in</button>
          <button
          type="button"
          onClick={handleGoogleLogin}
           className='my-2 p-2 flex justify-center bg-white border border-none rounded-md w-full font-medium'> <GrGoogle size={24} color='#4285f4' className='pr-2'/> Continue with Google</button>
          <p className='pt-1 text-right text-sm font-extralight text-white'> Don&apos;t have an account? <Link to='/Signup' ><span className='text-[#9381ff] font-semibold'>Sign up</span></Link> </p>
        </form>
      </div>
    </div>
  </div>
  
  <h1 className='text-[#6e44ff] text-center text-4xl font-extrabold py-10 '>Dicson Mo.</h1> 

  <div className='flex flex-col justify-center w-full h-full'>
      <div className='flex justify-center w-full h-full p-10'>
        <form className=' p-4 w-full' onSubmit={handleLogin} >
          <h1 className='text-xl text-black font-medium'>Log in to your account</h1>
          <p className='pt-1 pb-8 text-sm font-extralight text-gray'>Welcome back! Please enter your details</p>
          <div className='py-2'>
            <label className='text-sm text-[#466365]'>Email</label>
            <input placeholder='pablo@example.com' type='email' 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required className='p-2 w-full rounded-md mt-2 border border-[#9381ff] focus:outline-[#e2ddff]' />
          </div>
          <div className='pt-2'>
            <label className='text-sm text-[#466365]'>Password</label>
            <input placeholder='*********' type='password' 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className='p-2 w-full rounded-md mt-2 border border-[#9381ff] focus:outline-[#e2ddff]' />
          </div>
          <p className='pt-1 text-sm font-extralight text-[#466365]'>Must be at least 8 characters</p>
          <button
          type='submit'
           className='my-2 p-2 flex justify-center  bg-[#6e44ff] border border-[#9381ff] rounded-md w-full text-white font-medium'>Log in</button>
          <button
          type="button"
          onClick={handleGoogleLogin}
          className='my-2 p-2 flex justify-center bg-white border border-[#6e44ff] rounded-md w-full font-medium'> <GrGoogle size={24} color='#4285f4' className='pr-2'/> Continue with Google</button>
          <p className='pt-1 text-right text-sm font-extralight text-[#466365]'> Don&apos;t have an account? <Link to='/Signup' ><span className='text-[#9381ff] font-semibold'>Sign Up</span></Link> </p>
        </form>

        
      </div>
    </div>
    </div>
    
  );
}

export default Login;