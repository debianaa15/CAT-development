const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true }, // Full name
    email: { type: String, required: true, unique: true },
    user_password: { type: String, required: true }, // Hashed password
    user_role: { type: String, enum: ['Volunteer', 'Trainer'], required: true },
    user_quota: { type: String, enum: ['Completed', 'Incomplete'], default: 'Incomplete' }
});

// Hash password before saving (if new or modified)
userSchema.pre('save', async function (next) {
    if (!this.isModified('user_password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.user_password = await bcrypt.hash(this.user_password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Password verification method
userSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.user_password);
};

module.exports = mongoose.model('User', userSchema);
