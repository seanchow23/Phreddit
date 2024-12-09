const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommunitySchema = new Schema({
    name: { type: String, required: true, minlength: 1, maxlength: 100 },
    description: { type: String, required: true, minlength: 10, maxlength: 500 },
    postIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // References to posts in the community
    startDate: { type: Date, default: Date.now }, // Automatically sets community creation date
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of user references
    //moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Optional: List of moderator references
    memberCount: { type: Number, default: 0 }, // Automatically tracks member count
    //tags: [{ type: String }], // Optional: Tags for categorization
    //coverImage: { type: String }, // Optional: Community icon or cover image
});

// Virtual for community URL
CommunitySchema.virtual('url').get(function () {
    return `/communities/${this._id}`;
});

module.exports = mongoose.model('Community', CommunitySchema);
