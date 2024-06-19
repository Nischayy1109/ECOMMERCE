import React, { useState, useEffect } from "react";
import axios from "axios";

const SellerAddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryName: "",
    price: "",
    stock: "",
    productImages: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/categories/allcategories/admin");
        // console.log("Categoriesasdqw:", response.data.data.docs);
        setCategories(response.data.data.docs);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      productImages: e.target.files,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = new FormData();
    for (const key in formData) {
        // console.log("Key:", key);
        // console.log("Value:", formData[key])
      if (key === "productImages") {
        
        for (let i = 0; i < formData.productImages.length; i++) {
          productData.append("productImages", formData.productImages[i]);
        }
      } else {
        productData.append(key, formData[key]);
      }
    }
    for (let pair of productData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }

    try {
      await axios.post("http://localhost:8000/api/v1/products/createProduct", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });
      alert("Product registered successfully!");
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        productImages: null,
      });
    } catch (error) {
      console.error("Error registering product:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold mb-6">Register New Product</h1>

        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Category</label>
          <select
            name="categoryName"
            value={formData.categoryName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Quantity in Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Product Images</label>
          <input
            type="file"
            name="productImages"
            onChange={handleFileChange}
            className="w-full"
            multiple
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Register Product
        </button>
      </form>
    </div>
  );
};

export default SellerAddProduct;