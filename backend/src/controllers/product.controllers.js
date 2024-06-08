import { Seller } from "../models/seller.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
  const sellerInfo = req.seller._id;
  if (!sellerInfo) throw new ApiError(400, "Unauthorized to create product");

  const seller = await Seller.findById(sellerInfo);
  if (!seller) throw new ApiError(404, "Seller not found");

  if (!seller.sellerVerified) throw new ApiError(404, "Seller is not verified");

  const { name, description, price, stock, category } = req.body;
  if (!name) throw new ApiError(404, "Product name/title is required");
  if (!description) throw new ApiError(404, "Product describtion is required");
  if (!price) throw new ApiError(404, "Product price should be specified");
  if (!stock) throw new ApiError(404, "Product stock should be specified");
  if (!category) throw new ApiError(404, "Product category required");

  price = parseInt(price);
  stock = parseInt(stock);

  let productImageLocalPaths = [];
  if (
    req.files &&
    Array.isArray(req.files.productImages) &&
    req.files.productImages.length > 0
  ) {
    productImageLocalPaths = req.files.productImages.map((file) => file.path);
  } else {
    throw new ApiError(404, "Images are required");
  }

  // Array to store Cloudinary URLs of uploaded images
  const productImagesUrls = [];

  // Upload each image to Cloudinary
  for (const path of productImageLocalPaths) {
    const uploadedImage = await uploadOnCloudinary(path);
    if (!uploadedImage) {
      throw new ApiError(500, "Failed to upload image");
    }
    productImagesUrls.push(uploadedImage.url);
  }

  try {
    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: price,
      stock: stock,
      productImages: productImagesUrls,
      category,
      sellerInfo,
    });

    res
      .status(200)
      .json(new ApiResponse(201, newProduct, "Product created successfully"));
  } catch (error) {
    throw new ApiError(500, "Could not create product");
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product id not specified");

  let { name, description, price, stock, category } = req.body;

  if (!name && !description && !price && !stock && !category)
    throw new ApiError(404, "No fields specified to update");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  if (!product.sellerInfo.equals(req.seller._id)) {
    throw new ApiError(400, "Unauthorized to update products");
  }

  let updateFields = {};

  // Add fields to updateFields if they are present in the request
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;
  if (price) updateFields.price = price;
  if (stock) updateFields.stock = stock;
  if (category) updateFields.category = category;

  // Update the product in the database
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  // Check if the product exists
  if (!updatedProduct) {
    throw new ApiError(404, "Product not found");
  }

  // Respond with the updated product
  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        updateProduct,
        "Product details updated successfully"
      )
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product id not valid");

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.sellerInfo.equals(req.seller._id)) {
    throw new ApiError(403, "Unauthorized to delete this product");
  }

  const deletedProduct = await Product.findByIdAndDelete(productId, {
    new: true,
  });

  if (!deletedProduct) throw new ApiError(500, "Could not delete product");
  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Product deleted successfully"));
});

const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "_id",
    sortType = "1",
    minQuantity,
    query,
    category,
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: parseInt(sortType) },
  };

  const pipeline = [
    {
      $match: {
        quantityInStock: { $gte: parseInt(minQuantity) || 0 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $lookup: {
        from: "sellers",
        localField: "sellerInfo",
        foreignField: "_id",
        as: "sellerInfo",
      },
    },
    {
      $unwind: "$sellerInfo",
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        price: { $first: "$price" },
        stock: { $first: "$stock" },
        category: { $first: "$category" },
        sellerInfo: { $first: "$sellerInfo" },
        productImages: { $first: "$productImages" }, // Push all productImages URLs into an array
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        price: 1,
        stock: 1,
        category: {
          categoryName: "$category.category",
          categoryID: "$category._id",
        },
        sellerInfo: {
          sellerName: "$sellerInfo.fullName",
          sellerID: "$sellerInfo._id",
          GSTNumber: "$sellerInfo.GSTnumber",
        },
        productImages: 1,
      },
    },
    {
      $match: {
        "category.categoryName": { $regex: category || "", $options: "ix" },
      },
    },
  ];

  if (query) {
    pipeline.push({
      $match: {
        $or: [
          {
            description: { $regex: query || "", $options: "ix" },
          },
          {
            name: { $regex: query || "", $options: "ix" },
          },
          {
            "sellerInfo.sellerName": { $regex: query || "", $options: "ix" },
          },
        ],
      },
    });
  }

  const aggregate = Product.aggregate(pipeline);

  const products = await Product.aggregatePaginate(aggregate, options);
  if (products.length === 0) {
    throw new ApiError(404, "No products found");
  }

  return res.status(200).json(new ApiResponse(200, products, "Products found"));
});

