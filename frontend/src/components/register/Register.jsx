import {  useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link,useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [fullName, setfullName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [coverImage, setcoverImage] = useState(null);
  const [username,setUsername] = useState("");
  const [phone,setPhone] = useState("");

//   const handleFileInputChange = (e) => {
//     const file = e.target.files[0];
//     setcoverImage(file);
//   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Registering user...");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("coverImage", coverImage);


    try {
      const response = await axios.post('/api/v1/users/register',formData, { withCredentials: true });

      toast.success(response.data.message);
      setfullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setUsername("");
      setcoverImage(null);
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.log(error);
    }
  };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Register as a new user
            </h2>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="text"
                    //   autoComplete="text"
                      required
                      value={fullName}
                      onChange={(e) => setfullName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
    
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                {/* Phone NUmber */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile No.
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="phone"
                      autoComplete="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
    
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={visible ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    htmlFor="coverImage"
                    className="block text-sm font-medium text-gray-700"
                  ></label>
                  <div className="mt-2 flex items-center">
                    <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt="avatar"
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
                onChange={(e) => setcoverImage(e.target.files[0])}
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
                <div className={`${styles.noramlFlex} w-full`}>
                  <h4>Already have an account?</h4>
                  <Link to="/login" className="text-blue-600 pl-2">
                    Sign In
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

export default Register;