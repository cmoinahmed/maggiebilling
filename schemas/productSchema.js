import mongoose from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const productSchema = new mongoose.Schema({
  name: reqString,
  price: reqString,
});

const Product = mongoose.model("products", productSchema);

export default Product;
