const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database');

initDatabase();

const app = express();
const PORT = process.env.PORT || 6900;

// CORS - Allow all origins for development
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes MUST come before static files
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const noticesRoutes = require('./routes/notices');
const complaintsRoutes = require('./routes/complaints');
const attendanceRoutes = require('./routes/attendance');
const clubsRoutes = require('./routes/clubs');
const feedbackRoutes = require('./routes/feedback');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Campus Connect API is running', timestamp: new Date().toISOString() });
});

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, '../client')));

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`\n✅ Campus Connect Server Running`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log(`\n🔧 Press Ctrl+C to stop\n`);
});
