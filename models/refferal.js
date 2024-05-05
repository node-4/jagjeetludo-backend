const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
    },
    noOfRefferal: {
        type: Number,
        default: 0,
    },
    amount: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });
const transaction = mongoose.model("refferal", transactionSchema);
module.exports = transaction;
