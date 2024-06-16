import { useDispatch } from "react-redux";
import { setCurrentUser } from '../store/slices/userSlice.js';
import axios from "axios";

function useRefreshUser() {
    const dispatch = useDispatch();

    const refreshUserData = async () => {
        try {
            const response = await axios.get(
                `/api/v1/users/current-user`,
                { withCredentials: true }
            );

            // console.log("REFRESH USER DATA", response.data.data);
            if (response.status === 200) {
                dispatch(setCurrentUser(response.data.data));
            } else {
                console.log("Error fetching current user data");
                console.log("ERR IN REFRESH USER!!!");
            }
        } catch (error) {
            console.log("Failed to fetch user data in REFRESH USER", error);
        }
    }

    return { refreshUserData };
}

export default useRefreshUser;
