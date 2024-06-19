import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice.js';
import cartReducer from './slices/cartSlice.js';
import sellerReducer from './slices/sellerSlice.js';

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    seller : sellerReducer,
  },
});

export default store;
