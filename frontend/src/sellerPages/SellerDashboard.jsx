import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logoutSeller } from "../store/slices/sellerSlice";
import SellerAddProduct from "./SellerAddProduct.jsx";
import SellerEditProduct from "./SellerEditProduct.jsx";
import SellerAllProducts from "./SellerAllProducts.jsx";
import  useRefreshSeller  from "../utils/refreshSeller.jsx";
import SellerOrders from "./SellerOrders.jsx";
// import { Profile } from "./Profile";

const SellerDashboard = () => {
  const { refreshSellerData } = useRefreshSeller();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState("profile");

  useEffect(() => {
    refreshSellerData();
}, [refreshSellerData]);

  const seller = useSelector((state) => state.seller.seller);
  console.log(seller);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/api/v1/sellers/logout', { withCredentials: true });
      dispatch(logoutSeller());
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };
  // useEffect(() => {
  //   if (!seller) {
  //     navigate("/seller/login");
  //   }
  // }, [seller, navigate]);

  const renderContent = () => {
    switch (selectedOption) {
    //   case "profile":
        // return <Profile />
        case "logout":
            handleLogout();
            return null;
        case "allProducts":
            return <SellerAllProducts />;
        case "addProduct":
            return <SellerAddProduct />;
        case "editProduct":
            return <SellerEditProduct />;
        case "orders":
            return <SellerOrders />;
      default:
        // return <Profile />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 lg:w-1/5 bg-gray-800 text-white p-4">
        <div className="flex flex-col items-center mb-6">
          <img
            src={seller?.sellerImage}
            alt="Avatar"
            className="rounded-full w-24 h-24 mb-4"
          />
          <h2 className="text-2xl font-bold text-cyan-500 text-center">
            Hi, {seller?.sellerName}
          </h2>
        </div>
        <ul className="space-y-4">
          {[
            { label: "Profile", option: "profile" },
            { label: "All Products", option: "allProducts" },
            { label: "View Orders", option: "orders" },
            { label: "Add Product", option: "addProduct"},
            { label: "Edit Product", option: "editProduct"},
            { label: "Logout", option: "logout" },
          ].map((item) => (
            <li
              key={item.option}
              className={`px-4 py-2 cursor-pointer rounded-md hover:bg-gray-700 transition-all ${
                selectedOption === item.option
                  ? "font-bold text-cyan-500 bg-gray-700"
                  : ""
              }`}
              onClick={() => setSelectedOption(item.option)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white p-8 rounded-md shadow-md">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SellerDashboard;