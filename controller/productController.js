import Product from "../schemas/productSchema.js";
import asyncHandler from "express-async-handler";

export const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, price, bannerImg } = req.body;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        msg: "Product already exists",
      });
    }

    const product = await Product.create({
      name,
      price,
      bannerImg,
    });

    return res.status(201).json({
      success: true,
      msg: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "Server Error",
      error,
    });
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { productId, name, price, bannerImg } = req.body;

    let productDoc = await Product.findById(productId);
    if (!productDoc) {
      console.log("Prodcut id not found");
      return res
        .status(404)
        .json({ success: false, msg: "Product id not found" });
    }

    productDoc = await Product.updateOne(
      { _id: productId },
      {
        name,
        price,
        bannerImg,
      }
    );

    return res.status(200).json({
      success: true,
      msg: "Product details updated successfully",
      productDoc,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

export const getAll = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "name";
    const sortOrder = req.query.sortOrder || "asc";
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;
    const startIndex = (page - 1) * pageSize;
    const totalDocuments = await Product.countDocuments();
    const totalPages = Math.ceil(totalDocuments / pageSize);
    const productDoc = await Product.find({})
      .sort(sort)
      .skip(startIndex)
      .limit(pageSize)
      .exec();
    return res.status(200).json({
      productDoc,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalDocuments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

export const getProductById = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.productId;

    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      console.log("Product id not found");
      return res
        .status(404)
        .json({ success: false, msg: "Product id not found" });
    }

    console.log(productDoc);
    return res.status(200).json({ success: true, productDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

//getProductSoldCount
export const getProductSoldCount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const productDoc = await Product.findById(id).select("productSold");
    if (!productDoc) {
      console.log("Product not found");
      return res.status(404).json({ success: false, msg: "Product not found" });
    }
    return res.status(200).json({
      success: true,
      productDoc,
      ProductSold: Product.productSold,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

//getGrossRevenueByProductId
export const getProductRevenue = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const productDoc = await Product.findById(id).select("grossRevenue");
    if (!productDoc) {
      console.log("Product not found");
      return res.status(404).json({ success: false, msg: "Product not found" });
    }
    return res.status(200).json({
      success: true,
      productDoc,
      grossRevenue: Product.grossRevenue,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});
