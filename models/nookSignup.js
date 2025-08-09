const mongoose = require('mongoose');

const nookSignupSchema = new mongoose.Schema({
  slot_id: {
    type: Number,
    required: true
  },
  volunteer_id: {
    type: String,
    required: true
  },
  volunteer_name: {
    type: String,
    required: true
  },
  slot_date: {
    type: String,
    required: true
  },
  slot_day: {
    type: String,
    required: true
  },
  is_trainer: {
    type: Boolean,
    default: false
  },
  signed_up_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NookSignup', nookSignupSchema, 'nook_signups');
