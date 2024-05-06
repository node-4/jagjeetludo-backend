const mongoose = require("mongoose");
const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
    },
    amount: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });
const transaction = mongoose.model("bonus", transactionSchema);
module.exports = transaction;
