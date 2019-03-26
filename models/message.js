const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message: String,
    idSender: String
});

module.exports = mongoose.model('Message', messageSchema);
