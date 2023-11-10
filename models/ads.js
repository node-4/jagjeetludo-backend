const mongoose = require("mongoose");
const vendorDetailsSchema = new mongoose.Schema({
        users: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
        }],
        title: {
                type: String,
        },
        description: {
                type: String,
        },
        coins: {
                type: Number,
        },
        video: {
                type: String,
        },
}, {
        timestamps: true
});

module.exports = mongoose.model("ads", vendorDetailsSchema);
