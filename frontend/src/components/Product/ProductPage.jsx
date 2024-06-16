import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState(null); // For handling file input

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productResponse = await axios.get(`/api/v1/products/p/${productId}`, { withCredentials: true });
        setProduct(productResponse.data.data);
        setMainImage(productResponse.data.data.productImages[0]);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const reviewsResponse = await axios.get(`/api/v1/reviews/get-reviews/${productId}`, { withCredentials: true });
        setReviews(reviewsResponse.data.data);
        const totalRating = reviewsResponse.data.data.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(totalRating / reviewsResponse.data.data.length);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [productId]);

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const openModal = (image) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setReviewImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create form data
    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    if (reviewImage) {
      formData.append("reviewImage", reviewImage);
    }

    try {
      // POST review data to your API endpoint
      const response = await axios.post(`/api/v1/reviews/post-review/${productId}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle success, update state or show success message
      console.log("Review submitted:", response.data);
      // Optionally, fetch updated reviews and update state
      // fetchReviews(); // Example: Update reviews state after submitting

      // Reset form fields after successful submission
      setRating(0);
      setComment("");
      setReviewImage(null);
      // Optionally close modal or show success message
      setIsModalOpen(false);
      window.location.reload()
    } catch (error) {
      console.error("Failed to submit review:", error);
      // Handle error, show error message to user
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4 mt-4">
        <div className="flex flex-col md:flex-row">
          {/* Left side: Product images */}
          <div className="md:w-1/2">
            <div className="w-full h-96 mb-4">
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {product.productImages.map((image, index) => (
                <div key={index} className="w-24 h-24">
                  <img
                    src={image}
                    alt={`${product.name} ${index}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => handleThumbnailClick(image)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right side: Product details */}
          <div className="md:w-1/2 md:pl-4 flex flex-col justify-center">
            <h1 className="text-4xl font-bold uppercase">{product.name}</h1>
            <p className="text-gray-500 text-sm mt-2">{`Sold by: ${product.sellerInfo.sellerName} (GST: ${product.sellerInfo.sellerGST})`}</p>
            <p className="text-lg mt-4">{product.description}</p>
            <br />
            <p className="mt-2 font-bold" style={{ textTransform: 'uppercase' }}>
  Category: <Link to={`/category/${product.categoryId._id}`} className="text-blue-500 hover:underline">{product.categoryId.name}</Link>
</p>

            {product.stock > 0 ? <p className="font-bold" style={{ textTransform: 'uppercase' }}>Quantity: {product.stock}</p> : <p className="font-bold" style={{ textTransform: 'uppercase' }}>Out of Stock</p>}
            {/* Ratings Section */}
            <div className="flex items-center mt-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`h-8 w-8 ${i < averageRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.114 3.429a1 1 0 00.95.69h3.6c.969 0 1.371 1.24.588 1.81l-2.9 2.11a1 1 0 00-.364 1.118l1.114 3.43c.3.92-.755 1.688-1.54 1.118l-2.9-2.11a1 1 0 00-1.176 0l-2.9 2.11c-.784.57-1.838-.198-1.54-1.118l1.114-3.43a1 1 0 00-.364-1.117l-2.9-2.11c-.784-.57-.38-1.81.588-1.81h3.6a1 1 0 00.95-.69l1.114-3.43z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 ml-2">{averageRating.toFixed(1)} out of 5</span>
            </div>
            <p className="text-2xl font-bold mt-4">Rs {product.price}</p>
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4">Add to Cart</button>
          </div>
        </div>

        <hr className="my-8" />

        {/* Reviews Section */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">CUSTOMER REVIEWS</h3>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="border p-4 rounded shadow flex items-start">
                {review.reviewImage && (
                  <div className="w-24 h-24 mr-4">
                    <img
                      src={review.reviewImage}
                      alt={`Review by ${review.userId.username}`}
                      className="w-full h-full object-contain rounded cursor-pointer"
                      onClick={() => openModal(review.reviewImage)}
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`h-6 w-6 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.114 3.429a1 1 0 00.95.69h3.6c.969 0 1.371 1.24.588 1.81l-2.9 2.11a1 1 0 00-.364 1.118l1.114 3.43c.3.92-.755 1.688-1.54 1.118l-2.9-2.11a1 1 0 00-1.176 0l-2.9 2.11c-.784.57-1.838-.198-1.54-1.118l1.114-3.43a1 1 0 00-.364-1.117l-2.9-2.11c-.784-.57-.38-1.81.588-1.81h3.6a1 1 0 00.95-.69l1.114-3.43z" />
                      </svg>
                    ))}
                    <span className="text-gray-600 ml-2">{review.rating} out of 5</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.userId.username} <span className="text-gray-400">({review.userId.email})</span></p>
                  <p className="text-gray-800 mt-2">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Write a Review</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className={`text-3xl focus:outline-none ${
                      i < rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input type="hidden" id="rating" name="rating" value={rating} />
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
            <div>
              <label htmlFor="reviewImage" className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                id="reviewImage"
                name="reviewImage"
                accept="image/*"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={handleImageChange}
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-2xl w-full">
            <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="w-full h-96 flex items-center justify-center">
              <img src={modalImage} alt="Review Preview" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPage;
