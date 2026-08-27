/* eslint-disable no-console */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db";
import { AdminAccount } from "../src/models/AdminAccount";
import { Role, DEFAULT_PERMISSIONS } from "../src/models/Role";

// Seeds ONE deliberately-restricted sub-admin (users.view only — everything
// else false) purely so this epic's "confirm 403s behave correctly" testing
// step has something to log in as without needing the admin panel's
// role/sub-admin UI (that's Epic 4). Safe to re-run.
async function seedSubAdmin() {
  await connectDB();

  const roleName = "Read-Only Users Viewer (seeded for testing)";
  const permissions = {
    ...DEFAULT_PERMISSIONS,
    users: { ...DEFAULT_PERMISSIONS.users, view: true },
  };

  const role = await Role.findOneAndUpdate(
    { name: roleName },
    { $set: { name: roleName, permissions } },
    { upsert: true, new: true }
  );

  const email = (process.env.SUB_ADMIN_EMAIL || "subadmin@ashworthclub.test").toLowerCase().trim();
  const password = process.env.SUB_ADMIN_PASSWORD || "ChangeMeNow123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const subAdmin = await AdminAccount.findOneAndUpdate(
    { email },
    { $set: { name: "Seeded Sub Admin", email, passwordHash, type: "sub_admin", roleId: role._id } },
    { upsert: true, new: true }
  );

  console.log(`Sub-admin ready: ${subAdmin.email} (role: ${role.name}, id: ${subAdmin._id})`);
  console.log("This account can only GET /api/admin/users and GET /api/admin/users/:id — everything else should 403.");
  await mongoose.disconnect();
}

seedSubAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
