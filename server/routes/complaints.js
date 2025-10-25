const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all complaints
router.get('/', authenticateToken, (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM complaints ORDER BY created_at DESC';
    let params = [];

    if (status && status !== 'all') {
        query = 'SELECT * FROM complaints WHERE status = ? ORDER BY created_at DESC';
        params = [status];
    }

    db.all(query, params, (err, complaints) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }
        res.json(complaints);
    });
});

// Get single complaint
router.get('/:id', authenticateToken, (req, res) => {
    db.get('SELECT * FROM complaints WHERE id = ?', [req.params.id], (err, complaint) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch complaint' });
        }
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        res.json(complaint);
    });
});

// Create complaint
router.post('/', authenticateToken, (req, res) => {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run(
        `INSERT INTO complaints (title, description, category, created_by) 
         VALUES (?, ?, ?, ?)`,
        [title, description, category, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create complaint' });
            }
            res.status(201).json({
                message: 'Complaint submitted successfully',
                id: this.lastID
            });
        }
    );
});

// Update complaint status
router.patch('/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(
        `UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update complaint status' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Complaint not found' });
            }
            res.json({ message: 'Complaint status updated successfully' });
        }
    );
});

// Delete complaint
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM complaints WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete complaint' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        res.json({ message: 'Complaint deleted successfully' });
    });
});

// Get complaint statistics
router.get('/stats/summary', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
            COUNT(*) as total
        FROM complaints
    `;

    db.get(query, [], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }
        res.json(stats);
    });
});

module.exports = router;
