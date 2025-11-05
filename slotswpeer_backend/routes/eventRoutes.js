// routes/eventRoutes.js
const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get all events for current user
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Cannot fetch events' });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const { title, startTime, endTime } = req.body;
    const ev = new Event({ title, startTime, endTime, user: req.user.id, status: 'BUSY' });
    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: 'Cannot create event' });
  }
});

// Update event (e.g., toggle status)
router.put('/:id', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    if (ev.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

    const updates = req.body;
    Object.assign(ev, updates);
    await ev.save();
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: 'Cannot update event' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    if (ev.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

    await ev.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Cannot delete event' });
  }
});

module.exports = router;
