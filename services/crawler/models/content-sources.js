const mongoose = require('mongoose');

const contentSourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    homepage: {
        type: String,
        required: false,
    },
    establishedYear: {
        type: Number,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('ContentSource', contentSourceSchema);