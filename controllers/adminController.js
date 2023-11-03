const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const contest = require("../models/contest");
const notification = require("../models/notification");
const helpDesk = require("../models/helpDesk");
const howToPlay = require("../models/howPlay");

exports.registration = async (req, res) => {
        const { mobileNumber, email } = req.body;
        try {
                req.body.email = email.split(" ").join("").toLowerCase();
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { mobileNumber: mobileNumber }] }], userType: "ADMIN" });
                if (!user) {
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "ADMIN";
                        req.body.accountVerification = true;
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ message: "registered successfully ", data: userCreate, });
                } else {
                        return res.status(409).send({ message: "Already Exist", data: [] });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.signin = async (req, res) => {
        try {
                const { email, password } = req.body;
                const user = await User.findOne({ email: email, userType: "ADMIN" });
                if (!user) {
                        return res
                                .status(404)
                                .send({ message: "user not found ! not registered" });
                }
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                        return res.status(401).send({ message: "Wrong password" });
                }
                const accessToken = await jwt.sign({ id: user._id }, 'DMandir', { expiresIn: '365d', });
                let obj = {
                        fullName: user.fullName,
                        firstName: user.fullName,
                        lastName: user.lastName,
                        mobileNumber: user.mobileNumber,
                        email: user.email,
                        userType: user.userType,
                }
                return res.status(201).send({ data: obj, accessToken: accessToken });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.AddContest = async (req, res) => {
        try {
                req.body.contestId = await reffralCode();
                const Data = await contest.create(req.body);
                if (Data) {
                        const findUser = await User.find({ userType: "USER" });
                        if (findUser.length > 0) {
                                for (let i = 0; i < findUser.length; i++) {
                                        const notificationData = await notification.create({ userId: findUser[i]._id, title: "New Contest", body: `New Contest is add contest id ${req.body.contestId}`, type: "CONTEST", status: "ACTIVE", })
                                }
                                return res.status(200).json({ status: 200, message: "Contest is add successfully. ", data: Data })
                        } else {
                                return res.status(200).json({ status: 200, message: "Contest is add successfully. ", data: Data })
                        }
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getIdContest = async (req, res) => {
        try {
                const data = await contest.findById(req.params.id)
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Contest data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getContests = async (req, res) => {
        const categories = await contest.find({})
        if (categories.length > 0) {
                return res.status(201).json({ message: "Contest Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Contest not Found", status: 404, data: {}, });
};
exports.activeBlockContest = async (req, res) => {
        try {
                const data = await contest.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        if (data.status == "ACTIVE") {
                                const update = await contest.findByIdAndUpdate({ _id: data._id }, { $set: { status: "BLOCKED" } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Contest block now.", data: update });
                        } else {
                                const update = await contest.findByIdAndUpdate({ _id: data._id }, { $set: { status: "ACTIVE" } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Contest active now.", data: update });
                        }
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteContest = async (req, res) => {
        try {
                const data = await contest.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await contest.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "Contest delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.userList = async (req, res) => {
        try {
                const findContest = await User.find({ userType: "USER" });
                if (findContest.length == 0) {
                        return res.status(404).json({ status: 404, message: 'User not found.', });
                }
                return res.status(200).json({ status: 200, message: 'User data fetch sucessfully.', data: findContest });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.getUserById = async (req, res) => {
        try {
                const data = await User.findById(req.params.id)
                if (!data || data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "User data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteUser = async (req, res) => {
        try {
                const data = await User.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await User.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "User delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.addBonusTouser = async (req, res) => {
        try {
                const data = await User.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { bonus: data.bonus + req.body.bonus } }, { new: true })
                        return res.status(200).json({ status: 200, message: "Contest block now.", data: update });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.AddHowToPlay = async (req, res) => {
        try {
                const categories = await howToPlay.findOne({})
                if (categories) {
                        let obj = {
                                description: req.body.description || categories.description,
                        }
                        const data1 = await howToPlay.findByIdAndUpdate({ _id: categories._id }, { $set: obj }, { new: true });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "How To Play is add successfully. ", data: data1 })
                        }
                } else {
                        const Data = await howToPlay.create(req.body);
                        if (Data) {
                                return res.status(200).json({ status: 200, message: "How To Play is add successfully. ", data: Data })
                        }
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getHowToPlay = async (req, res) => {
        const categories = await howToPlay.findOne({})
        if (categories) {
                return res.status(201).json({ message: "How To Play Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "How To Play not Found", status: 404, data: {}, });
};
exports.deleteHowToPlay = async (req, res) => {
        try {
                const data = await howToPlay.findOne();
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await howToPlay.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "How To Play delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.AddHelpDesk = async (req, res) => {
        try {
                const categories = await helpDesk.findOne({})
                if (categories) {
                        let obj = {
                                email: req.body.email || categories.email,
                                mobileNumber: req.body.mobileNumber || categories.mobileNumber,
                                whatApp: req.body.whatApp || categories.whatApp
                        }
                        const data1 = await helpDesk.findByIdAndUpdate({ _id: categories._id }, { $set: obj }, { new: true });
                        if (data1) {
                                return res.status(200).json({ status: 200, message: "How To Play is add successfully. ", data: data1 })
                        }
                } else {
                        let obj = {
                                email: req.body.email,
                                mobileNumber: req.body.mobileNumber,
                                whatApp: req.body.whatApp
                        }
                        const Data = await helpDesk.create(obj);
                        if (Data) {
                                return res.status(200).json({ status: 200, message: "How To Play is add successfully. ", data: Data })
                        }
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getHelpDesk = async (req, res) => {
        const categories = await helpDesk.findOne({})
        if (categories) {
                return res.status(201).json({ message: "How To Play Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "How To Play not Found", status: 404, data: {}, });
};
exports.deleteHelpDesk = async (req, res) => {
        try {
                const data = await helpDesk.findOne();
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await helpDesk.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "How To Play delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let OTP = '';
        for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}