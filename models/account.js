const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

var accountSchema = new mongoose.Schema({
    username: {type: String, unique: true, index: true}
});

accountSchema.plugin(passportLocalMongoose);

const Account = mongoose.model('account', accountSchema);
module.exports = Account;