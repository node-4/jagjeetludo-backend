const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const contest = require("../models/contest");
const notification = require("../models/notification");
const helpDesk = require("../models/helpDesk");
const howToPlay = require("../models/howPlay");
const lobby = require("../models/lobby");
const Faq = require('../models/faq')
const storeModel = require("../models/store");
const ads = require("../models/ads");
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
                        const update = await User.findByIdAndUpdate({ _id: data._id }, { $set: { bonus: data.bonus + Number(req.body.bonus) } }, { new: true })
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
exports.AddLobby = async (req, res) => {
        try {
                const findData = await lobby.findOne({ entryFee: req.body.entryFee, noOfuser: req.body.noOfuser });
                if (findData) {
                        return res.status(409).json({ status: 409, message: "Lobby is already add. ", data: Data })
                } else {
                        const Data = await lobby.create(req.body);
                        if (Data) {
                                return res.status(200).json({ status: 200, message: "Lobby is add successfully. ", data: Data })
                        }
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getLobbys = async (req, res) => {
        const categories = await lobby.find({})
        if (categories.length > 0) {
                return res.status(201).json({ message: "Lobby Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Lobby not Found", status: 404, data: {}, });
};
exports.activeBlockLobby = async (req, res) => {
        try {
                const data = await lobby.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        if (data.status == "ACTIVE") {
                                const update = await lobby.findByIdAndUpdate({ _id: data._id }, { $set: { status: "BLOCKED" } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Lobby block now.", data: update });
                        } else {
                                const update = await lobby.findByIdAndUpdate({ _id: data._id }, { $set: { status: "ACTIVE" } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Lobby active now.", data: update });
                        }
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteLobby = async (req, res) => {
        try {
                const data = await lobby.findById(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await lobby.findByIdAndDelete(data._id);
                        return res.status(200).json({ status: 200, message: "Lobby delete successfully.", data: {} });
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.createFaq = async (req, res) => {
        const { question, answer } = req.body;
        try {
                if (!question || !answer) {
                        return res.status(400).json({ message: "questions and answers cannot be blank " });
                }
                const faq = await Faq.create(req.body);
                return res.status(200).json({ status: 200, message: "FAQ Added Successfully ", data: faq });
        } catch (err) {
                console.log(err);
                return res.status(500).json({ message: "Error ", status: 500, data: err.message });
        }
};
exports.getFaqById = async (req, res) => {
        const { id } = req.params;
        try {
                const faq = await Faq.findById(id);
                if (!faq) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "faqs retrieved successfully ", data: faq });
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.updateFaq = async (req, res) => {
        const { id } = req.params;
        try {
                const faq = await Faq.findByIdAndUpdate(id, req.body, { new: true });
                if (!faq) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "update successfully.", data: faq });
        } catch (err) {
                console.log(err);
                return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
        }
};
exports.deleteFaq = async (req, res) => {
        const { id } = req.params;
        try {
                const faq = await Faq.findByIdAndDelete(id);
                if (!faq) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "FAQ Deleted Successfully ", data: faq });
        } catch (err) {
                console.log(err);
                return res.status(500).json({ message: "Something went wrong ", status: 500, data: err.message });
        }
};
exports.getAllFaqs = async (req, res) => {
        try {
                const faqs = await Faq.find({}).lean();
                if (faqs.length == 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "faqs retrieved successfully ", data: faqs });
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.addStore = async (req, res) => {
        try {
                let findStore = await storeModel.findOne({ storeName: req.body.storeName });
                if (findStore) {
                        return res.status(409).send({ status: 409, message: "Already exit." });
                } else {
                        if (req.file) {
                                req.body.storeImage = req.file.path
                        } else {
                                return res.status(404).json({ message: "First Chosse an image.", status: 404, data: {} });
                        }
                        let saveStore = await storeModel(req.body).save();
                        if (saveStore) {
                                return res.json({ status: 200, message: 'Store add successfully.', data: saveStore });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.viewStore = async (req, res) => {
        try {
                let findStore = await storeModel.findOne({ _id: req.params.id })
                if (!findStore) {
                        return res.status(404).send({ status: 404, message: "Data not found" });
                } else {
                        return res.json({ status: 200, message: 'Store found successfully.', data: findStore });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.editStore = async (req, res) => {
        try {
                let findStore = await storeModel.findOne({ _id: req.params.id });
                if (!findStore) {
                        return res.status(404).send({ status: 404, message: "Data not found" });
                } else {
                        if (req.file) {
                                req.body.storeImage = req.file.filename
                        }
                        let saveStore = await storeModel.findByIdAndUpdate({ _id: findStore._id }, { $set: req.body }, { new: true })
                        if (saveStore) {
                                return res.json({ status: 200, message: 'Store update successfully.', data: saveStore });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.deleteStore = async (req, res) => {
        try {
                let vendorData = await User.findOne({ _id: req.user._id });
                if (!vendorData) {
                        return res.status(404).send({ status: 404, message: "User not found" });
                } else {
                        let findStore = await storeModel.findOne({ _id: req.params.id });
                        if (!findStore) {
                                return res.status(404).send({ status: 404, message: "Data not found" });
                        } else {
                                let update = await storeModel.findByIdAndDelete({ _id: findStore._id });
                                if (update) {
                                        return res.json({ status: 200, message: 'Store Delete successfully.', data: findStore });
                                }
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.listStore = async (req, res) => {
        try {
                let findStore = await storeModel.find({});
                if (findStore.length == 0) {
                        return res.status(404).send({ status: 404, message: "Data not found" });
                } else {
                        return res.json({ status: 200, message: 'Store Data found successfully.', data: findStore });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.addAds = async (req, res) => {
        try {
                if (req.file) {
                        req.body.video = req.file.path;
                }
                const data = {
                        title: req.body.title,
                        description: req.body.description,
                        coins: req.body.coins,
                        video: req.body.video
                }
                const Data = await ads.create(data);
                return res.status(200).json({ status: 200, message: "Ads is Added ", data: Data })
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAds = async (req, res) => {
        try {
                const Ads = await ads.find();
                if (Ads.length == 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        return res.status(200).json({ status: 200, message: "All Ads Data found successfully.", data: Ads })
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAdsById = async (req, res) => {
        try {
                const Ads = await ads.findById({ _id: req.params.id });
                if (!Ads) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: Ads })
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.DeleteAds = async (req, res) => {
        try {
                const Ads = await ads.findById({ _id: req.params.id });
                if (!Ads) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                await ads.findByIdAndDelete({ _id: req.params.id });
                return res.status(200).json({ status: 200, message: "Ads delete successfully.", data: {} })
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAdsforUser = async (req, res) => {
        try {
                const Ads = await ads.find({ users: { $ne: [req.user._id] } });
                if (Ads.length == 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                } else {
                        return res.status(200).json({ status: 200, message: "All Ads Data found successfully.", data: Ads })
                }
        } catch (err) {
                console.log(err);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
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