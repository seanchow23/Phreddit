const mongoose = require('mongoose');
const { Schema } = mongoose;

const LinkFlairSchema = new Schema({
    content: { type: String, required: true, maxlength: 30 }
});

// Virtual for link flair URL
LinkFlairSchema.virtual('url').get(function() {
    return `/linkFlairs/${this._id}`;
});

module.exports = mongoose.model('LinkFlair', LinkFlairSchema);
