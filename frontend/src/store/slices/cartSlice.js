import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(i => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
    },
    setCart: (state, action) => {
      state.items = action.payload;
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: state => {
      state.items = [];
    },
    decreaseQuantity: (state, action) => {
      const { id } = action.payload;
      const item = state.items.find(item => item.id === id);

      if (item.quantity > 1) {
        item.quantity -= 1;
      }
      else{
        state.items = state.items.filter(item => item.id !== id);
      }
    },
    increaseQuantity: (state, action) => {
      const { id } = action.payload;
      const item = state.items.find(item => item.id === id);

      item.quantity += 1;
    },
  },
});

export const { addItem,setCart,removeItem,clearCart,decreaseQuantity,increaseQuantity } = cartSlice.actions;
export default cartSlice.reducer;