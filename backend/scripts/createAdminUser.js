const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management_db');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
};

// Create admin user
const createAdminUser = async () => {
    try {
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ role: 'super_admin' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists:', existingAdmin.username);
            return;
        }

        // Create super admin user
        const adminUser = new User({
            firstName: 'System',
            lastName: 'Administrator',
            username: 'admin',
            email: 'admin@maherhospital.com',
            password: 'admin123', // سيتم تشفيرها تلقائياً
            phone: '+966501234567',
            role: 'super_admin',
            department: 'Administration',
            position: 'System Administrator',
            status: 'active',
            isVerified: true,
            mustChangePassword: false, // يمكن تغييرها إلى true لإجبار تغيير كلمة المرور
            permissions: User.getDefaultPermissions('super_admin')
        });

        await adminUser.save();

        console.log('✅ Super Admin user created successfully!');
        console.log('📧 Email:', adminUser.email);
        console.log('👤 Username:', adminUser.username);
        console.log('🔒 Password: admin123');
        console.log('🆔 Employee ID:', adminUser.employeeId);
        console.log('');
        console.log('🚨 IMPORTANT: Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    }
};

// Create additional test users
const createTestUsers = async () => {
    try {
        console.log('\n📝 Creating test users...');

        const testUsers = [
            {
                firstName: 'أحمد',
                lastName: 'محمد',
                username: 'doctor1',
                email: 'doctor1@maherhospital.com',
                password: 'doctor123',
                phone: '+966501234568',
                role: 'doctor',
                department: 'Internal Medicine',
                position: 'Senior Consultant'
            },
            {
                firstName: 'فاطمة',
                lastName: 'علي',
                username: 'nurse1',
                email: 'nurse1@maherhospital.com',
                password: 'nurse123',
                phone: '+966501234569',
                role: 'nurse',
                department: 'Emergency',
                position: 'Head Nurse'
            },
            {
                firstName: 'خالد',
                lastName: 'عبدالله',
                username: 'receptionist1',
                email: 'reception1@maherhospital.com',
                password: 'reception123',
                phone: '+966501234570',
                role: 'receptionist',
                department: 'Reception',
                position: 'Senior Receptionist'
            },
            {
                firstName: 'سارة',
                lastName: 'أحمد',
                username: 'accountant1',
                email: 'accountant1@maherhospital.com',
                password: 'account123',
                phone: '+966501234571',
                role: 'accountant',
                department: 'Accounting',
                position: 'Chief Accountant'
            }
        ];

        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { username: userData.username },
                    { email: userData.email }
                ]
            });

            if (existingUser) {
                console.log(`⚠️  User ${userData.username} already exists, skipping...`);
                continue;
            }

            const user = new User({
                ...userData,
                status: 'active',
                isVerified: true,
                mustChangePassword: true,
                permissions: User.getDefaultPermissions(userData.role)
            });

            await user.save();
            console.log(`✅ Created ${userData.role}: ${userData.username} (${userData.email})`);
        }

    } catch (error) {
        console.error('❌ Error creating test users:', error.message);
    }
};

// Main function
const main = async () => {
    console.log('🏥 Hospital Management System - User Setup');
    console.log('==========================================\n');

    await connectDB();
    await createAdminUser();

    // Ask if user wants to create test users
    const args = process.argv.slice(2);
    if (args.includes('--with-test-users')) {
        await createTestUsers();
    }

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📖 Usage Instructions:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Login with admin credentials');
    console.log('3. Create additional users through the admin panel');
    console.log('4. Configure user permissions as needed');

    mongoose.connection.close();
    process.exit(0);
};

// Handle process termination
process.on('SIGINT', () => {
    mongoose.connection.close();
    console.log('\n👋 Process terminated');
    process.exit(0);
});

// Run the script
main().catch(error => {
    console.error('❌ Script failed:', error);
    mongoose.connection.close();
    process.exit(1);
}); 