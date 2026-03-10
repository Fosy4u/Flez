import mongoose, { Schema, Model } from "mongoose";
import timestamp from "mongoose-timestamp";
import { ExchangeRate } from "../types/exchangeRate.types";

const ExchangeRateSchema = new Schema<ExchangeRate>({
  currency: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  logs: [
    {
      value: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    },
  ],
});

// timestamps plugin
ExchangeRateSchema.plugin(timestamp);

// Explicit model typing (helps in large codebases)
const ExchangeRateModel: Model<ExchangeRate> =
  mongoose.models.ExchangeRate ||
  mongoose.model<ExchangeRate>("ExchangeRate", ExchangeRateSchema, "ExchangeRate");

export default ExchangeRateModel;
