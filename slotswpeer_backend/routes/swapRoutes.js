// routes/swapRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const SwapRequest = require('../models/SwapRequest');

const router = express.Router();

// GET swappable slots (others' slots with status SWAPPABLE)
router.get('/swappable-slots', auth, async (req, res) => {
  try {
    const slots = await Event.find({ status: 'SWAPPABLE', user: { $ne: req.user.id } })
      .populate('user', 'name email')
      .sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: 'Cannot fetch swappable slots' });
  }
});

// POST swap-request { myEventId, theirEventId }
router.post('/swap-request', auth, async (req, res) => {
  const { myEventId, theirEventId } = req.body;
  if (!myEventId || !theirEventId) return res.status(400).json({ error: 'Missing ids' });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const myEvent = await Event.findById(myEventId).session(session);
    const theirEvent = await Event.findById(theirEventId).session(session);

    if (!myEvent || !theirEvent) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'One or both events not found' });
    }

    if (myEvent.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'You do not own myEvent' });
    }

    if (myEvent.status !== 'SWAPPABLE' || theirEvent.status !== 'SWAPPABLE') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Both events must be SWAPPABLE' });
    }

    // Create swap request
    const swap = new SwapRequest({
      requester: req.user.id,
      responder: theirEvent.user,
      myEvent: myEvent._id,
      theirEvent: theirEvent._id,
      status: 'PENDING'
    });

    await swap.save({ session });

    // Set both events to SWAP_PENDING
    myEvent.status = 'SWAP_PENDING';
    theirEvent.status = 'SWAP_PENDING';
    await myEvent.save({ session });
    await theirEvent.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await SwapRequest.findById(swap._id)
      .populate('requester', 'name email')
      .populate('responder', 'name email')
      .populate('myEvent')
      .populate('theirEvent');

    res.status(201).json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ error: 'Swap request failed' });
  }
});

// GET incoming requests
router.get('/requests/incoming', auth, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ responder: req.user.id }).populate('requester responder myEvent theirEvent').sort({ createdAt: -1 });
    res.json(incoming);
  } catch (err) {
    res.status(500).json({ error: 'Cannot fetch incoming requests' });
  }
});

// GET outgoing requests
router.get('/requests/outgoing', auth, async (req, res) => {
  try {
    const outgoing = await SwapRequest.find({ requester: req.user.id }).populate('requester responder myEvent theirEvent').sort({ createdAt: -1 });
    res.json(outgoing);
  } catch (err) {
    res.status(500).json({ error: 'Cannot fetch outgoing requests' });
  }
});

// POST /swap-response/:requestId { accept: true/false }
router.post('/swap-response/:requestId', auth, async (req, res) => {
  const { requestId } = req.params;
  const { accept } = req.body;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const swap = await SwapRequest.findById(requestId).session(session);
    if (!swap) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Request not found' });
    }

    if (swap.responder.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ error: 'Not authorized to respond' });
    }

    if (swap.status !== 'PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Swap already processed' });
    }

    const myEvent = await Event.findById(swap.myEvent).session(session);
    const theirEvent = await Event.findById(swap.theirEvent).session(session);

    if (!myEvent || !theirEvent) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Events missing' });
    }

    if (myEvent.status !== 'SWAP_PENDING' || theirEvent.status !== 'SWAP_PENDING') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Events not in SWAP_PENDING' });
    }

    if (!accept) {
      // Reject: set request to REJECTED and revert events to SWAPPABLE
      swap.status = 'REJECTED';
      await swap.save({ session });
      myEvent.status = 'SWAPPABLE';
      theirEvent.status = 'SWAPPABLE';
      await myEvent.save({ session });
      await theirEvent.save({ session });

      await session.commitTransaction();
      session.endSession();
      return res.json({ status: 'REJECTED' });
    }

    // Accept: swap owners and set events to BUSY; set swap.status = ACCEPTED
    // Validate owner mapping
    if (myEvent.user.toString() !== swap.requester.toString() || theirEvent.user.toString() !== swap.responder.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Ownership mismatch' });
    }

    // Swap owners
    const requesterId = swap.requester;
    const responderId = swap.responder;
    myEvent.user = responderId;
    theirEvent.user = requesterId;
    myEvent.status = 'BUSY';
    theirEvent.status = 'BUSY';

    await myEvent.save({ session });
    await theirEvent.save({ session });

    swap.status = 'ACCEPTED';
    await swap.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await SwapRequest.findById(swap._id).populate('requester responder myEvent theirEvent');
    res.json({ status: 'ACCEPTED', swap: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ error: 'Swap response failed' });
  }
});

module.exports = router;
