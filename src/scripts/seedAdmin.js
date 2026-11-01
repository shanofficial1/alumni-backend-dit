
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/User.js";

async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in environment variables."
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const email = ADMIN_EMAIL.toLowerCase().trim();

  await connectDB();

  try {
    // Check whether the admin already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== "admin") {
        throw new Error(
          "This email already belongs to a non-admin account."
        );
      }

      console.log(`Admin account already exists: ${email}`);
      console.log("Existing admin password has not been changed.");
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create the admin account
    const admin = await User.create({
      fullName: ADMIN_NAME,
      email,
      passwordHash,
      mobile: "0000000000",
      program: "ADMIN",
      batch: "ADMIN",
      workingStatus: "Unemployed",
      role: "admin",
    });

    console.log(`Admin account created successfully: ${admin.email}`);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin().catch((error) => {
  console.error("Admin seed failed:", error.message);
  process.exitCode = 1;
});


