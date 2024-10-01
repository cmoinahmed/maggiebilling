import express from "express";
import {
  calculateBilling,
  getAllBillingWithPagination,
  getBillingById,
} from "../controller/billingController.js";

const billingRouter = express.Router();

billingRouter.route("/calculate").post(calculateBilling);
billingRouter.route("/getById/:billId").get(getBillingById);
billingRouter.route("/getAllBilling").get(getAllBillingWithPagination);

export default billingRouter;
