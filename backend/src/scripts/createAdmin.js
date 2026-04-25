import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import connectDatabase from '../config/db.js';
import User from '../models/User.js';

const createAdmin = async () => {
  await connectDatabase();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;
  const adminAadhaar = process.env.ADMIN_AADHAAR;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminDob = process.env.ADMIN_DOB || '1990-01-01';

  if (!adminEmail || !adminPhone || !adminAadhaar || !adminPassword) {
    throw new Error('ADMIN_EMAIL, ADMIN_PHONE, ADMIN_AADHAAR, and ADMIN_PASSWORD are required');
  }

  const existingAdmin = await User.findOne({
    $or: [{ email: adminEmail.toLowerCase() }, { phone: adminPhone }, { aadhaar: adminAadhaar }],
  });

  if (existingAdmin) {
    existingAdmin.role = 'admin';
    existingAdmin.isVerified = true;
    existingAdmin.state = ['Andhra Pradesh', 'Telangana'].includes(existingAdmin.state)
      ? existingAdmin.state
      : process.env.ADMIN_STATE || 'Andhra Pradesh';
    existingAdmin.dob = existingAdmin.dob || new Date(adminDob);
    await existingAdmin.save();
    console.log(`Existing user promoted to admin: ${existingAdmin.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Election Admin',
    email: adminEmail.toLowerCase(),
    phone: adminPhone,
    aadhaar: adminAadhaar,
    dob: new Date(adminDob),
    state: process.env.ADMIN_STATE || 'Andhra Pradesh',
    password: passwordHash,
    role: 'admin',
    isVerified: true,
    hasVoted: false,
  });

  console.log(`Admin created: ${admin.email}`);
};

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
