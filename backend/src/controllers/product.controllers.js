import { Seller } from "../models/seller.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Category } from '../models/category.models.js';
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
  const sellerInfo = req.seller._id;
  if (!sellerInfo) throw new ApiError(400, "Unauthorized to create product");

  const seller = await Seller.findById(sellerInfo);
  if (!seller) throw new ApiError(404, "Seller not found");

  if (!seller.sellerVerified) throw new ApiError(404, "Seller is not verified");

  let { name, description, price, stock, categoryName } = req.body;
  //console.log(category)
  if (!name) throw new ApiError(404, "Product name/title is required");
  if (!description) throw new ApiError(404, "Product describtion is required");
  if (!price) throw new ApiError(404, "Product price should be specified");
  if (!stock) throw new ApiError(404, "Product stock should be specified");
  if (!categoryName) throw new ApiError(404, "Product category required");

  price = parseInt(price);
  stock = parseInt(stock);

  const category = await Category.findOne({name:categoryName})
  if(!category) throw new ApiError(404,"No such category to add product to")
  console.log('Request files:', req.files);
  //console.log('Request files productimages:', req.files.fieldname);

  let productImageLocalPaths = [];
  if (
    req.files &&
    Array.isArray(req.files)
     && req.files.length > 0
  ) {
    productImageLocalPaths = req.files.map((file) => file.path);
    if(!productImageLocalPaths) console.log('No local image paths found');
    //console.log('Local image paths:', productImageLocalPaths);

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
      categoryId:category._id,//not displaying category now displaying 
      sellerInfo,
    });
    console.log(newProduct)

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

  let { name, description, price, stock, categoryName } = req.body;

  if (!name && !description && !price && !stock && !categoryName)
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
  if (categoryName) {
    const category = await Category.findOne({ name: categoryName });
    if (!category) throw new ApiError(404, "Category not found");
    updateFields.categoryId = category._id;
  }

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

    const pipeline = [];

    // Match stage for quantity in stock
    if (minQuantity) {
      pipeline.push({
        $match: {
          stock: { $gte: parseInt(minQuantity) || 0 },
        },
      });
    }

    // Lookup stage for category
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    });

    pipeline.push({
      $unwind: "$category",
    });

    // Lookup stage for seller info
    pipeline.push({
      $lookup: {
        from: "sellers",
        localField: "sellerInfo",
        foreignField: "_id",
        as: "sellerInfo",
      },
    });

    pipeline.push({
      $unwind: "$sellerInfo",
    });

    // Group stage to organize the data
    pipeline.push({
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        price: { $first: "$price" },
        stock: { $first: "$stock" },
        category: { $first: "$category" },
        sellerInfo: { $first: "$sellerInfo" },
        productImages: { $first: "$productImages" },
      },
    });

    // Project stage to shape the final output
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        price: 1,
        stock: 1,
        category: {
          categoryName: "$category.name",
          categoryID: "$category._id",
        },
        sellerInfo: {
          sellerName: "$sellerInfo.sellerName",
          sellerID: "$sellerInfo._id",
          sellerGST: "$sellerInfo.sellerGST",
        },
        productImages: 1,
      },
    });

    // Match stage for category filter
    if (category) {
      pipeline.push({
        $match: {
          "category.categoryName": { $regex: category, $options: "i" },
        },
      });
    }

    // Match stage for query filter
    if (query) {
      pipeline.push({
        $match: {
          $or: [
            {
              description: { $regex: query, $options: "i" },
            },
            {
              name: { $regex: query, $options: "i" },
            },
            {
              "sellerInfo.sellerName": { $regex: query, $options: "i" },
            },
          ],
        },
      });
    }

    try {
      const aggregate = Product.aggregate(pipeline);

      // Log the pipeline for debugging purposes
      //console.log("Pipeline:", JSON.stringify(pipeline, null, 2));

      const products = await Product.aggregatePaginate(aggregate, options);

      // Log the products for debugging purposes
      //console.log("Products:", products);

      if (!products.docs.length) {
        throw new ApiError(404, "No products found");
      }

      res.json(new ApiResponse(200, products, "Products retrieved successfully"));
    } catch (error) {
      console.error("Error in getProducts:", error);
      throw new ApiError(500, "Error in getting products");
    }
});


const getProductbyId = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) throw new ApiError(400, "Product id not specified");

  const product = await Product.findById(productId)
    .populate({
      path: "categoryId",
      select: "name",
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
      throw new ApiError(400, "Category ID is required");
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

  // Log the received parameters
  //console.log("Category ID:", categoryId);
  //console.log("Query options:", options);

  const pipeline = [
      {
          $match: {
              categoryId: new mongoose.Types.ObjectId(categoryId),
              
          },
      },
      {
          $lookup: {
              from: "categories",
              localField: "categoryId",
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
              sellerInfo: { $first: "$sellerInfo" },
              productImages: { $first: "$productImages" },
              category:{$first:"$category"}
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
                  categoryName: "$category.name",
                  categoryID: "$category._id",
              },
              sellerInfo: {
                  sellerName: "$sellerInfo.sellerName",
                  sellerID: "$sellerInfo._id",
                  sellerGST: "$sellerInfo.sellerGST",
              },
              productImages: 1,
          },
      },
  ];

  try {
      const aggregate = Product.aggregate(pipeline);

      // Log the pipeline to debug
      //console.log("Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));

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
      console.error("Error in getProductbyCategory:", error);
      throw new ApiError(500, "Error in getting products by category");
  }
});



const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = "_id", sortType = "1", productId = "", sellerID = "", categoryID = "" } = req.query;

  const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: parseInt(sortType) }
  };

  const pipeline = [
      {
          $lookup: {
              from: "categories",
              localField: "categoryId",
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
              category: { $first: "$category" },
              sellerInfo: { $first: "$sellerInfo" },
              sellerID: { $first: "$sellerInfo._id" },
              productImages: { $first: "$productImages" }
          }
      },
  ];

  if (productId) {
      pipeline.push({
          $match: {
              _id: mongoose.Types.ObjectId(productId)
          }
      })
  }

  if (sellerID) {
      pipeline.unshift({
          $match: {
              "sellerId": mongoose.Types.ObjectId(sellerID)
          }
      })
  }

  if (categoryID) {
      pipeline.unshift({
          $match: {
              "category._id": mongoose.Types.ObjectId(categoryID)
          }
      })
  }

  // Apply pagination manually
  const skip = (options.page - 1) * options.limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: options.limit });

  try {
      const aggregateResult = await Product.aggregate(pipeline);
      const totalCount = await Product.aggregate([...pipeline, { $count: "totalCount" }]);
      const totalDocs = totalCount.length > 0 ? totalCount[0].totalCount : 0;

      const totalPages = Math.ceil(totalDocs / options.limit);
      const hasNextPage = options.page < totalPages;
      const hasPrevPage = options.page > 1;

      return res.status(200).json({
          success: true,
          data: aggregateResult,
          pagination: {
              totalDocs,
              totalPages,
              hasNextPage,
              hasPrevPage,
              currentPage: options.page
          }
      });
  } catch (error) {
      console.error("Error in getAllProducts:", error);
      throw new ApiError(500, "Error in getting products");
  }
});


const getProductbySeller = asyncHandler(async (req, res) => {
  const sellerId = req.seller._id;
  if (!sellerId) {
    throw new ApiError(400, "Seller ID is required");
  }

  const products = await Product.find({ sellerInfo: sellerId })
    .populate({
      path: "categoryId",
      select: "name",
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
