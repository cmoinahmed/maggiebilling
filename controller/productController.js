import Product from "../schemas/productSchema.js";
import asyncHandler from "express-async-handler";

export const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, price } = req.body;

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
