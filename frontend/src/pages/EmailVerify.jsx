import React, { useRef } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const navigate = useNavigate();
  
  const inputRef = useRef([]);
  const handleInput = (e,index)=>{
    if (e.target.value.length > 0 && index < inputRef.current.length-1) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e,index)=>{
    if(e.key === 'Backspace' && e.target.value === '' && index > 0) {
       inputRef.current[index - 1].focus();
    }
  }
 
  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify Otp
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6 digit code sent to your email address
        </p>
        <div className="flex justify-between mb-8">
          {Array(6)
            .fill()
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-lg rounded-md"
                ref={e =>inputRef.current[index] = e}
                onInput={(e)=> handleInput(e,index)}
                onKeyDown={e=>handleKeyDown(e,index)}
              />
            ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
          Verify Email
        </button>
      </form>
    </div>
  );
}

export default EmailVerify
