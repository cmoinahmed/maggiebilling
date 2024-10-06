import mongoose from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const productSchema = new mongoose.Schema({
  name: reqString,
  price: reqString,
  bannerImg: reqString,
  productSold: { type: Number, default: 0 },
  grossRevenue: { type: Number, default: 0 },
});

const Product = mongoose.model("products", productSchema);

export default Product;
