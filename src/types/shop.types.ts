import { Types } from "mongoose";

export type ShopStatus = "pending" | "active" | "suspended" | "rejected";

export interface ShopAddress {
  country: string;
  state?: string;
  city?: string;
  street?: string;
  postalCode?: string;
}

export interface ShopContactInfo {
  supportEmail?: string;
  supportPhone?: string;
}

export interface BankDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface ShopDocument {
  _id: Types.ObjectId;

  owner: Types.ObjectId; // User ID

  shopId: string; // unique, random, for frontend/admin

  name: string;
  slug: string;
  description?: string;
  legalName?: string;

  logo?: string;
  banner?: string;

  address?: ShopAddress;
  contactInfo?: ShopContactInfo;
  bankDetails?: BankDetails;

  isVerified: boolean;

  status: ShopStatus;

  createdAt: Date;
  updatedAt: Date;
}
