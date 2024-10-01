import express from "express";
import {
  calculateBilling,
  getAllBillingWithPagination,
  getBillingById,
  getLifetimeEarnings,
} from "../controller/billingController.js";

const billingRouter = express.Router();

billingRouter.route("/calculate").post(calculateBilling);
billingRouter.route("/getById/:billId").get(getBillingById);
billingRouter.route("/getAllBilling").get(getAllBillingWithPagination);

billingRouter.route("/getLifetimeEarnings").get(getLifetimeEarnings);

export default billingRouter;
