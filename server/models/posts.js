const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
    title: { type: String, required: true, maxlength: 100 },
    content: { type: String, required: true },
    linkFlairID: { type: mongoose.Schema.Types.ObjectId, ref: 'LinkFlair' },
    postedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postedDate: { type: Date, default: Date.now },
    commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voteCount: {
        type: Number,
        default: function () {
            return this.upvotes - this.downvotes;
        },
    },
    
});

// Virtual for post URL
PostSchema.virtual('url').get(function () {
    return `/posts/${this._id}`;
});

module.exports = mongoose.model('Post', PostSchema);
