const bcrypt = require('bcrypt');
const { User, syncDB } = require('../models');
const { connectDB } = require('../config/db');
require('dotenv').config({ path: '../../.env' }); 

const seedAdmin = async () => {
  try {
    await connectDB();
    await syncDB(); // Sync schema to add 'role' field if missing
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'KKStechnologies2022@';
    
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating role to superadmin...');
      existingAdmin.role = 'superadmin';
      await existingAdmin.save();
      console.log('Admin role updated! ✅');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await User.create({
      firstName: 'Admin',
      lastName: 'System',
      email: adminEmail,
      password: hashedPassword,
      role: 'superadmin',
      emailVerified: true,
      phoneVerified: true,
    });
    
    console.log('\n==========================================');
    console.log('Superadmin user seeded successfully! ✅');
    console.log('Email:    ' + adminEmail);
    console.log('Password: ' + adminPassword);
    console.log('==========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
