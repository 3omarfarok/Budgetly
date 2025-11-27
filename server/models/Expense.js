import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    splitType: {
      type: String,
      enum: ["equal", "specific", "custom"],
      required: true,
    },
    // For 'specific' and 'custom' split types
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Validate that splits add up to totalAmount
expenseSchema.pre("save", function (next) {
  if (this.splits && this.splits.length > 0) {
    const sum = this.splits.reduce((acc, split) => acc + split.amount, 0);
    if (Math.abs(sum - this.totalAmount) > 0.01) {
      next(new Error("Splits must add up to total amount"));
    }
  }
  next();
});

export default mongoose.model("Expense", expenseSchema);
