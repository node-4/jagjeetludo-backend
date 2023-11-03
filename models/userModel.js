const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var userSchema = new schema({
        firstName: {
                type: String,
                default: ""
        },
        lastName: {
                type: String,
                default: ""
        },
        mobileNumber: {
                type: String,
                default: ""
        },
        email: {
                type: String,
                default: ""
        },
        deviceToken: {
                type: String,
                default: ""
        },
        refferalCode: { type: String, },
        refferalCodeUsed: { type: Boolean, default: false, },
        refferUserId: { type: schema.Types.ObjectId, ref: "user" },
        joinUser: [{ type: schema.Types.ObjectId, ref: "user" }],
        socialId: {
                type: String,
                default: ""
        },
        socialType: {
                type: String,
                default: ""
        },
        otp: {
                type: String,
                default: ""
        },
        otpExpiration: {
                type: Date,
        },
        accountVerification: {
                type: Boolean,
                default: false,
        },
        profilePic: {
                type: String,
                default: ""
        },
        password: {
                type: String,
                default: ""
        },
        status: {
                type: String,
                default: "ACTIVE",
        },
        wallet: {
                type: Number,
                default: 0,
        },
        deposite: {
                type: Number,
                default: 0,
        },
        winning: {
                type: Number,
                default: 0,
        },
        bonus: {
                type: Number,
                default: 0,
        },
        language: {
                type: String,
                enum: ["Hindi", "English"],
        },
        music: {
                type: Boolean,
                default: false,
        },
        sound: {
                type: Boolean,
                default: false,
        },
        userType: {
                type: String,
                enum: ["USER", "ADMIN"],
                default: "USER"
        },
},
        { timestamps: true });
userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("user", userSchema);