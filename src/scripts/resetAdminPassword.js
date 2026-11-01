
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

async function resetAdminPassword() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  await connectDB();

  try {
    const admin = await User.findOne({ email }).select("+passwordHash");

    if (!admin) {
      throw new Error(`Admin account not found: ${email}`);
    }

    if (admin.role !== "admin") {
      throw new Error("This account does not have admin privileges.");
    }

    admin.passwordHash = await bcrypt.hash(password, 12);
    await admin.save();

    console.log(`Admin password reset successfully for: ${email}`);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword().catch((error) => {
  console.error("Password reset failed:", error.message);
  process.exitCode = 1;
});
