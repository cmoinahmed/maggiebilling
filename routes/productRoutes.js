import express from "express";
import { addProduct } from "../controller/productController.js";

const productRouter = express.Router();

productRouter.route("/add").post(addProduct);

export default productRouter;
