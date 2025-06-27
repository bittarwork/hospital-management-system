const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management_db');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
};

// Fix admin permissions
const fixAdminPermissions = async () => {
    try {
        console.log('🔧 Fixing admin user permissions...');

        // Find admin user
        const adminUser = await User.findOne({ username: 'admin' });

        if (!adminUser) {
            console.log('❌ Admin user not found. Creating new admin user...');

            // Create new admin user
            const newAdmin = new User({
                firstName: 'System',
                lastName: 'Administrator',
                username: 'admin',
                email: 'admin@maherhospital.com',
                password: 'admin123',
                phone: '+966501234567',
                role: 'super_admin',
                department: 'Administration',
                position: 'System Administrator',
                status: 'active',
                isVerified: true,
                mustChangePassword: false,
                permissions: User.getDefaultPermissions('super_admin')
            });

            await newAdmin.save();
            console.log('✅ New admin user created successfully!');
            console.log('📧 Email:', newAdmin.email);
            console.log('👤 Username:', newAdmin.username);
            console.log('🔒 Password: admin123');
            console.log('🆔 Employee ID:', newAdmin.employeeId);

        } else {
            console.log('👤 Found existing admin user:', adminUser.username);
            console.log('🔍 Current role:', adminUser.role);
            console.log('🔍 Current permissions:', adminUser.permissions.length, 'modules');

            // Update admin with correct role and permissions
            adminUser.role = 'super_admin';
            adminUser.status = 'active';
            adminUser.permissions = User.getDefaultPermissions('super_admin');

            await adminUser.save();

            console.log('✅ Admin user updated successfully!');
            console.log('🔧 New role:', adminUser.role);
            console.log('🔧 New permissions:', adminUser.permissions.length, 'modules');
            console.log('📋 Modules:', adminUser.permissions.map(p => p.module).join(', '));
        }

        // Verify permissions
        const updatedAdmin = await User.findOne({ username: 'admin' });
        console.log('\n🧪 Testing permissions:');
        console.log('- Patients read:', updatedAdmin.hasPermission('patients', 'read'));
        console.log('- Patients manage:', updatedAdmin.hasPermission('patients', 'manage'));
        console.log('- Users manage:', updatedAdmin.hasPermission('users', 'manage'));

        console.log('\n🎉 Admin permissions fix completed!');

    } catch (error) {
        console.error('❌ Error fixing admin permissions:', error.message);
    }
};

// Main execution
const main = async () => {
    console.log('🏥 Hospital Management System - Admin Fix');
    console.log('=========================================\n');

    await connectDB();
    await fixAdminPermissions();

    console.log('\n💡 Next steps:');
    console.log('1. Clear browser localStorage/sessionStorage');
    console.log('2. Login again with: admin / admin123');
    console.log('3. Try accessing patients page');

    process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Run the script
main(); 