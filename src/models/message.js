const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    id_conversation: String,
    id_sender: String,
    content: String,
    date: String
});

module.exports = mongoose.model('Message', messageSchema);
