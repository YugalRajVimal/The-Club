// import { z } from "zod";

// // Central place for every request-body schema in the app. Grouped by the
// // route file that uses them. Kept deliberately permissive on string
// // content (e.g. phone/aadhar formats) since the contract doesn't specify
// // exact formats — tighten these if the frontend teams confirm stricter
// // rules (e.g. a fixed Aadhar/PAN regex).

// const membershipStatusEnum = z.enum([
//   "payment_pending",
//   "documents_pending",
//   "pending_approval",
//   "approved",
//   "rejected",
// ]);

// const uploadProviderEnum = z.enum(["multer", "cloudinary"]);
// const documentTypeEnum = z.enum(["aadhar_front", "aadhar_back", "pan_front"]);

// /* ─────────────────────── Auth — User ─────────────────────── */

// export const signupStartSchema = z
//   .object({
//     clubId: z.string().min(1),
//     fullName: z.string().min(1),
//     email: z.string().email(),
//     phone: z.string().min(1),
//     dob: z.coerce.date(),
//     address: z.string().min(1),
//     occupation: z.string().min(1),
//     password: z.string().min(8),
//   })
//   .passthrough(); // contract allows "...otherMembershipFormFields"

// export const signupConsentSchema = z.object({
//   signupSessionId: z.string().min(1),
//   consentAccepted: z.literal(true),
//   consentVersion: z.string().min(1),
//   signedName: z.string().min(1),
// });

// export const signupOtpSendSchema = z.object({
//   signupSessionId: z.string().min(1),
// });

// export const signupOtpVerifySchema = z.object({
//   signupSessionId: z.string().min(1),
//   otp: z.string().min(1),
// });

// export const userLoginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(1),
// });

// export const userLoginGoogleSchema = z.object({
//   googleIdToken: z.string().min(1),
// });

// export const forgotPasswordOtpSendSchema = z.object({
//   email: z.string().email(),
// });

// export const forgotPasswordOtpVerifySchema = z.object({
//   email: z.string().email(),
//   otp: z.string().min(1),
//   newPassword: z.string().min(8),
// });

// /* ─────────────────────── Auth — Admin ─────────────────────── */

// export const adminLoginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(1),
// });

// /* ─────────────────────── Payments ─────────────────────── */

// export const paymentVerifySchema = z.object({
//   cfOrderId: z.string().min(1),
// });

// /* ─────────────────────── Documents & KYC ─────────────────────── */

// export const uploadDocumentSchema = z.object({
//   documentType: documentTypeEnum,
//   aadharNumber: z.string().min(1).optional(),
//   panNumber: z.string().min(1).optional(),
// });

// export const kycNumbersSchema = z
//   .object({
//     aadharNumber: z.string().min(1).optional(),
//     panNumber: z.string().min(1).optional(),
//   })
//   .refine((data) => data.aadharNumber || data.panNumber, {
//     message: "At least one of aadharNumber or panNumber is required",
//   });

// /* ─────────────────────── Profile ─────────────────────── */

// export const updateProfileSchema = z
//   .object({
//     phone: z.string().min(1).optional(),
//     address: z.string().min(1).optional(),
//     occupation: z.string().min(1).optional(),
//   })
//   .refine((data) => Object.keys(data).length > 0, {
//     message: "At least one of phone, address, occupation is required",
//   });

// /* ─────────────────────── Admin — Users ─────────────────────── */

// export const adminListUsersQuerySchema = z.object({
//   status: membershipStatusEnum.optional(),
//   clubId: z.string().optional(),
//   search: z.string().optional(),
// });

// export const adminCreateUserSchema = z.object({
//   clubId: z.string().min(1),
//   fullName: z.string().min(1),
//   email: z.string().email(),
//   phone: z.string().min(1),
//   dob: z.coerce.date(),
//   address: z.string().min(1),
//   occupation: z.string().min(1),
//   password: z.string().min(8),
//   membershipStatus: membershipStatusEnum.optional(),
// });

// export const adminUpdateUserSchema = z
//   .object({
//     fullName: z.string().min(1).optional(),
//     email: z.string().email().optional(),
//     phone: z.string().min(1).optional(),
//     dob: z.coerce.date().optional(),
//     address: z.string().min(1).optional(),
//     occupation: z.string().min(1).optional(),
//     clubId: z.string().min(1).optional(),
//     membershipStatus: membershipStatusEnum.optional(),
//   })
//   .refine((data) => Object.keys(data).length > 0, {
//     message: "No editable fields provided",
//   });

// export const verifyDocumentSchema = z.object({
//   verified: z.boolean(),
//   note: z.string().optional(),
// });

// export const approveMembershipSchema = z.object({
//   approve: z.boolean(),
//   note: z.string().optional(),
// });

// /* ─────────────────────── Admin — Clubs ─────────────────────── */

// const membershipFeeSchema = z.object({
//   amount: z.number().positive(),
//   currency: z.string().min(1).default("INR"),
// });

