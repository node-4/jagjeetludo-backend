const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyToken = (req, res, next) => {
    const token = req.get("Authorization")?.split("Bearer ")[1] || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({
            message: "no token provided! Access prohibited",
        });
    }
    jwt.verify(token, 'DMandir', async (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Session has been expired! !", });
        }
        const user1 = await User.findOne({ $or: [{ _id: decoded.id }, { _id: decoded._id }] });
        if (!user1) {
            return res.status(400).send({ message: "The user that this token belongs to does not exist" });
        }
        req.user = user1;
        next();
    });
};
module.exports = {
    verifyToken,
};
