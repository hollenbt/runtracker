const mongoose = require('mongoose');

var runSchema = new mongoose.Schema({
    username: String,
    date: Date,
    distance: Number,
    duration: Number
});

runSchema.index({ username: 1, date: -1 });

const Run = mongoose.model('run', runSchema);
module.exports = Run;