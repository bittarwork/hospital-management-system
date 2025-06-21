module.exports = {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management_db',

    // Frontend Configuration
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-hospital-system-2024',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

    // Email Configuration (Optional)
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',

    // Hospital Information
    HOSPITAL_NAME: process.env.HOSPITAL_NAME || 'مستشفى ماهر العلي',
    HOSPITAL_ADDRESS: process.env.HOSPITAL_ADDRESS || 'المملكة العربية السعودية',
    HOSPITAL_PHONE: process.env.HOSPITAL_PHONE || '+966-11-1234567',
    HOSPITAL_EMAIL: process.env.HOSPITAL_EMAIL || 'info@maherhospital.com'
}; 