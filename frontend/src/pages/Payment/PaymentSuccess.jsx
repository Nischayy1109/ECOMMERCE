import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import refreshCart from "../../utils/refreshCart";
import refreshUser from "../../utils/RefreshUser";

function PaymentSuccess() {
  const { refreshUserData } = refreshUser();
  const { refreshCartData } = refreshCart();

  useEffect(() => {
    refreshUserData();
    refreshCartData();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId } = location.state || {};

  const handler = () => {
    navigate("/");
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 bg-blue-100">
      <img
        src="https://res.cloudinary.com/deepcloud1/image/upload/v1716662086/y7ihf1nqfb38dyqoqpqw.png"
        alt="Payment Success"
        className="h-auto"
      />
      <div className="text-2xl text-green-500">Payment Success</div>
      <div className="text-gray-700 text-center">
        {transactionId && (
          <p className="mb-1">
            <strong>Transaction ID:</strong> {transactionId}
          </p>
        )}
      </div>
      <div className="mb-4 mt-2">
        <button
          onClick={() => handler()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go back to home page
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;