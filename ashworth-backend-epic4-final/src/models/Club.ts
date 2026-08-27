import { Schema, model, Document as MongooseDocument } from "mongoose";

export interface IClub extends MongooseDocument {
  slug: string;
  name: string;
  tagline: string;
  heroImageUrl: string;
  whoWeAre: string;
  whatIsUnique: string;
  whoShouldJoin: string;
  howYouBenefit: string;
  whatWeOffer: {
    purpose: string;
    features: string[];
    benefits: string[];
  };
  membershipFee: {
    amount: number;
    currency: string;
  };
  membershipOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    heroImageUrl: { type: String, default: "" },
    whoWeAre: { type: String, default: "" },
    whatIsUnique: { type: String, default: "" },
    whoShouldJoin: { type: String, default: "" },
    howYouBenefit: { type: String, default: "" },
    whatWeOffer: {
      purpose: { type: String, default: "" },
      features: { type: [String], default: [] },
      benefits: { type: [String], default: [] },
    },
    membershipFee: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, default: "INR" },
    },
    membershipOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Club = model<IClub>("Club", ClubSchema);
