import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard.jsx';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('query');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(`/api/v1/products/search?query=${query}`);
        // Check if response.data is an array
        console.log('Search results:', response.data.data);
        if (Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          setProducts([]); // Set an empty array if response is not an array
        }
      } catch (error) {
        setError('Error fetching search results.');
        setProducts([]); // Set an empty array in case of an error
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for `{query}`</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p>No products found for `{query}`.</p>
      )}
    </div>
  );
};

export default SearchResults;
