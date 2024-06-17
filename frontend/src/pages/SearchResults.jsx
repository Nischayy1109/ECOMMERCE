import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard.jsx';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { FaStar } from 'react-icons/fa';
//import { FaStar } from 'react-icons/fa';

// Inside the map function for the stars



const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(`/api/v1/products/search?query=${query}`);
        console.log('Search results:', response.data.data);
        if (Array.isArray(response.data.data)) {
          setProducts(response.data.data);
          setFilteredProducts(response.data.data);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        setError('Error fetching search results.');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = products.filter(product => 
        product.price >= priceRange[0] && 
        product.price <= priceRange[1] &&
        product.rating >= rating
      );
      setFilteredProducts(filtered);
      console.log('Filtered products:', filtered);
    };

    applyFilters();
  }, [priceRange, rating, products]);

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleRatingChange = (value) => {
    setRating(value);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex">
        <aside className="w-1/4 pr-4">
          <h2 className="text-6xl text-center font-bold mb-4">FILTERS</h2>
          <br/>
          <hr/>
          <br/>
          <div className="mb-4">
            <label className="text-3xl block mb-2">Price Range</label>
            <Slider
              range
              min={0}
              max={100000}
              defaultValue={priceRange}
              onChange={handlePriceChange}
              value={priceRange}
            />
            <div className="text-xl flex justify-between mt-2">
              <span>{priceRange[0]}</span>
              <span>{priceRange[1]}</span>
            </div>
          </div>
          <br/>
          <hr/>
          <br/>
          <div className="mb-4">
            <label className="text-3xl block mb-2">Rating</label>
            <div className="flex flex-col">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`flex items-center mb-2 ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                  onClick={() => handleRatingChange(star)}
                >
                  {Array(star).fill().map((_, i) => (
                    <FaStar key={i} size={28} />
                  ))}
                  <span className="ml-2"></span>
                </button>
              ))}
            </div>
          </div>
        </aside>
        <main className="w-3/4">
          <h1 className="text-2xl font-bold mb-4">Search Results for `{query}`</h1>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p>No products found for `{query}`.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
