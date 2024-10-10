import express from "express";
import {
  addProduct,
  getAll,
  getProductById,
  getProductRevenue,
  getProductSoldCount,
  highestGrossRevenue,
  highestSoldProduct,
  updateProduct,
  getAllProductNames,
} from "../controller/productController.js";

const productRouter = express.Router();

productRouter.route("/add").post(addProduct);
productRouter.route("/updateProduct").put(updateProduct);
productRouter.route("/getAll").get(getAll);
productRouter.route("/getById/:productId").get(getProductById);
productRouter.route("/getProductSoldCount/:id").get(getProductSoldCount);
productRouter.route("/getProductRevenue/:id").get(getProductRevenue);
productRouter.route("/highestSold").get(highestSoldProduct);
productRouter.route("/highestRevenue").get(highestGrossRevenue);
productRouter.route("/getAllNames").get(getAllProductNames);

export default productRouter;
