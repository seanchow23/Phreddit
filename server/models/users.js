const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Invalid email format'],
    },
    displayName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    reputation: {
        type: Number,
        default: 100, // Default reputation for regular users
    },
    isAdmin: {
        type: Boolean,
        default: false, // False for regular users, true for admin
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
