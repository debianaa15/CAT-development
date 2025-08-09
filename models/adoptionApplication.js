const mongoose = require('mongoose');

const adoptionApplicationSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    cat_id: { type: String, default: null },
    cat_name: { type: String, default: null },
    application_date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Scheduled'], default: 'Pending' }
  },
  { collection: 'adoption_applications' }
);

module.exports = mongoose.model('AdoptionApplication', adoptionApplicationSchema);