// const whatWeOfferSchema = z.object({
//   purpose: z.string().default(""),
//   features: z.array(z.string()).default([]),
//   benefits: z.array(z.string()).default([]),
// });

// export const adminCreateClubSchema = z.object({
//   slug: z.string().min(1),
//   name: z.string().min(1),
//   tagline: z.string().default(""),
//   heroImageUrl: z.string().optional(), // may be replaced by an uploaded file — see clubController
//   whoWeAre: z.string().default(""),
//   whatIsUnique: z.string().default(""),
//   whoShouldJoin: z.string().default(""),
//   howYouBenefit: z.string().default(""),
//   whatWeOffer: whatWeOfferSchema.default({ purpose: "", features: [], benefits: [] }),
//   membershipFee: membershipFeeSchema,
//   membershipOpen: z.boolean().default(true),
// });

// export const adminUpdateClubSchema = z
//   .object({
//     slug: z.string().min(1).optional(),
//     name: z.string().min(1).optional(),
//     tagline: z.string().optional(),
//     heroImageUrl: z.string().optional(),
//     whoWeAre: z.string().optional(),
//     whatIsUnique: z.string().optional(),
//     whoShouldJoin: z.string().optional(),
//     howYouBenefit: z.string().optional(),
//     whatWeOffer: whatWeOfferSchema.partial().optional(),
//     membershipFee: membershipFeeSchema.partial().optional(),
//     membershipOpen: z.boolean().optional(),
//   })
//   .refine((data) => Object.keys(data).length > 0, { message: "No editable fields provided" });

// /* ─────────────────────── Admin — Payments overview ─────────────────────── */

// export const adminPaymentsQuerySchema = z.object({
//   clubId: z.string().optional(),
//   dateFrom: z.coerce.date().optional(),
//   dateTo: z.coerce.date().optional(),
// });

// /* ─────────────────────── Admin — Roles & Sub-Admins ─────────────────────── */

// const permissionSectionSchema = z.record(z.string(), z.boolean());
// const permissionMapSchema = z.object({
//   users: permissionSectionSchema,
//   clubs: permissionSectionSchema,
//   payments: permissionSectionSchema,
//   settings: permissionSectionSchema,
// });

// export const createRoleSchema = z.object({
//   name: z.string().min(1),
//   permissions: permissionMapSchema,
// });

// export const updateRoleSchema = z
//   .object({
//     name: z.string().min(1).optional(),
//     permissions: permissionMapSchema.partial().optional(),
//   })
//   .refine((data) => Object.keys(data).length > 0, { message: "No editable fields provided" });

// export const createSubAdminSchema = z.object({
//   name: z.string().min(1),
//   email: z.string().email(),
//   password: z.string().min(8),
//   roleId: z.string().min(1),
// });

// export const updateSubAdminSchema = z
//   .object({
//     name: z.string().min(1).optional(),
//     roleId: z.string().min(1).optional(),
//     password: z.string().min(8).optional(),
//   })
//   .refine((data) => Object.keys(data).length > 0, { message: "No editable fields provided" });

// /* ─────────────────────── Admin — Settings ─────────────────────── */

// export const updateUploadProviderSchema = z.object({
//   uploadProvider: uploadProviderEnum,
// });

import { z } from "zod";

// Central place for every request-body schema in the app. Grouped by the
// route file that uses them. Kept deliberately permissive on string
// content (e.g. phone/aadhar formats) since the contract doesn't specify
// exact formats — tighten these if the frontend teams confirm stricter
// rules (e.g. a fixed Aadhar/PAN regex).

const membershipStatusEnum = z.enum([
  "payment_pending",
  "documents_pending",
  "pending_approval",
  "approved",
  "rejected",
]);

const uploadProviderEnum = z.enum(["multer", "cloudinary"]);
const documentTypeEnum = z.enum(["aadhar_front", "aadhar_back", "pan_front"]);

/* ─────────────────────── Auth — User ─────────────────────── */

export const signupStartSchema = z
  .object({
    clubId: z.string().min(1),
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    dob: z.coerce.date(),
    address: z.string().min(1),
    occupation: z.string().min(1),
    password: z.string().min(8),
  })
  .passthrough(); // contract allows "...otherMembershipFormFields"

// signatureImage: a base64 PNG data URL from the frontend's canvas
// signature pad (e.g. "data:image/png;base64,...."). Validated as a data
// URL specifically (not just any string) so a malformed/empty capture
// fails validation here rather than being stored as junk. The 500,000
// char ceiling is a generous sanity limit for a drawn signature (a
// typical one is 5-20KB as a data URL, i.e. well under 30,000 chars) —
// it exists to stop a single request from ballooning, not to accommodate
// legitimately large signatures.
const SIGNATURE_IMAGE_MAX_LENGTH = 500_000;
const signatureImageSchema = z
  .string()
  .min(1, "signatureImage is required")
  .max(SIGNATURE_IMAGE_MAX_LENGTH, "signatureImage is too large")
  .regex(/^data:image\/png;base64,/, "signatureImage must be a base64 PNG data URL");

