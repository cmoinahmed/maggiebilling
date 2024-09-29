import express from "express";
import { calculateBilling } from "../controller/billingController.js";

const billingRouter = express.Router();

billingRouter.route("/calculate").post(calculateBilling);

export default billingRouter;
