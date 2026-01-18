import mongoose from "mongoose";

// Subdocument schema for dishwashing rotation
const dishwashingRotationSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: String, // YYYY-MM-DD format for timezone safety
      default: null,
    },
    order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: false },
);

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    houseId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    dishwashingRotation: {
      type: dishwashingRotationSchema,
      default: () => ({ enabled: false, startDate: null, order: [] }),
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
houseSchema.index({ admin: 1 });
houseSchema.index({ members: 1 });

export default mongoose.model("House", houseSchema);
