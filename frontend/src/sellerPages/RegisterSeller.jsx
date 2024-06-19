import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../styles/styles.js";
import { RxAvatar } from "react-icons/rx";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const SellerRegister = () => {
  const navigate = useNavigate();
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPassword, setSellerPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [sellerImage, setSellerImage] = useState(null);
  const [sellerUsername, setSellerUsername] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerGST, setSellerGST] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Registering seller...");

    const formData = new FormData();
    formData.append("sellerName", sellerName);
    formData.append("sellerUsername", sellerUsername);
    formData.append("sellerEmail", sellerEmail);
    formData.append("sellerPhone", sellerPhone);
    formData.append("sellerPassword", sellerPassword);
    formData.append("sellerAddress", sellerAddress);
    formData.append("sellerImage", sellerImage);
    formData.append("sellerGST", sellerGST);
    // formData.append("seller", address);
    console.log(formData);

    try {
      const response = await axios.post('/api/v1/sellers/register', formData, { withCredentials: true });

      toast.success(response.data.message);
      setSellerName("");
      setSellerEmail("");
      setSellerPassword("");
      setSellerPhone("");
      setSellerUsername("");
      setSellerImage(null);
      setSellerGST("");
      setSellerAddress("");
      navigate("/seller/login");
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "An error occurred");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register as a new seller
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="sellerName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="sellerName"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="sellerUsername"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="sellerUsername"
                  required
                  value={sellerUsername}
                  onChange={(e) => setSellerUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="sellerEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="sellerEmail"
                  required
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="sellerPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile No.
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="sellerPhone"
                  required
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="sellerPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? "text" : "password"}
                  name="sellerPassword"
                  required
                  value={sellerPassword}
                  onChange={(e) => setSellerPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="sellerGST"
                className="block text-sm font-medium text-gray-700"
              >
                GST No.
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="sellerGST"
                  required
                  value={sellerGST}
                  onChange={(e) => setSellerGST(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="sellerAddress"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="sellerAddress"
                  required
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
                  <label
                    htmlFor="sellerImage"
                    className="block text-sm font-medium text-gray-700"
                  ></label>
                  <div className="mt-2 flex items-center">
                    <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                      {sellerImage ? (
                        <img
                          src={sellerImage}
                          alt="sellerImage"
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <RxAvatar className="h-8 w-8" />
                      )}
                    </span>
                    <label
                      htmlFor="file-input"
                      className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <span>Upload a file</span>
                      <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSellerImage(e.target.files[0])}
              />
                    </label>
                  </div>
                </div>
            <div>
              <button
                type="submit"
                className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
            <div className={`${styles.normalFlex} w-full`}>
              <h4>Already have an account?</h4>
              <Link to="/seller/login" className="text-blue-600 pl-2"> Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;