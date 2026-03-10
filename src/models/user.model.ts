import mongoose, { Schema, Document, Model } from "mongoose";
import timestamp from "mongoose-timestamp";

import {
  User,
  SocialLinks,
  LastSignIn,
  ImageInfo,
  Measurement,
  ShoeSize,
} from "../types/user.types";
import { currencyEnums } from "../helpers/constants";

/**
 * Mongoose document type
 */
export interface UserDocument extends Omit<User, "_id">, Document {}

/**
 * Sub schemas
 */
const SocialSchema = new Schema<SocialLinks>(
  {
    twitter: String,
    facebook: String,
    instagram: String,
    tiktok: String,
    linkedin: String,
    website: String,
  },
  { _id: false },
);

const LastSignInSchema = new Schema<LastSignIn>(
  {
    date: String,
    browser: String,
    os: String,
    device: String,
    isDesktop: Boolean,
    isMobile: Boolean,
  },
  { _id: false },
);

const ImageSchema = new Schema<ImageInfo>(
  {
    link: String,
    name: String,
  },
  { _id: false },
);

const MeasurementSchema = new Schema<Measurement>(
  {
    unit: String,
    value: Number,
  },
  { _id: false },
);

const ShoeSizeSchema = new Schema<ShoeSize>(
  {
    country: String,
    value: Number,
  },
  { _id: false },
);

/**
 * Main User schema
 */
const UserSchema = new Schema<UserDocument>(
  {
    uid: { type: String, required: true, unique: true },
    userName: { type: String, unique: true, required: true, immutable: true },
    shopId: String,

    lastSignIn: LastSignInSchema,
    acceptMarketing: { type: Boolean, default: false },
    role: String,
    signInCount: { type: Number, default: 0 },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    phoneNumber: { type: String },
    salutation: String,

    disabled: { type: Boolean, default: false },

    address: String,

    isAdmin: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },

    email: { type: String, unique: true, required: true, immutable: true },
    emailVerified: { type: Boolean, default: false },
    phoneNumberVerified: { type: Boolean, default: false },

    creationTime: String,
    createdBy: { type: String, default: "self" },

    imageUrl: ImageSchema,
    social: SocialSchema,

    dateOfBirth: String,
    country: String,
    region: String,
    postCode: String,
    points: { type: Number, default: 0 },
    shoeSize: ShoeSizeSchema,

    prefferedCurrency: {
      type: String,
      enum: currencyEnums,
      default: "NGN",
    },

    source: String,
    welcomeEmailSent: { type: Boolean, default: false },
    initialPointGiven: { type: Boolean, default: false },
    disabledAt: Date,
    disabledBy: String,
  },
  {
    timestamps: false, // handled by plugin
  },
);

UserSchema.plugin(timestamp);

/**
 * Model
 */
export const UserModel: Model<UserDocument> =
  mongoose.models.Users ||
  mongoose.model<UserDocument>("Users", UserSchema, "Users");
