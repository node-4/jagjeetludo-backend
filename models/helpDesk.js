const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
var notificationModel = new Schema({
        email: {
                type: String
        },
        mobileNumber: {
                type: String
        },
        whatApp: {
                type: String
        },
}, { timestamps: true });
module.exports = Mongoose.model("helpDesk", notificationModel);