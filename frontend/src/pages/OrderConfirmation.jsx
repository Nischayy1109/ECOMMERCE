import { useLocation, useNavigate } from "react-router-dom";

function OrderConfirmation() {
  const location = useLocation();
  const { orderId, subtotal, cart } = location.state;
  const navigate = useNavigate();

  const handlePayment = () => {
    // Implement payment logic here
    console.log("Proceed to payment");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-16"> {/* Adjusted margin-top */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg"> {/* Increased max-width */}
        <h2 className="text-3xl font-bold mb-6">Order Confirmation</h2> {/* Increased text size */}
        <p className="text-gray-700 mb-6">Order ID: {orderId}</p>
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-4">Order Summary</h3> {/* Increased text size */}
          <ul className="divide-y divide-gray-200">
            {cart.map((product) => (
              <li key={product.productId} className="py-6 flex items-center space-x-4">
                <div className="rounded-lg overflow-hidden border border-gray-300 w-24 h-24 flex-shrink-0">
                  <img
                    className="object-cover w-full h-full"
                    src={product.details.productImages[0]}
                    alt={product.details.name}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-lg font-medium text-gray-900">{product.details.name}</p> {/* Increased text size */}
                  <p className="text-base text-gray-500">Quantity: {product.quantity}</p> {/* Increased text size */}
                  <p className="text-base text-gray-500">Price: ₹ {product.details.price}</p> {/* Increased text size */}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between font-semibold text-xl mt-6"> {/* Increased text size */}
          <div>Total:</div>
          <div>₹ {subtotal}</div>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-xl w-full mt-8"
          onClick={handlePayment}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;
