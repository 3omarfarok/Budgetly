import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["payment", "received"],
      default: "payment", // Default ensures existing records work without migration
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "Payment",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    linkedExpense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
    date: { type: Date, default: Date.now },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ house: 1, user: 1, status: 1, transactionType: 1 });
paymentSchema.index({ house: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
