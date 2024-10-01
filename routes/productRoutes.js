import express from "express";
import {
  addProduct,
  getAll,
  getProductById,
  getProductRevenue,
  getProductSoldCount,
  updateProduct,
} from "../controller/productController.js";

const productRouter = express.Router();

productRouter.route("/add").post(addProduct);
productRouter.route("/updateProduct").put(updateProduct);
productRouter.route("/getAll").get(getAll);
productRouter.route("/getById/:productId").get(getProductById);
productRouter.route("/getProductSoldCount/:id").get(getProductSoldCount);
productRouter.route("/getProductRevenue/:id").get(getProductRevenue);

export default productRouter;
