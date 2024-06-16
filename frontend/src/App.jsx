// App.jsx
// import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage, RegisterPage, VerifyPage, HomePage,CartPage } from "./Routes.js";
import ProductPage from './components/Product/ProductPage.jsx'; // Correct import of ProductPage
import CategoryPage from './components/Category/CategoryPage.jsx'; // Import the CategoryPage component
import store from './store/store.js';
import { Provider } from 'react-redux';
import Header from './components/LayOut/Header.jsx';
import SearchResults from "./pages/SearchResults.jsx" // Import the Header component
import Footer from './components/LayOut/Footer.jsx';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Header /> {/* Render the Header component here */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:productId" element={<ProductPage />} /> {/* Correct usage of ProductPage */}
          <Route path="/category/:categoryId" element={<CategoryPage/>} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
        <Footer/>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
