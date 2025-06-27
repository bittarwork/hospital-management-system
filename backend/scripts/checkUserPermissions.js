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

// Check user permissions
const checkUserPermissions = async () => {
    try {
        console.log('🔍 Checking admin user permissions...\n');

        // Find admin user
        const adminUser = await User.findOne({ username: 'admin' });

        if (!adminUser) {
            console.log('❌ Admin user not found!');
            return;
        }

        console.log('👤 Admin User Details:');
        console.log('   ID:', adminUser._id);
        console.log('   Username:', adminUser.username);
        console.log('   Role:', adminUser.role);
        console.log('   Status:', adminUser.status);
        console.log('   Is Verified:', adminUser.isVerified);
        console.log('   Must Change Password:', adminUser.mustChangePassword);

        console.log('\n🔑 Permissions:');
        console.log('   Total Modules:', adminUser.permissions.length);

        adminUser.permissions.forEach((perm, index) => {
            console.log(`   ${index + 1}. ${perm.module}: [${perm.actions.join(', ')}]`);
        });

        console.log('\n🧪 Permission Tests:');
        console.log('   patients read:', adminUser.hasPermission('patients', 'read'));
        console.log('   patients create:', adminUser.hasPermission('patients', 'create'));
        console.log('   patients update:', adminUser.hasPermission('patients', 'update'));
        console.log('   patients delete:', adminUser.hasPermission('patients', 'delete'));
        console.log('   patients manage:', adminUser.hasPermission('patients', 'manage'));

        console.log('\n🎯 Role Check:');
        console.log('   Is super_admin:', adminUser.role === 'super_admin');
        console.log('   Is admin:', adminUser.role === 'admin');

        // Test method availability
        console.log('\n🔧 Method Tests:');
        console.log('   hasPermission method exists:', typeof adminUser.hasPermission === 'function');

        if (typeof adminUser.hasPermission === 'function') {
            console.log('   ✅ hasPermission method is available');
        } else {
            console.log('   ❌ hasPermission method is NOT available');
        }

    } catch (error) {
        console.error('❌ Error checking user permissions:', error.message);
    }
};

// Main execution
const main = async () => {
    console.log('🏥 Hospital Management System - Permission Check');
    console.log('==============================================\n');

    await connectDB();
    await checkUserPermissions();

    process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Run script
main(); 