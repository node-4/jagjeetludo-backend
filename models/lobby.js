const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
var notificationModel = new Schema({
        firstPrize: {
                type: Number
        },
        secondPrize: {
                type: Number
        },
        thirdPrize: {
                type: Number
        },
        entryFee: {
                type: Number
        },
        noOfuser: {
                type: Number,
                max: 4,
                min: 2
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCKED"],
            default: "ACTIVE"
    },
}, { timestamps: true });
module.exports = Mongoose.model("lobby", notificationModel);