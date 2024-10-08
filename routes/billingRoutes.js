import express from "express";
import {
  calculateBilling,
  fetchBillingReportCSV,
  getAllBillingWithPagination,
  getBillingById,
  getLifetimeEarnings,
  getTodaysEarnings,
  getTotalEarningsBetweenDates,
} from "../controller/billingController.js";

const billingRouter = express.Router();

billingRouter.route("/calculate").post(calculateBilling);
billingRouter.route("/getById/:billId").get(getBillingById);
billingRouter.route("/getAll").get(getAllBillingWithPagination);
billingRouter.route("/getLifetimeEarnings").get(getLifetimeEarnings);
billingRouter
  .route("/getTotalEarningsBetweenDates")
  .get(getTotalEarningsBetweenDates);
billingRouter.route("/getTodaysEarnings").get(getTodaysEarnings);
billingRouter.route("/downloadCSV").get(fetchBillingReportCSV);

export default billingRouter;
