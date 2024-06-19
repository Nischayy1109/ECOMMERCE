// src/store/slices/sellerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  seller: null,
  isAuthenticatedSeller: false,
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    loginSeller: (state, action) => {
      state.seller = action.payload;
      state.isAuthenticatedSeller = true;
    },
    logoutSeller: (state) => {
      state.seller = null;
      state.isAuthenticatedSeller = false;
    },
    setCurrentSeller: (state, action) => {
      state.seller = action.payload;
    },
  },
});

export const { loginSeller, logoutSeller,setCurrentSeller } = sellerSlice.actions;

export default sellerSlice.reducer;