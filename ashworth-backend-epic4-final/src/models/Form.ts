import mongoose, { Schema, Document } from 'mongoose';

// Define an interface for the form
export interface IRegistrationForm extends Document {
  name: string;
  dob: Date;
  mobile: string;
  email: string;
  password: string;
  city: string;
  state: string;
  currentAddress: string;
  pincode: string;
  preferredCity: string;
  highestEducation: string;
  education: string;
  stream: string;
  industryType: string;
  functionalArea: string;
  yearsOfExperience?: string;
  currentCompany?: string;
  designation?: string;
  annualCTC?: string;
  resume?: string; // File path or URL
  photo?: string; // File path or URL
  createdAt?: Date;
  updatedAt?: Date;
}

const RegistrationFormSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    currentAddress: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    preferredCity: {
      type: String,
      required: true,
      trim: true,
    },
    highestEducation: {
      type: String,
      required: true,
      trim: true,
    },
    education: {
      type: String,
      required: true,
      trim: true,
    },
    stream: {
      type: String,
      required: true,
      trim: true,
    },
    industryType: {
      type: String,
      required: true,
      trim: true,
    },
    functionalArea: {
      type: String,
      required: true,
      trim: true,
    },
    yearsOfExperience: {
      type: String,
      default: '',
      trim: true,
    },
    currentCompany: {
      type: String,
      default: '',
      trim: true,
    },
    designation: {
      type: String,
      default: '',
      trim: true,
    },
    annualCTC: {
      type: String,
      default: '',
      trim: true,
    },
    resume: {
      type: String,
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.RegistrationForm ||
  mongoose.model<IRegistrationForm>('RegistrationForm', RegistrationFormSchema);