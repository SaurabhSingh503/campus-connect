const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all events
router.get('/', (req, res) => {
    const { category } = req.query;
    let query = 'SELECT * FROM events ORDER BY date DESC';
    let params = [];

    if (category && category !== 'all') {
        query = 'SELECT * FROM events WHERE category = ? ORDER BY date DESC';
        params = [category];
    }

    db.all(query, params, (err, events) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch events' });
        }
        res.json(events);
    });
});

// Get single event
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, event) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch event' });
        }
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    });
});

// Create event (requires authentication)
router.post('/', authenticateToken, (req, res) => {
    const { title, description, category, date, time, venue, organizer } = req.body;

    if (!title || !description || !category || !date || !time || !venue || !organizer) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run(
        `INSERT INTO events (title, description, category, date, time, venue, organizer, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, date, time, venue, organizer, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create event' });
            }
            res.status(201).json({
                message: 'Event created successfully',
                id: this.lastID
            });
        }
    );
});

// Update event
router.put('/:id', authenticateToken, (req, res) => {
    const { title, description, category, date, time, venue, organizer } = req.body;

    db.run(
        `UPDATE events SET title = ?, description = ?, category = ?, date = ?, 
         time = ?, venue = ?, organizer = ? WHERE id = ?`,
        [title, description, category, date, time, venue, organizer, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update event' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }
            res.json({ message: 'Event updated successfully' });
        }
    );
});

// Delete event
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete event' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    });
});

module.exports = router;
