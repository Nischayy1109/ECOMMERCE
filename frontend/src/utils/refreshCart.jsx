import { useDispatch} from "react-redux";
import { setCart } from "../store/slices/cartSlice";
import axios from "axios";

function useRefreshCart() {
  const dispatch = useDispatch();
  //const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const refreshCartData = async () => {
    try {
        const response = await axios.get(`/api/v1/cart/get-detailed-cart`, {
          withCredentials: true,
        });
        // console.log("Cart Data: in psdyags ", response);

        if (response.status === 200) {
          const cartData = response.data.data.products;
          dispatch(setCart(cartData));
          // console.log("Cart Data:", cartData);
        } else {
          console.error("Error fetching cart data");
        }
    } catch (error) {
      console.error("Get Cart failed: ", error);
    }
  };

  return { refreshCartData };
}

export default useRefreshCart;