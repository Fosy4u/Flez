import { Types } from "mongoose"

export interface SocialLinks {
  twitter?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  linkedin?: string
  website?: string
}

export interface LastSignIn {
  date?: string
  browser?: string
  os?: string
  device?: string
  isDesktop?: boolean
  isMobile?: boolean
}

export interface ImageInfo {
  link?: string
  name?: string
}

export interface Measurement {
  unit?: string
  value?: number
}

export interface ShoeSize {
  country?: string
  value?: number
}

export interface User {
  _id: Types.ObjectId
  uid: string
userName: string
  shopId?: string
 

  lastSignIn?: LastSignIn

  isGuest?: boolean
  acceptMarketing?: boolean
  role?: string
  signInCount?: number

  firstName?: string
  lastName?: string
  gender?: string
  phoneNumber?: string
  salutation?: string

  disabled?: boolean

  address?: string

  isAdmin: boolean
  isBlogAuthor: boolean
  isSuperAdmin?: boolean

  email: string
  emailVerified?: boolean
  phoneNumberVerified: boolean

  creationTime?: string
  createdBy?: string

  imageUrl?: ImageInfo
  social?: SocialLinks

  dateOfBirth?: string
  country?: string
  region?: string
  postCode?: string

  isVendor?: boolean
  points?: number

  weight?: Measurement
  height?: Measurement
  shoeSize?: ShoeSize

  bestOutfit?: string
  bestColor?: string

  prefferedCurrency?: string

  source?: string
  welcomeEmailSent?: boolean
  initialPointGiven?: boolean

  hasOrders?: boolean

  disabledAt?: Date
  disabledBy?: string

  expiresAt?: Date
}
