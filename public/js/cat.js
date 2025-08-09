const mongoose = require('mongoose');

const catSchema = new mongoose.Schema(
  {
    cat_name: { type: String, required: true },
    adoption_status: { type: String, enum: ['Available', 'Pending', 'Adopted'], default: 'Available' },
    cat_description: { type: String, default: '' }
  },
  { collection: 'cats' }
);

module.exports = mongoose.model('Cat', catSchema);


