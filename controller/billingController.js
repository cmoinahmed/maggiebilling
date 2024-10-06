import Billing from "../schemas/billingSchema.js";
import Product from "../schemas/productSchema.js";
import asyncHandler from "express-async-handler";
import moment from "moment-timezone";
import { Parser } from "json2csv";

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

    const billDoc = await Billing.findById(billId)
      .populate("item.product")
      .exec();

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

export const getAllBillingWithPagination = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "billingDate";
    const sortOrder = req.query.sortOrder || "asc";
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;
    const startIndex = (page - 1) * pageSize;
    const totalDocuments = await Billing.countDocuments();
    const totalPages = Math.ceil(totalDocuments / pageSize);
    const billingDoc = await Billing.find({})
      .populate("item.product")
      .sort(sort)
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
    const productDoc = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$grossRevenue" },
        },
      },
    ]);

    const totalEarnings =
      productDoc.length > 0 ? productDoc[0].totalEarnings : 0;

    return res.status(200).json({ success: true, totalEarnings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

export const getTotalEarningsBetweenDates = asyncHandler(async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const billingDoc = await Billing.aggregate([
      {
        $match: {
          billingDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
    ]);

    return res.status(200).json({ success: true, billingDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

export const getTodaysEarnings = asyncHandler(async (req, res) => {
  try {
    const startOfDay = moment().tz("Asia/Kolkata").startOf("day").toDate();
    const endOfDay = moment().tz("Asia/Kolkata").endOf("day").toDate();

    const result = await Billing.aggregate([
      {
        $match: {
          billingDate: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalEarning: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalEarning = result.length > 0 ? result[0].totalEarning : 0;

    return res.status(200).json({ success: true, totalEarning });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export const fetchBillingReportCSV = asyncHandler(async (req, res) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date();
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    // Fetch the billing data within the specified date range
    const billings = await Billing.find({
      billingDate: {
        $gte: new Date(startDate.setHours(0, 0, 0, 0)),
        $lt: new Date(endDate.setHours(23, 59, 59, 999)),
      },
    }).populate("item.product");

    // Prepare the billing data for CSV conversion
    const reportData = billings.map((bill) => ({
      billingId: bill._id,
      billingDate: bill.billingDate.toISOString().split("T")[0], // Formatting the date to YYYY-MM-DD
      totalPrice: bill.totalPrice,
      items: bill.item
        .map((i) => `${i.product.name} (Quantity: ${i.quantity})`)
        .join("; "), // Combining product names and quantities
    }));

    // Define the fields to include in the CSV
    const fields = ["billingId", "billingDate", "totalPrice", "items"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(reportData);

    // Set response headers for CSV download
    res.header("Content-Type", "text/csv");
    res.attachment("billing_report.csv");
    return res.send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
