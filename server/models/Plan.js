// server/models/planModel.js
import mongoose from 'mongoose';

const planSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['Trial', 'Basic', 'Pro', 'Enterprise'],
    },
    // The 'price' field will now store regional prices
    prices: [
      {
        currency: { // e.g., 'USD', 'EUR', 'XAF'
          type: String,
          required: true,
          uppercase: true,
        },
        amount: { // The price in that specific currency
          type: Number,
          required: true,
        },
        // We can remove monthly/yearly pricing for now to simplify
      },
    ],
    features: {
      type: [String],
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    limits: {
      maxStaff: {
        type: Number,
        required: true,
        default: 1 // Default limit
      },
      maxOrdersPerMonth: {
        type: Number,
        required: true,
        default: 50 // Default limit
      },
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;