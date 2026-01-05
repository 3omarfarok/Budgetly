import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "awaiting_approval", "paid"],
      default: "pending",
    },
    paymentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Invoice", invoiceSchema);
