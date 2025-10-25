const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database');

initDatabase();

const app = express();
const PORT = process.env.PORT || 6900;


app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const noticesRoutes = require('./routes/notices');
const complaintsRoutes = require('./routes/complaints');
const attendanceRoutes = require('./routes/attendance');
const clubsRoutes = require('./routes/clubs');
const feedbackRoutes = require('./routes/feedback');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Campus Connect API is running' });
});

// REMOVED THE PROBLEMATIC WILDCARD ROUTE - Static files are already served above

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Campus Connect Server Running`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`📍 Frontend: Static files served from client folder\n`);
});
