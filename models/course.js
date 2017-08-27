const mongoose = require('mongoose');

var courseSchema = new mongoose.Schema({
    username: {type: String, index: true},
    name: String,
    distance: Number,
    route: String
});

const Course = mongoose.model('course', courseSchema);
module.exports = Course;