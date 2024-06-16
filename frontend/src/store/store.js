import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice.js';
import cartReducer from './slices/cartSlice.js';

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
});

export default store;
