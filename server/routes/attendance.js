const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get attendance records
router.get('/', authenticateToken, (req, res) => {
    const { subject, date } = req.query;
    let query = 'SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC';
    let params = [req.user.id];

    if (subject) {
        query = 'SELECT * FROM attendance WHERE user_id = ? AND subject = ? ORDER BY date DESC';
        params.push(subject);
    }

    if (date) {
        query = 'SELECT * FROM attendance WHERE user_id = ? AND date = ? ORDER BY created_at DESC';
        params = [req.user.id, date];
    }

    db.all(query, params, (err, records) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch attendance' });
        }
        res.json(records);
    });
});

// Mark attendance
router.post('/', authenticateToken, (req, res) => {
    const { subject, date, status } = req.body;

    if (!subject || !date || !status) {
        return res.status(400).json({ error: 'Subject, date, and status are required' });
    }

    db.run(
        `INSERT INTO attendance (user_id, subject, date, status) 
         VALUES (?, ?, ?, ?)`,
        [req.user.id, subject, date, status],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to mark attendance' });
            }
            res.status(201).json({
                message: 'Attendance marked successfully',
                id: this.lastID
            });
        }
    );
});

// Get attendance statistics
router.get('/stats', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            subject,
            COUNT(*) as total_classes,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
            ROUND(CAST(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS FLOAT) / 
                  COUNT(*) * 100, 2) as percentage
        FROM attendance 
        WHERE user_id = ?
        GROUP BY subject
    `;

    db.all(query, [req.user.id], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }
        res.json(stats);
    });
});

module.exports = router;
