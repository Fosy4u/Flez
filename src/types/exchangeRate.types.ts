import { Types } from "mongoose";

export interface ExchangeRateLog {
  value: number;
  date: Date;
  user: Types.ObjectId;
}

export interface ExchangeRate {
  currency: string;
  rate: number;
  logs: ExchangeRateLog[];
  createdAt?: Date;
  updatedAt?: Date;
}
