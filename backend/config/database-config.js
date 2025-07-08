// إعدادات قاعدة البيانات
const config = {
    // اسم قاعدة البيانات الافتراضي
    DEFAULT_DB_NAME: 'hospital_management_system_demo',

    // خيارات أسماء قواعد البيانات المختلفة
    DATABASE_OPTIONS: {
        development: 'hospital_management_dev',
        testing: 'hospital_management_test',
        production: 'hospital_management_prod',
        demo: 'hospital_management_demo'
    },

    // إعدادات البيانات التجريبية
    DEMO_DATA_CONFIG: {
        TOTAL_PATIENTS: 100,
        TOTAL_DOCTORS: 25,
        TOTAL_USERS: 15,
        TOTAL_APPOINTMENTS: 200,
        TOTAL_MEDICAL_RECORDS: 150,
        TOTAL_INVOICES: 180
    },

    // إعدادات الاتصال
    CONNECTION_CONFIG: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    },

    // دالة لبناء عنوان الاتصال
    buildConnectionString: (dbName = null) => {
        const databaseName = dbName || config.DEFAULT_DB_NAME;
        const baseUrl = process.env.MONGODB_BASE_URL || 'mongodb://localhost:27017';
        return `${baseUrl}/${databaseName}`;
    },

    // دالة للحصول على اسم قاعدة البيانات من متغيرات البيئة
    getDatabaseName: () => {
        return process.env.DB_NAME ||
            process.env.DATABASE_NAME ||
            config.DEFAULT_DB_NAME;
    }
};

module.exports = config; 