import express from "express";
import {
  addProduct,
  getAll,
  getProductById,
  updateProduct,
} from "../controller/productController.js";

const productRouter = express.Router();

productRouter.route("/add").post(addProduct);
productRouter.route("/updateProduct").put(updateProduct);
productRouter.route("/getAll").get(getAll);
productRouter.route("/getById/:productId").get(getProductById);

export default productRouter;
