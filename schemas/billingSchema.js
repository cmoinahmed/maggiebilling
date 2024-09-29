import mongoose from "mongoose";

const reqString = {
  type: String,
  required: true,
};

const billingSchema = new mongoose.Schema({
  item: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        require: true,
      },
      quantity: Number,
    },
  ],
  totalPrice: Number,
});

const Billing = mongoose.model("billings", billingSchema);

export default Billing;
