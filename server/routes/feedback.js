const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all feedback
router.get('/', (req, res) => {
    const { category } = req.query;
    let query = 'SELECT * FROM feedback ORDER BY created_at DESC';
    let params = [];

    if (category && category !== 'all') {
        query = 'SELECT * FROM feedback WHERE category = ? ORDER BY created_at DESC';
        params = [category];
    }

    db.all(query, params, (err, feedback) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch feedback' });
        }
        res.json(feedback);
    });
});

// Create feedback
router.post('/', authenticateToken, (req, res) => {
    const { title, message, category, rating } = req.body;

    if (!title || !message || !category || !rating) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    db.run(
        `INSERT INTO feedback (title, message, category, rating, created_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [title, message, category, rating, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to submit feedback' });
            }
            res.status(201).json({
                message: 'Feedback submitted successfully',
                id: this.lastID
            });
        }
    );
});

// Delete feedback
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM feedback WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete feedback' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.json({ message: 'Feedback deleted successfully' });
    });
});

// Get feedback statistics
router.get('/stats/summary', (req, res) => {
    const query = `
        SELECT 
            AVG(rating) as average_rating,
            COUNT(*) as total_feedback,
            COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive,
            COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative
        FROM feedback
    `;

    db.get(query, [], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch statistics' });
        }
        res.json(stats);
    });
});

module.exports = router;
