const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all notices
router.get('/', (req, res) => {
    const { priority } = req.query;
    let query = 'SELECT * FROM notices ORDER BY created_at DESC';
    let params = [];

    if (priority && priority !== 'all') {
        query = 'SELECT * FROM notices WHERE priority = ? ORDER BY created_at DESC';
        params = [priority];
    }

    db.all(query, params, (err, notices) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch notices' });
        }
        res.json(notices);
    });
});

// Get single notice
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM notices WHERE id = ?', [req.params.id], (err, notice) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch notice' });
        }
        if (!notice) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        res.json(notice);
    });
});

// Create notice (requires authentication)
router.post('/', authenticateToken, (req, res) => {
    const { title, content, priority, author } = req.body;

    if (!title || !content || !author) {
        return res.status(400).json({ error: 'Title, content, and author are required' });
    }

    db.run(
        `INSERT INTO notices (title, content, priority, author, created_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [title, content, priority || 'normal', author, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create notice' });
            }
            res.status(201).json({
                message: 'Notice created successfully',
                id: this.lastID
            });
        }
    );
});

// Update notice
router.put('/:id', authenticateToken, (req, res) => {
    const { title, content, priority, author } = req.body;

    db.run(
        `UPDATE notices SET title = ?, content = ?, priority = ?, author = ? WHERE id = ?`,
        [title, content, priority, author, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update notice' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Notice not found' });
            }
            res.json({ message: 'Notice updated successfully' });
        }
    );
});

// Delete notice
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM notices WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete notice' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        res.json({ message: 'Notice deleted successfully' });
    });
});

module.exports = router;
