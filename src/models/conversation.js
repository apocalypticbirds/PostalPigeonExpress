const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    name: String,
    contributorsIds: [String],
    avatarUrl: String,
});

module.exports = mongoose.model('Conversation', conversationSchema);
