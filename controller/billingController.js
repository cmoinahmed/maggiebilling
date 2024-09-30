import Billing from "../schemas/billingSchema.js";
import Product from "../schemas/productSchema.js";
import asyncHandler from "express-async-handler";

export const calculateBilling = asyncHandler(async (req, res) => {
  try {
    const { items } = req.body; // expecting an array of { productId, quantity }
    let totalPrice = 0;
    let billItems = [];

    // Loop through each item in the request
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          msg: `Product with ID ${item.productId} not found`,
        });
      }

      // Calculate the price for the current product
      const productPrice = parseFloat(product.price) * item.quantity;
      totalPrice += productPrice;

      // Push the product reference (ID) and quantity into the bill items array
      billItems.push({
        product: product._id, // Store product ID
        quantity: item.quantity,
      });
    }

    // Create a new billing document with the calculated total price
    const billing = await Billing.create({
      item: billItems,
      totalPrice,
    });

    // Populate the product details for the response
    await billing.populate("item.product");

    return res.status(201).json({
      success: true,
      msg: "Billing calculated and saved successfully",
      billing, // populated billing document
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

export const getBillingById = asyncHandler(async (req, res) => {
  try {
    const billId = req.params.billId;

    const billDoc = await Billing.findById(billId);
    if (!billDoc) {
      console.log("Billing id does not exist");
      return res
        .status(404)
        .json({ success: false, msg: "Billing id not found" });
    }

    return res.status(200).json({ success: true, billDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});
