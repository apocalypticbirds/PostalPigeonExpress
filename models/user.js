const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: String,
    firstName: String,
    lastName: String,
    conversations: [String]
});

module.exports = mongoose.model('User', userSchema);
