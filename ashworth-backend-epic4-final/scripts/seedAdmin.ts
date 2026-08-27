/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db";
import { AdminAccount } from "../src/models/AdminAccount";

// Bootstraps the one super-admin account, since there's no signup UI for
// admins. Reads credentials from env so the password never lives in source
// control; safe to re-run (upserts by email).
//
//   SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
//
// Defaults are provided ONLY for local/dev convenience — override them via
// env for anything beyond a throwaway local database.
async function seedAdmin() {
  await connectDB();

  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const email = (process.env.SUPER_ADMIN_EMAIL || "admin@ashworthclub.test").toLowerCase().trim();
  const password = process.env.SUPER_ADMIN_PASSWORD || "ChangeMeNow123!";

  if (!process.env.SUPER_ADMIN_PASSWORD) {
    console.warn(
      "[seedAdmin] SUPER_ADMIN_PASSWORD not set in env — using an insecure default. " +
        "Set it before running against anything but a local throwaway database."
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await AdminAccount.findOneAndUpdate(
    { email },
    { $set: { name, email, passwordHash, type: "admin", roleId: null } },
    { upsert: true, new: true }
  );

  console.log(`Super admin ready: ${admin.email} (id: ${admin._id})`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
