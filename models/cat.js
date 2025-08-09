const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({
  cat_name: { type: String, required: true },
  adoption_status: {
    type: String,
    enum: ['Adopted', 'Pending', 'Available'],
    default: 'Available'
  },
  cat_description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Cat', catSchema, 'cats');


