import mongoose, { Schema } from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/badminton_hub';

const userSchema = new Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function cleanupUsers() {
  await mongoose.connect(MONGO_URI);
  
  const allowedEmails = ['pvmthinh2002@gmail.com', 'phithien1007@gmail.com'];
  
  const usersToDelete = await User.find({
    email: { $nin: allowedEmails }
  });
  
  console.log(`Tong so users trong database: ${await User.countDocuments()}`);
  console.log(`Users can xoa: ${usersToDelete.length}\n`);
  
  if (usersToDelete.length === 0) {
    console.log('Khong co user nao can xoa!');
    process.exit(0);
  }
  
  console.log('Users se bi xoa:');
  usersToDelete.forEach((user: any, index: number) => {
    console.log(`  ${index + 1}. ${user.email} (${user.fullName || 'No name'}) - Role: ${user.role} - ID: ${user._id}`);
  });
  
  console.log('\nUsers duoc giu lai:');
  const keptUsers = await User.find({ email: { $in: allowedEmails } });
  keptUsers.forEach((user: any) => {
    console.log(`  > ${user.email} (${user.fullName || 'No name'})`);
  });
  
  console.log('\nDang xoa users...\n');
  
  const result = await User.deleteMany({
    email: { $nin: allowedEmails }
  });
  
  console.log(`Da xoa ${result.deletedCount} users!`);
  console.log(`So users con lai: ${await User.countDocuments()}`);
  
  await mongoose.disconnect();
  process.exit(0);
}

cleanupUsers().catch(err => {
  console.error('Loi:', err);
  process.exit(1);
});
