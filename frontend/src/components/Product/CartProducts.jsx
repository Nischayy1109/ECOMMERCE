import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from 'prop-types';
import {
  decreaseQuantity,
  increaseQuantity,
  removeItem,
} from "../../store/slices/cartSlice";
import axios from "axios";
import useRefreshCart from "../../utils/refreshCart.jsx";

function CartProduct({ productId, name, price, productImages, quantity }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const { refreshCartData } = useRefreshCart();
  const [localQuantity, setLocalQuantity] = useState(quantity);

  useEffect(() => {
    refreshCartData();
  }, []);

  const addToCartBackend = async () => {
    try {
      const response = await axios.post(
        `/api/v1/cart/addto-cart`,
        { productId },
        { withCredentials: true }
      );
      if (response.status === 201) {
        console.log("Added to cart:", response.data);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const updateCartBackend = async (newQuantity) => {
    try {
      const response = await axios.put(
        `/api/v1/cart/update`,
        { productId, quantity: newQuantity },
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log("Cart updated:", response.data);
        setLocalQuantity(newQuantity); // Update local state
        return true; // Return success status
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
    return false; // Return failure status
  };

  const removeFromCartBackend = async () => {
    try {
      const response = await axios.delete(
        `/api/v1/cart/delete/${productId}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("Removed from cart:", response.data);
        dispatch(removeItem({ productId }));

        refreshCartData(); // Refresh the cart data
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const decrease = async () => {
    if (localQuantity > 1) {
      const success = await updateCartBackend(localQuantity - 1);
      if (success) {
        dispatch(decreaseQuantity({ productId }));
        refreshCartData(); // Refresh the cart data
      }
    }
  };

  const increase = async () => {
    const success = await updateCartBackend(localQuantity + 1);
    if (success) {
      dispatch(increaseQuantity({ productId }));
      refreshCartData(); // Refresh the cart data
    }
  };

  const remove = async () => {
    await removeFromCartBackend();
  };

  return (
    <div
      id={productId}
      className="flex items-start border-b border-gray-200 py-4 bg-green-100 p-4 rounded-lg shadow-md"
    >
      <div className="w-32 h-32 bg-gray-200 rounded-lg mr-4 overflow-hidden">
        <img
          src={productImages}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-sm font-bold text-green-700">{name}</div>
          <div className="flex items-center mt-1">
            <span className="text-sm font-semibold text-gray-700 mr-2">
              Price:
            </span>
            <span className="text-sm text-green-600 font-bold">
              ₹ {parseFloat(price)}
            </span>
          </div>
        </div>

        <div className="flex items-center mt-4">
          <div className="flex items-center">
            <button
              className="bg-red-500 text-white px-2 py-1 rounded-l-md hover:bg-red-600 transition duration-300 ease-in-out"
              onClick={decrease}
            >
              -
            </button>
            <div className="bg-gray-100 text-gray-700 px-2 py-1 text-base">
              {localQuantity}
            </div>
            <button
              className="bg-cyan-500 text-white px-2 py-1 rounded-r-md hover:bg-cyan-600 transition duration-300 ease-in-out"
              onClick={increase}
            >
              +
            </button>
          </div>

          <button
            className="ml-4 bg-blue-500 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-600 transition duration-300 ease-in-out"
            onClick={remove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

CartProduct.propTypes = {
  productId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  productImages: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
};

export default CartProduct;
