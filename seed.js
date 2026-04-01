require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const FinancialRecord = require('./src/models/FinancialRecord');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const seedUsers = async () => {
  await User.deleteMany({});

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@finance.com', password: await bcrypt.hash('admin123', 12), role: 'admin', isActive: true },
    { name: 'Alice Analyst', email: 'analyst@finance.com', password: await bcrypt.hash('analyst123', 12), role: 'analyst', isActive: true },
    { name: 'Victor Viewer', email: 'viewer@finance.com', password: await bcrypt.hash('viewer123', 12), role: 'viewer', isActive: true },
  ]);

  console.log(`Seeded ${users.length} users`);
  return users;
};

const seedRecords = async (adminId) => {
  await FinancialRecord.deleteMany({});

  const categories = ['salary', 'freelance', 'rent', 'food', 'transport', 'utilities', 'entertainment', 'healthcare'];
  const records = [];

  for (let i = 0; i < 30; i++) {
    const isIncome = i % 3 === 0;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180));

    records.push({
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      type: isIncome ? 'income' : 'expense',
      category: isIncome
        ? ['salary', 'freelance', 'investment'][i % 3]
        : categories[Math.floor(Math.random() * categories.length)],
      date,
      notes: `Sample ${isIncome ? 'income' : 'expense'} record #${i + 1}`,
      createdBy: adminId,
    });
  }

  await FinancialRecord.insertMany(records);
  console.log(`Seeded ${records.length} financial records`);
};

const seed = async () => {
  try {
    await connectDB();
    const users = await seedUsers();
    await seedRecords(users[0]._id);
    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo credentials:');
    console.log('  Admin   → admin@finance.com    / admin123');
    console.log('  Analyst → analyst@finance.com  / analyst123');
    console.log('  Viewer  → viewer@finance.com   / viewer123\n');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
