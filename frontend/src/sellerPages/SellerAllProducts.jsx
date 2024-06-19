import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SellerAllProducts.css'; // Make sure to create a corresponding CSS file for styling

const SellerAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/products/seller'
        ,{withCredentials: true});
        // console.log('Products:', response.data.data);
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products. Please try again later.');
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="products-list">
      {products.map(product => (
        <div key={product._id} className="product-item">
          <img src={product.productImages[0]} alt={product.name} className="product-image" />
          <div className="product-details">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-quantity">Stock: {product.stock}</p>
            <p className="product-price">Price: ₹ {product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SellerAllProducts;