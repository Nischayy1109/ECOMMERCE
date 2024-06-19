import  { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../store/slices/cartSlice";
//import { patchProducts } from "../store/ProductSlice";
//    import Razorpay from 'razorpay';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";

import { Logo } from "../assets/imports/importImages";

import refreshCart from "../utils/refreshCart";
import refreshUser from "../utils/RefreshUser";

function OrderConfirmationn() {
  const { refreshUserData } = refreshUser();
  const { refreshCartData } = refreshCart();

  const user = useSelector((state) => state.user.userDetails);
  console.log("User", user);

  const dispatch = useDispatch();
  useEffect(() => {
    refreshUserData();
    refreshCartData();
  }, [dispatch]);

  const navigate = useNavigate();
  //const [productIds, setProductIds] = useState([]);
  const cart = useSelector((state) => state.cart.items);
  console.log("Cart Items:", cart);

  const [totalPrice, setTotalPrice] = useState(0);
  //const [discount, setDiscount] = useState(0);
  const [resultant, setResultant] = useState(0);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState({});
  const [addressError, setAddressError] = useState("");

  //const [offers, setOffers] = useState();
  //const [showOffers, setShowOffers] = useState(false);
  //const [offerError, setOfferError] = useState("");

  //const [selectedOffer, setSelectedOffer] = useState({});

  useEffect(() => {
    let total = 0;
    cart.forEach((item) => {
      total += item.details.price * item.quantity;
    });
    setTotalPrice(total);

    const gst = parseInt(total * 0.1);
    const shipping = parseInt(total * 0.02);

    setResultant(total  + gst + shipping);

    // const ids = cart.map((item) => item.productId);
    // setProductIds(ids);
  }, [cart]);

  const fetchAddresses = async () => {
    const response = await axios.get("/api/v1/addresses", {
      withCredentials: true,
    });
    console.log(response)
    return response.data.data;
  };

  const {
    data: addressData,
    isLoading: addressLoading,
    isError: isAddressError,
    error: addressErrors,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    retry: 1,
  });


  //Check Availability of Items in the stock
  const checkCartForOrder = async () => {
    try {
      const response = await axios.get(
        "/api/v1/cart/checkOut",
        { withCredentials: true }
      );
      console.log("Check Cart", response);
      return response.data.data;

    } catch (error) {
      throw new Error(error.response?.data?.message);
    }
  };

  const {
    data: checkCartData,
    isLoading: checkCartLoading,
    isError: isCheckCartError,
    error: checkCartErrors,
  } = useQuery({
    queryKey: ["checkOut"],
    queryFn: checkCartForOrder,
    retry: 1,
    staleTime: 1000 * 10,
  });

  useEffect(() => {
    if (isCheckCartError) {
      console.error("Error checking cart ", checkCartErrors);
      setTimeout(() => {
        navigate("/cart");
      }, 1000 * 4);
    }
  }, [isCheckCartError, checkCartErrors, navigate]);

  // Confirm Order

  const emptyCartBackend = async () => {
    try {
      const response = await axios.delete(
        `/api/v1/cart/clear-cart`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 201) {
        console.log("Cart Emptied", response.data);
      }
    } catch (error) {
      console.error("Failed to empty the cart:", error);
    }
  };

  const createOrderBackend = async (transactionId) => {
      const response = await axios.post(
        "/api/v1/orders/create",
        {
          orderId: checkCartData.orderId,
          address: selectedAddress._id,
          transactionId,
          total: resultant,
        },
        {
          withCredentials: true,
        }
      )
      console.log(response);
  };

  const createOrderItemsBackend = async (orderId) => {
      cart.forEach(async (item) => {
        const response = await axios.post(
          "/api/v1/orderItems/create",
          {
            orderID: orderId,
            productID: item.details.productId,
            sellerInfo: item.details.sellerInfo,
            quantity: item.quantity,
            price: item.details.price * item.quantity,
          },
          {
            withCredentials: true,
          }
        );
        console.log("Order Items", response.data.data);
        //patchProducts({ _id: item.productId, quantity: item.quantity });
        return response.data.data;
      })
  };

  const checkoutHandler = async (key, orderIdMongoose) => {
    const response = await axios.post(
      "/api/v1/payments/createOrder",
      {
        amount: resultant,
        orderId: orderIdMongoose,
      },
      {
        withCredentials: true,
      }
    );
    console.log("Response", response);
    const orders = response.data.data;
    console.log("Orders", response.data.data);
    //console.log("Key", key);
    //console.log("Order ID", orderIdMongoose);
    console.log(user)
    var options = {
        key:'rzp_test_ovFL8qYfLKvSgy',
        //console.log("key", key),
        amount: resultant,
        currency: "INR",
        name: "BISARIYON ECOM",
        description: "Purchase from Bisariyon E-Com",
        image: Logo,
        order_id: response.data.data.orders.id,
      handler: async function (response) {
        //console.log("fejrbrniu3r")
        const body = {
          ...response,
          order_id: orders.id,
        };
        console.log("Response", response);
        console.log("Response body", body);

        try {
          const validateRes = await axios.post(
            "/api/v1/payments/verifyPayment",
            body,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          const jsonRes = validateRes.data;
          console.log("JsonRes", jsonRes);

          // Logic to create Order
          createOrderBackend(jsonRes.data.transactionId);
          createOrderItemsBackend(orderIdMongoose);
          emptyCartBackend();

          dispatch(clearCart());
          navigate("/payment-success", {
            state: { transactionId: jsonRes.data.transactionId },
          });
        } catch (error) {
          navigate("/payment-failure", { state: { error: response } });
        }
        
      },
      //console.log(user)
      prefill: {
        name: user.fullName,
        email: user.email,
        contact: user.phone,
      },
      notes: {
        address: "ECOMM DELHI",
      },
      theme: {
        color: "#012652",
      },
      retry: {
        enabled: false,
      },
    };

    console.log("Options", options);

    //console.log(window.Razorpay); // Check if Razorpay object is defined


    const razor = new window.Razorpay(options);

    razor.on("payment.failed", async function (error) {
      // console.log("Error : ", error.error);

      try {
        const res = await axios.post(
          "/api/v1/payments/paymentfailure",
          {
            response: error.error,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        navigate("/user/payment-failure", { state: { error: res.data } });
      } catch (error) {
        console.error("Error while sending payment failure data:", error);
      }
    });

    razor.open();
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress._id) {
      setAddressError("Please select an address to proceed!");
      return;
    }

    try {
      const response = await axios.post(
        "/api/v1/payments/getKeys",
        {},
        { withCredentials: true }
      );
      const key = response.data.data;
      console.log("check cart data", checkCartData)
      const orderIdMongoose = checkCartData;
      console.log("Key", key);
      console.log("Order ID", orderIdMongoose);
      checkoutHandler(key, orderIdMongoose);
    } catch (error) {
      console.error("Error fetching payment keys: ", error);
    }
  };

  if (checkCartLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <img
          src="https://res.cloudinary.com/deepcloud1/image/upload/v1717078915/crmi2yw34sh7sldgmxo9.png"
          alt="Loading"
          className="mb-4 w-64 h-auto"
        />
        <div className="text-3xl text-gray-700">
          Checking Availability of Items in the stock...
        </div>
      </div>
    );
  }

  if (isCheckCartError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <img
          src="https://res.cloudinary.com/deepcloud1/image/upload/v1717079336/f2hoqv8uvksdghgzo6dq.jpg"
          alt="Loading"
          className="mb-4 w-64 h-auto"
        />
        <div className="text-red-500 text-3xl my-0 text-center">
          {checkCartErrors.message}
        </div>
      </div>
    );
  }

  // console.log("Order ID", checkCartData);
  // console.log("Selected Address", offers);

  return (
    <div className="-mb-8 bg-purple-300 pb-16">
      <div className="p-4 rounded-lg ">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
          onClick={() => setShowAddress(!showAddress)}
        >
          {showAddress ? "Hide Addresses" : "Select Address"}
        </button>

        {showAddress && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 hover:cursor-pointer">
            {addressData && addressData.length === 0 && (
              <Link to="/user/profile">
                <div className="rounded-lg shadow-md p-4 bg-white">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    No Address Found
                  </h3>
                  <p className="text-sm text-gray-700">
                    Please add an address to proceed
                  </p>
                </div>
              </Link>
            )}

            {addressData &&
              addressData.length > 0 &&
              addressData.map((address, index) => (
                <div
                  key={address._id}
                  className="rounded-lg shadow-md p-4 bg-white hover:bg-green-200 duration-100 ease-in-out transform hover:scale-95 transition-all"
                  onClick={() => {
                    setSelectedAddress(address);
                    setShowAddress(false);
                    setAddressError("");
                  }}
                >
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Address {index + 1}
                  </h3>
                  <div className="text-sm">
                    <p className="hidden">{address._id}</p>
                    <p>{address.addressLine1}</p>
                    <p>{address.addressLine2}</p>
                    <p>{address.city}</p>
                    <p>{address.zipcode}</p>
                    <p>{address.country}</p>
                    <p>{address.phoneNumber}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="py-4 my-2 px-8 rounded-lg mb-8 max-w-md mx-auto mt-1 bg-gradient-to-r from-green-200 via-green-100 to-green-200 shadow-lg">
        <div className="my-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Order Summary:
          </h2>
          <div className="flex gap-6 my-1">
            <div>
              <p className="text-sm text-gray-700 font-semibold">
                Total Price:
              </p>
              <p className="text-sm text-gray-700 font-semibold">GST (10%):</p>
              <p className="text-sm text-gray-700 font-semibold">
                Shipping Charges (2%):
              </p>
              <p className="text-sm text-gray-700 font-semibold">Resultant:</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-semibold">
                ₹ {totalPrice}
              </p>
              <p className="text-sm text-blue-600 font-semibold">
                ₹ {parseInt(totalPrice * 0.1)}
              </p>
              <p className="text-sm text-blue-600 font-semibold">
                ₹ {parseInt(totalPrice * 0.02)}
              </p>
              <p className="text-sm text-blue-600 font-semibold">
                ₹ {resultant}
              </p>
            </div>
          </div>
        </div>

        {selectedAddress && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Selected Address:
            </h2>
            <div className="text-sm text-gray-700 p-2 border border-green-300 rounded-lg bg-white shadow-inner">
              <p className="hidden">{selectedAddress._id}</p>
              <p>{selectedAddress.addressLine1}</p>
              <p>{selectedAddress.addressLine2}</p>
              <p>{selectedAddress.zipCode}</p>
              <p>{selectedAddress.city}</p>
              <p>{selectedAddress.country}</p>
              <p>{selectedAddress.phoneNumber}</p>
            </div>
          </div>
        )}
        {addressError && (
          <span className="text-red-500 text-sm my-0">{addressError}</span>
        )}


        <div className="flex flex-col items-center gap-4 mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform active:scale-105 shadow-md"
            onClick={handleConfirmOrder}
          >
            Proceed to Payment
          </button>

          <div className="text-center">
            <p className="text-md text-gray-700 font-bold">
              To Pay ₹{resultant}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationn;

//hellp