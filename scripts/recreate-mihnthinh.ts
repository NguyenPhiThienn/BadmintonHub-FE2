import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/badminton-hub';

async function recreateMihnThinhAccount() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection;

    if (db.readyState !== 1) {
      await new Promise((resolve) => db.once('open', resolve));
    }

    const email = 'pvmthinh2002@gmail.com';
    const phone = '0999999999';
    const fullName = 'Phạm Văn Minh Thịnh';
    const newPassword = 'password123'; // Có thể đổi password mới tại đây

    // 1. Xóa tài khoản cũ nếu tồn tại
    console.log(`Checking for existing account with email: ${email}...`);
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      console.log(`Found existing user: ${existingUser.fullName} (${existingUser._id})`);
      console.log(`Deleting old account...`);
      await db.collection('users').deleteOne({ _id: existingUser._id });
      console.log('Old account deleted successfully.');
    } else {
      console.log('No existing account found.');
    }

    // 2. Tạo tài khoản mới
    console.log('Creating new account...');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const newUser = {
      fullName,
      email,
      phone,
      role: 'ADMIN',
      passwordHash,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);
    console.log(`\n✅ Account recreated successfully!`);
    console.log(`   User ID: ${result.insertedId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phone}`);
    console.log(`   Role: ADMIN`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n   Avatar URL: ${newUser.avatarUrl}`);

  } catch (error) {
    console.error('Error recreating account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

recreateMihnThinhAccount();
