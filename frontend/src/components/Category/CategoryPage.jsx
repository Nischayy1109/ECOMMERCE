import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../Product/ProductCard.jsx';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const categoryResponse = await axios.get(`/api/v1/categories/${categoryId}`, { withCredentials: true });
        console.log('Category response:', categoryResponse.data.data); // Debugging line
        setCategory(categoryResponse.data.data);

        // Fetch products by category
        const productsResponse = await axios.get(`/api/v1/products/category/${categoryId}`, { withCredentials: true });
        console.log('Products response:', productsResponse.data.data.docs); // Debugging line
        setProducts(productsResponse.data.data.docs || []); // Ensure it's an array
      } catch (error) {
        console.error('Failed to fetch category or products:', error);
      }
    };

    fetchCategory();
  }, [categoryId]);

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-4">
      <h1 className="text-4xl font-bold uppercase">{category.name}</h1>
      <img src={category.categoryImage} alt={category.name} className="w-full h-96 object-contain mt-4" />
      <p className="mt-4 text-lg">{category.description}</p>

      <h2 className="text-2xl font-bold mt-8">Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>No products found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
