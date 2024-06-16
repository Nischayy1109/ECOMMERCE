import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  userDetails: null, // Set to null to clearly indicate no user data
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.userDetails = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userDetails = null;
    },
    patchUser(state, action) {
      state.userDetails = { ...state.userDetails, ...action.payload };
    },
    setCurrentUser(state, action) {
      state.isAuthenticated = true;
      state.userDetails = action.payload;
    }
  },
});

export const { login, logout, patchUser, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;