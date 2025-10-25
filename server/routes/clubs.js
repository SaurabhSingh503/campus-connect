const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all clubs
router.get('/', (req, res) => {
    const { category } = req.query;
    let query = 'SELECT * FROM clubs ORDER BY created_at DESC';
    let params = [];

    if (category && category !== 'all') {
        query = 'SELECT * FROM clubs WHERE category = ? ORDER BY created_at DESC';
        params = [category];
    }

    db.all(query, params, (err, clubs) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch clubs' });
        }
        res.json(clubs);
    });
});

// Get single club
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM clubs WHERE id = ?', [req.params.id], (err, club) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch club' });
        }
        if (!club) {
            return res.status(404).json({ error: 'Club not found' });
        }
        res.json(club);
    });
});

// Create club
router.post('/', authenticateToken, (req, res) => {
    const { name, description, category, coordinator } = req.body;

    if (!name || !description || !category || !coordinator) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run(
        `INSERT INTO clubs (name, description, category, coordinator, created_by) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, description, category, coordinator, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create club' });
            }

            // Auto-join creator to the club
            db.run(
                'INSERT INTO club_members (club_id, user_id) VALUES (?, ?)',
                [this.lastID, req.user.id]
            );

            res.status(201).json({
                message: 'Club created successfully',
                id: this.lastID
            });
        }
    );
});

// Join club
router.post('/:id/join', authenticateToken, (req, res) => {
    db.run(
        'INSERT INTO club_members (club_id, user_id) VALUES (?, ?)',
        [req.params.id, req.user.id],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Already a member' });
                }
                return res.status(500).json({ error: 'Failed to join club' });
            }

            // Update member count
            db.run('UPDATE clubs SET members = members + 1 WHERE id = ?', [req.params.id]);

            res.json({ message: 'Joined club successfully' });
        }
    );
});

// Leave club
router.post('/:id/leave', authenticateToken, (req, res) => {
    db.run(
        'DELETE FROM club_members WHERE club_id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to leave club' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Not a member of this club' });
            }

            // Update member count
            db.run('UPDATE clubs SET members = members - 1 WHERE id = ?', [req.params.id]);

            res.json({ message: 'Left club successfully' });
        }
    );
});

// Delete club
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM clubs WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete club' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Club not found' });
        }

        // Delete all club members
        db.run('DELETE FROM club_members WHERE club_id = ?', [req.params.id]);

        res.json({ message: 'Club deleted successfully' });
    });
});

module.exports = router;
