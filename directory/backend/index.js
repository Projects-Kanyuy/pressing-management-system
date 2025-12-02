const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Database connection
const connectDB = require('./DBConn/conn');
connectDB();

// Middleware
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Press Directory API is running' });
});

// API Routes
const directoryAdminRoutes = require('./routes/directoryAdmin');
const directoryRoutes = require('./routes/directory');
const uploadRoutes = require('./routes/uploads');
const priceListRoutes = require('./routes/priceList');

app.use('/api/directory-admins', directoryAdminRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/price-list', priceListRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
});
