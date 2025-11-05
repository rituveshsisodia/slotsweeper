// models/SwapRequest.js
const mongoose = require('mongoose');

const swapStatus = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

const swapSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who offered myEvent
  responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // owner of theirEvent
  myEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  theirEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: swapStatus, default: 'PENDING' },
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', swapSchema);