const getProductbyId = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product id not specified");

  const product = await Product.findById(productId)
    .populate({
      path: "category",
      select: "category",
    })
    .populate({
      path: "sellerInfo",
      select: "sellerName sellerGST isVerified",
    });

  if (!product) throw new ApiError(404, "Product not found");

  res.status(200).json(new ApiResponse(200, product, "Product found"));
});

const getProductbyCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    if (!categoryId) {
      throw new ApiError(400, "Category is required");
    }

    const {
      page = 1,
      limit = 10,
      sortBy = "_id",
      sortType = "1",
      query,
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: parseInt(sortType) },
    };

    const pipeline = [
      {
        $match: {
          category: new mongoose.Types.ObjectId(categoryId),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerInfo",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      {
        $unwind: "$sellerInfo",
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          price: { $first: "$price" },
          stock: { $first: "$stock" },
          //ratings: { $first: "$ratings" },
          sellerInfo: { $first: "$sellerInfo" },
          productImages: { $first: "$productImages" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          stock: 1,
          //ratings: 1,
          category: {
            categoryName: "$category.category",
            categoryID: "$category._id",
          },
          sellerInfo: {
            sellerName: "$sellerInfo.fullName",
            sellerID: "$sellerInfo._id",
            GSTNumber: "$sellerInfo.GSTnumber",
          },
          productImages: 1,
        },
      },
    ];

    try {
      const aggregate = Product.aggregate(pipeline);
      const products = await Product.aggregatePaginate(aggregate, options);

      if (products.docs.length === 0) {
        throw new ApiError(404, "No products found with given category ID");
      }

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            products,
            "Products found with given category ID"
          )
        );
    } catch (error) {
      next(error);
    }
});


const getAllProducts = asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, sortBy = "_id", sortType = "1", productId = "", sellerID = "", categoryID= "" } = req.query;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: parseInt(sortType) }
    };

    const pipeline = [
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: "$category"
        },
        {
            $lookup: {
                from: "sellers",
                localField: "sellerInfo",
                foreignField: "_id",
                as: "sellerInfo"
            }
        },
        {
            $unwind: "$sellerInfo"
        },
        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                description: { $first: "$description" },
                price: { $first: "$price" },
                stock: { $first: "$stock" },
                category:{$first:"$category"},
                sellerInfo: { $first: "$sellerInfo" },
                sellerID: { $first: "$sellerInfo._id" },
                productImages: { $first: "$productImages" }
            }
        },
    ]

    if(productId){
      pipeline.push({
          $match: {
              _id: new mongoose.Types.ObjectId(productId)
          }
      })
    }

    if(sellerID){
      pipeline.unshift({
          $match: {
              "sellerId": new mongoose.Types.ObjectId(sellerID)
          }
      })
    }

    if(categoryID){
      pipeline.unshift({
          $match: {
              "category._id": new mongoose.Types.ObjectId(categoryID)
          }
      })
    }

    const aggregate = await Product.aggregate(pipeline);
    const products = await Product.aggregatePaginate(aggregate, options);

    if(!products || products.length === 0){
      throw new ApiError(404,"No products found")
    }

    return res.status(200).json(new ApiResponse(200,products,"Products found"));

});

const getProductbySeller = asyncHandler(async (req, res) => {
  const sellerId = req.seller._id;
  if (!sellerId) {
    throw new ApiError(400, "Seller ID is required");
  }

  const products = await Product.find({ sellerInfo: sellerId })
    .populate({
      path: "category",
      select: "category",
    })
    .select("-sellerInfo");

  if (products.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No products found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products found for seller"));
});

export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductbyId,
  getProductbyCategory,
  getAllProducts,
  getProductbySeller,
};
