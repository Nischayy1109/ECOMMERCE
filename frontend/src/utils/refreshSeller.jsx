import { useCallback } from 'react';
import { useDispatch } from "react-redux";
import { setCurrentSeller } from '../store/slices/sellerSlice';
import axios from "axios";

function useRefreshSeller() {
    const dispatch = useDispatch();

    const refreshSellerData = useCallback(async () => {
        try {
            const response = await axios.get(
                'http://localhost:8000/api/v1/sellers/current-seller',
                { withCredentials: true }
            );
            console.log("RESP",response);

            // console.log("REFRESH SELLER DATA", response.data.data);
            if (response.status === 200) {
                dispatch(setCurrentSeller(response.data.data));

            } else {
                console.log("Error fetching current seller data");
            }
        } catch (error) {
            console.log("Failed to fetch seller data in REFRESH SELLER", error);
        }
    }, [dispatch]); // Note: dependencies array contains `dispatch`

    return { refreshSellerData };
}

export default useRefreshSeller;