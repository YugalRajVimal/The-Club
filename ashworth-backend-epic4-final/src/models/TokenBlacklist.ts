import { Schema, model, Document as MongooseDocument } from "mongoose";

export interface ITokenBlacklist extends MongooseDocument {
  token: string; // sha256 hash of the raw JWT, never the raw token itself
  expiresAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// TTL matching the token's own expiry — once the JWT would have expired
// naturally anyway, there's no need to keep blacklisting it.
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = model<ITokenBlacklist>("TokenBlacklist", TokenBlacklistSchema);
