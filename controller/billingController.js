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
      console.log(product);
      if (!product) {
        return res.status(404).json({
          success: false,
          msg: `Product with ID ${item.productId} not found`,
        });
      }

      // Calculate the price for the current product
      const productPrice = parseFloat(product.price) * item.quantity;
      totalPrice += productPrice;

      //To increament productSold data and calculate gross revenue of the product
      const productsSold = product.productSold + item.quantity;
      const grossRevenue = product.grossRevenue + productPrice;
      const productDoc = await Product.updateOne(
        { _id: item.productId },
        { productSold: productsSold, grossRevenue: grossRevenue }
      );

      console.log(productDoc);

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

    await billDoc.populate("item.product");

    return res.status(200).json({ success: true, billDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

export const getAllBillingWithPagination = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    //const sortField = req.query.sortField || "dateCreated";
    //const sortOrder = req.query.sortOrder || "asc";
    //const sort = {};
    //sort[sortField] = sortOrder === "asc" ? 1 : -1;
    const startIndex = (page - 1) * pageSize;
    const totalDocuments = await Billing.countDocuments();
    const totalPages = Math.ceil(totalDocuments / pageSize);
    const billingDoc = await Billing.find({})
      //.populate("product")
      // .sort(sort)
      .skip(startIndex)
      .limit(pageSize)
      .exec();
    return res.status(200).json({
      billingDoc,
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
    return res.status(500).json({ error, success: false });
  }
});

export const getLifetimeEarnings = asyncHandler(async (req, res) => {
  try {
    let totalEarning = 0;
    const productDoc = await Product.find({});

    for (let product of productDoc) {
      totalEarning += product.grossRevenue;
    }

    return res.status(200).json({ success: true, totalEarning });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

export const getTotalEarningsBetweenDates = asyncHandler(async (req, res) => {
  try {
    let totalEarning = 0;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const billDoc = await Billing.find({
      dateModified: { $gte: startDate, $lte: endDate },
    });
    console.log(billDoc);

    for (let bill of billDoc) {
      totalEarning += bill.totalPrice;
    }

    return res.status(200).json({ success: true, totalEarning });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});
