const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    name: String,
    description: String,
    tags: [String],
    avatar: String,
    contributorsIds: [String]
});

conversationSchema.index({
    name: 'text',
    description: 'text',
}, {
    weights: {
        name: 5,
        description: 1,
    },
});

module.exports = mongoose.model('Conversation', conversationSchema);