export const signupConsentSchema = z.object({
  signupSessionId: z.string().min(1),
  consentAccepted: z.literal(true),
  consentVersion: z.string().min(1),
  signedName: z.string().min(1),
  signatureImage: signatureImageSchema,
});

export const signupOtpSendSchema = z.object({
  signupSessionId: z.string().min(1),
});

export const signupOtpVerifySchema = z.object({
  signupSessionId: z.string().min(1),
  otp: z.string().min(1),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const userLoginGoogleSchema = z.object({
  googleIdToken: z.string().min(1),
});

export const forgotPasswordOtpSendSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordOtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(1),
  newPassword: z.string().min(8),
});

/* ─────────────────────── Auth — Admin ─────────────────────── */

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/* ─────────────────────── Payments ─────────────────────── */

export const paymentVerifySchema = z.object({
  cfOrderId: z.string().min(1),
});

/* ─────────────────────── Documents & KYC ─────────────────────── */

export const uploadDocumentSchema = z.object({
  documentType: documentTypeEnum,
  aadharNumber: z.string().min(1).optional(),
  panNumber: z.string().min(1).optional(),
});

export const kycNumbersSchema = z
  .object({
    aadharNumber: z.string().min(1).optional(),
    panNumber: z.string().min(1).optional(),
  })
  .refine((data) => data.aadharNumber || data.panNumber, {
    message: "At least one of aadharNumber or panNumber is required",
  });

/* ─────────────────────── Profile ─────────────────────── */

export const updateProfileSchema = z
  .object({
    phone: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    occupation: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one of phone, address, occupation is required",
  });

/* ─────────────────────── Admin — Users ─────────────────────── */

export const adminListUsersQuerySchema = z.object({
  status: membershipStatusEnum.optional(),
  clubId: z.string().optional(),
  search: z.string().optional(),
});

export const adminCreateUserSchema = z.object({
  clubId: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  dob: z.coerce.date(),
  address: z.string().min(1),
  occupation: z.string().min(1),
  password: z.string().min(8),
  membershipStatus: membershipStatusEnum.optional(),
});

export const adminUpdateUserSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    dob: z.coerce.date().optional(),
    address: z.string().min(1).optional(),
    occupation: z.string().min(1).optional(),
    clubId: z.string().min(1).optional(),
    membershipStatus: membershipStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No editable fields provided",
  });

export const verifyDocumentSchema = z.object({
  verified: z.boolean(),
  note: z.string().optional(),
});

export const approveMembershipSchema = z.object({
  approve: z.boolean(),
  note: z.string().optional(),
});

/* ─────────────────────── Admin — Clubs ─────────────────────── */

const membershipFeeSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1).default("INR"),
});

const whatWeOfferSchema = z.object({
  purpose: z.string().default(""),
  features: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
});

export const adminCreateClubSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().default(""),
  heroImageUrl: z.string().optional(), // may be replaced by an uploaded file — see clubController
  whoWeAre: z.string().default(""),
  whatIsUnique: z.string().default(""),
  whoShouldJoin: z.string().default(""),
  howYouBenefit: z.string().default(""),
  whatWeOffer: whatWeOfferSchema.default({ purpose: "", features: [], benefits: [] }),
  membershipFee: membershipFeeSchema,
  membershipOpen: z.boolean().default(true),
});

export const adminUpdateClubSchema = z
  .object({
    slug: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    tagline: z.string().optional(),
    heroImageUrl: z.string().optional(),
    whoWeAre: z.string().optional(),
    whatIsUnique: z.string().optional(),
    whoShouldJoin: z.string().optional(),
    howYouBenefit: z.string().optional(),
    whatWeOffer: whatWeOfferSchema.partial().optional(),
    membershipFee: membershipFeeSchema.partial().optional(),
    membershipOpen: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No editable fields provided" });

/* ─────────────────────── Admin — Payments overview ─────────────────────── */

export const adminPaymentsQuerySchema = z.object({
  clubId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

/* ─────────────────────── Admin — Roles & Sub-Admins ─────────────────────── */

const permissionSectionSchema = z.record(z.string(), z.boolean());
const permissionMapSchema = z.object({
  users: permissionSectionSchema,
  clubs: permissionSectionSchema,
  payments: permissionSectionSchema,
  settings: permissionSectionSchema,
});

export const createRoleSchema = z.object({
  name: z.string().min(1),
  permissions: permissionMapSchema,
});

export const updateRoleSchema = z
  .object({
    name: z.string().min(1).optional(),
    permissions: permissionMapSchema.partial().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No editable fields provided" });

export const createSubAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string().min(1),
});

export const updateSubAdminSchema = z
  .object({
    name: z.string().min(1).optional(),
    roleId: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No editable fields provided" });

/* ─────────────────────── Admin — Settings ─────────────────────── */

export const updateUploadProviderSchema = z.object({
  uploadProvider: uploadProviderEnum,
});