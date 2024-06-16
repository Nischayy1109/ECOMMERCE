import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/userSlice.js';
import { Link, useNavigate } from 'react-router-dom';
import refreshUser from '../../utils/RefreshUser.jsx';
import refreshCart from '../../utils/refreshCart.jsx';
import axios from 'axios';
import { FaBars, FaTimes } from 'react-icons/fa';
import debounce from 'lodash.debounce';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userDetails } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart.items);

  const handleLogout = async () => {
    try {
      await axios.get(`/api/v1/users/logout`, { withCredentials: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    dispatch(logout());
    navigate('/');
    window.location.reload();
  };

  const { refreshUserData } = refreshUser();
  const { refreshCartData } = refreshCart();
  useEffect(() => {
    refreshUserData();
    refreshCartData();
  }, [dispatch]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);
  const cancelTokenSource = useRef(null);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.trim() === '') {
        setSuggestions([]);
        return;
      }

      // Cancel the previous request if it exists
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel('Operation canceled due to new request.');
      }

      // Create a new cancel token
      cancelTokenSource.current = axios.CancelToken.source();

      try {
        const response = await axios.get(`/api/v1/products/search?query=${query}`, {
          cancelToken: cancelTokenSource.current.token,
        });
        setSuggestions(response.data.data || []);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error('Error fetching search suggestions:', error);
          setSuggestions([]);
        }
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(searchQuery);
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery.trim()}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/products/${suggestion._id}`);
    setSuggestions([]); // Hide suggestions after clicking
  };

  const handleClickOutside = (event) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/v1/categories/allcategories/admin`);
        setCategories(response.data.data.docs);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-blue-600 p-4 shadow-md relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={handleMenuToggle} className="text-white mr-4">
            <FaBars className="h-6 w-6" />
          </button>
          <Link to="/" className="text-white text-lg font-bold flex items-center">
            <img src="/path-to-your-logo.png" alt="E-Commerce" className="h-8 mr-2" />
            <span className="hidden md:block">E-Commerce</span>
          </Link>
        </div>

        <div className="relative flex items-center w-full max-w-md mx-4">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow px-4 py-2 rounded-l-md focus:outline-none"
          />
          <button 
            onClick={handleSearch}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-r-md"
          >
            Search
          </button>
          {suggestions.length > 0 && (
            <ul ref={suggestionsRef} className="absolute top-full left-0 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: suggestion.name.replace(
                        new RegExp(searchQuery, 'gi'),
                        (match) => `<b>${match}</b>`
                      )
                    }}
                  ></span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-white hidden md:block">Welcome, {userDetails?.username}</span>
              <Link to="/profile" className="text-white">Profile</Link>
              <button onClick={handleLogout} className="text-white">Logout</button>
            </>
          ) : (
            <Link to="/login" className="text-white">Login</Link>
          )}

          <Link to="/cart" className="text-white relative flex items-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.341 2M6 7h14l1 7H7M7 7l-2-4H3m4 0h14l1 7H7m1 4a2 2 0 11-4 0 2 2 0 014 0zm12 0a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span className="absolute top-0 right-0 inline-block w-4 h-4 bg-red-600 text-white text-xs text-center rounded-full">
              {cartItems.length}
            </span>
          </Link>

          <Link to="/become-seller" className="text-white hidden md:block">Become a Seller</Link>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={handleCloseMenu}>
        <div
          className={`fixed top-0 left-0 bg-white shadow-md w-64 h-full z-60 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()} // Prevents closing the sidebar when clicking inside it
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Categories</h2>
            <button onClick={handleCloseMenu} className="text-black">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <ul className="overflow-y-auto h-full custom-scrollbar">
            {categories.map((category) => (
              <li key={category._id} className="p-4 border-b">
                <Link to={`/category/${category._id}`} className="flex items-center" onClick={handleCloseMenu}>
                  <img src={category.categoryImage} alt={category.name} className="h-6 w-6 mr-2" />
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;