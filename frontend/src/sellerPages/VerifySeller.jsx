import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function SellerVerify() {
  const [otpp, setOtpp] = useState(Array(6).fill(''));
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otpp.join('');
    try {
      console.log("OTP Value",otpValue);
      const response = await axios.post('http://localhost:8000/api/v1/sellers/verify-seller-otp', { otp: otpValue }, { withCredentials: true });
      
      toast.success('OTP verified successfully!');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otpp];
      newOtp[index] = value;
      setOtpp(newOtp);
      // Move focus to the next input
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 text-center border border-gray-300 rounded-lg shadow-lg">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Verify Your Seller Account</h1>
      <p className="mb-6">We have sent an OTP to your registered email!</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {otpp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              maxLength="1"
              className="w-10 h-10 text-center text-lg border border-gray-300 rounded-md"
              required
            />
          ))}
        </div>
        <button type="submit" className="py-2 px-4 text-lg text-white bg-blue-500 rounded-md hover:bg-blue-600">
          Verify
        </button>
      </form>
    </div>
  );
}

export default SellerVerify;