import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SellerEditProduct = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryName: '',
        price: '',
        stock: '',
        // productImages: null
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/products/seller', { withCredentials: true });
                setProducts(response.data.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to fetch products. Please try again later.');
            }
        };
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
        fetchProducts();
    }, []);
    const findNameById = (id) => {
        const category = categories.find((category) => category._id === id);
        return category ? category.name : "";
    }

    const handleProductSelect = async (productId) => {
        const product = products.find(product => product._id === productId);
        setSelectedProduct(product);
        console

        setFormData({
            name: product.name,
            description: product.description,
            categoryName: product.categoryId.name,
            price: product.price,
            stock: product.stock,
            // productImages: product.productImages
        });
        // console.log("Selected :",product.categoryId.name);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // const handleFileChange = (e) => {
    //     setFormData({
    //         ...formData,
    //         productImages: e.target.files,
    //     });
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = new FormData();
        for (const key in formData) {
            if (key === "productImages") {
                for (let i = 0; i < formData.productImages.length; i++) {
                    productData.append("productImages", formData.productImages[i]);
                }
            } else {
                productData.append(key, formData[key]);
            }
        }
        for (const pair of productData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }
        

        try {
            await axios.put(`http://localhost:8000/api/v1/products/update/${selectedProduct._id}`, productData, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            });
            alert("Product updated successfully!");
            setFormData({
                name: "",
                description: "",
                categoryName: "",
                price: "",
                stock: "",
                // productImages: null,
            });
        } catch (error) {
            console.error("Error updating product:", error);
            setError('Failed to update product. Please try again later.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-lg"
            >
                <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

                {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                <div className="mb-4">
                    <label className="block text-gray-700">Select Product</label>
                    <select
                        onChange={(e) => handleProductSelect(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    >
                        <option value="" disabled>Select a product</option>
                        {products.map(product => (
                            <option key={product._id} value={product._id}>{product.name}</option>
                        ))}
                    </select>
                </div>

                {selectedProduct && (
                    <>
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
                                name="category"
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

                        {/* <div className="mb-4">
                            <label className="block text-gray-700">Product Images</label>
                            <input
                                type="file"
                                name="productImages"
                                onChange={handleFileChange}
                                className="w-full"
                                multiple
                                required
                            />
                        </div> */}

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                        >
                            Update Product
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default SellerEditProduct;