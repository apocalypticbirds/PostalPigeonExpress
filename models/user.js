const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    conversationsIds: [String],
    contributorsIds: [String]
});

module.exports = mongoose.model('User', userSchema);
