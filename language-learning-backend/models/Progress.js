const mongoose = require('mongoose');
const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vocabulary: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    listening: { type: Number, default: 0 },
});
module.exports = mongoose.model('Progress', progressSchema);
