const mongoose = require('mongoose');

Number.prototype.prependZero = function() {
    if (this < 10 && this >= 0)
        return "0" + String(this);
    return String(this);
}

var runSchema = new mongoose.Schema({
    username: String,
    date: Date,
    distance: Number,
    duration: Number
});

runSchema.index({ username: 1, date: -1 });

runSchema.virtual('pace').get(function() {
    var rate = this.duration / this.distance; // minutes per mile
    var min = parseInt(rate);
    var sec = Math.round(60 * (rate - min));
    return min + ":" + sec.prependZero();
});

runSchema.virtual('dateString').get(function() {
    var s = this.date.toLocaleString();
    return s.split(',')[0];
});

//runSchema.virtual('')

const Run = mongoose.model('run', runSchema);
module.exports = Run;