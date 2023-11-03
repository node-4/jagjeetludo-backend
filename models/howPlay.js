const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
var howToplayModel = new Schema({
        description: {
                type: Array
        },
}, { timestamps: true });
module.exports = Mongoose.model("howToplay", howToplayModel);