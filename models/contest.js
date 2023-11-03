const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
var notificationModel = new Schema({
        contestId: {
                type: String,
        },
        users: [{
                type: Mongoose.Schema.Types.ObjectId,
                ref: "user"
        }],
        winner: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
        IInd: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
        IIIrd: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
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
        joined: {
                type: Number,
                default: 0
        },
        status: {
                type: String,
                enum: ["ACTIVE", "BLOCKED", "COMPLETE"],
                default: "ACTIVE"
        },
}, { timestamps: true });
module.exports = Mongoose.model("contest", notificationModel);