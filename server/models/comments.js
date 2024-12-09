const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
    content: { type: String, required: true, minlength: 1, maxlength: 500 }, // Validates comment length
    commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // References to replies
    commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    commentedDate: { type: Date, default: Date.now }, // Automatically sets comment timestamp
    upvotes: { type: Number, default: 0 }, // Tracks upvotes
    downvotes: { type: Number, default: 0 }, // Tracks downvotes
    voteCount: {
        type: Number,
        default: function () {
            return this.upvotes - this.downvotes; // Automatically calculates net votes
        },
    },
});

// Virtual for comment URL
CommentSchema.virtual('url').get(function () {
    return `/comments/${this._id}`;
});

module.exports = mongoose.model('Comment', CommentSchema);
