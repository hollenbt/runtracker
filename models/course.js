const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

var courseSchema = new mongoose.Schema({
    username: {type: String, index: true},
    name: String,
    distance: Number,
    route: {}
});

courseSchema.plugin(passportLocalMongoose);

const Course = mongoose.model('course', courseSchema);
module.exports = Course;