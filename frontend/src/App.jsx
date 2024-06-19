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
import OrderConfirmationn from './pages/OrderConfirmationn.jsx';
//import ProfilePage from './pages/ProfilePage.jsx';

import LoginSeller from './components/../sellerPages/LoginSeller.jsx';
import RegisterSeller from './components/../sellerPages/RegisterSeller.jsx';
import VerifySeller from './components/../sellerPages/VerifySeller.jsx';
import SellerDashboard from './components/../sellerPages/SellerDashboard.jsx';
import UserDetails from './pages/UserDetails.jsx';
import { useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
});

function Layout({ children }) {
  const location = useLocation();
  const noHeaderFooterPaths = ['/seller/login', '/seller/register', '/seller/verify', '/seller/dashboard'];

  const showHeaderFooter = !noHeaderFooterPaths.includes(location.pathname);

  return (
    <>
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>

        <BrowserRouter>
          <Layout> {/* Render the Header component here */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:productId" element={<ProductPage />} /> {/* Correct usage of ProductPage */}
            <Route path="/category/:categoryId" element={<CategoryPage/>} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationn />} />
            {/* <Route path="/profile" element={<ProfilePage/>} /> */}
            <Route path="/profile" element={<UserDetails />} />
            <Route path="/seller/login" element={<LoginSeller />} />
            <Route path="/seller/register" element={<RegisterSeller />} />
            <Route path="/seller/verify" element={<VerifySeller />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
          </Routes>
          </Layout>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
