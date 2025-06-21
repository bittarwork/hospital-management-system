const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const invoiceRoutes = require('./routes/invoices');
const medicalRecordRoutes = require('./routes/medicalRecords');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        statusCode: 429
    }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management_db');
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

        // Database connection event listeners
        mongoose.connection.on('disconnected', () => {
            console.log('❌ MongoDB Disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Connection Error:', err);
        });

    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Hospital Management System API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/medical-records', medicalRecordRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to Maher Al-Ali Hospital Management System API',
        version: '2.0.0',
        documentation: '/api/docs',
        endpoints: {
            patients: '/api/patients',
            doctors: '/api/doctors',
            appointments: '/api/appointments',
            invoices: '/api/invoices',
            medicalRecords: '/api/medical-records',
            health: '/health'
        },
        features: [
            'Patient Management',
            'Doctor Management',
            'Appointment Scheduling',
            'Medical Records',
            'Invoice & Billing',
            'Real-time Analytics'
        ]
    });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.originalUrl} not found on this server`,
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Error Stack:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: 'fail',
            message: `Duplicate field value: ${field}`,
            field: field
        });
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid ID format'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message: message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('💾 Database connection closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('💾 Database connection closed.');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Hospital Management System v2.0.0 Ready!`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('💥 Unhandled Promise Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app; 