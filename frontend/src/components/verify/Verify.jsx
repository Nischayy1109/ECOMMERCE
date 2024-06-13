import axios from 'axios';
import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function Verify() {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const navigate = useNavigate();
  const handleSubmit = async(e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    try {
        await axios.post('api/v1/users/verify-user-otp', { otp: otpValue });
        toast.success('OTP verified successfully!');
        navigate('/');
        window.location.reload(true);
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occurred')
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move focus to the next input
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Add logic to verify the OTP
//     const otpValue = otp.join('');
//     console.log('OTP submitted:', otpValue);
//   };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 text-center border border-gray-300 rounded-lg shadow-lg">
        <ToastContainer/>
      <h1 className="text-2xl font-bold mb-4">Verify Your Account</h1>
      <p className="mb-6">We have sent an OTP to your registered email!</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {otp.map((digit, index) => (
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
        <button type="submit" className="py-2 px-4 text-lg text-white bg-blue-500 rounded-md hover:bg-blue-600" onChange={()=>{handleSubmit}}>
          Verify
        </button>
      </form>
    </div>
  );
}

export default Verify;