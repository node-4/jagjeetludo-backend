const userModel = require("../models/userModel");
const contest = require("../models/contest");
const notification = require("../models/notification");
const refferal = require("../models/refferal");
const transactionModel = require("../models/transaction");
const lobby = require("../models/lobby");
const jwt = require("jsonwebtoken");
exports.socialLogin = async (req, res) => {
        try {
                let userData = await userModel.findOne({ socialId: req.body.socialId, socialType: req.body.socialType });
                if (userData) {
                        let updateResult = await userModel.findByIdAndUpdate({ _id: userData._id }, { $set: { deviceToken: req.body.deviceToken } }, { new: true });
                        if (updateResult) {
                                var token = jwt.sign({ _id: updateResult._id }, 'DMandir', { expiresIn: '365d' });
                                let obj = {
                                        _id: updateResult._id,
                                        firstName: updateResult.firstName,
                                        lastName: updateResult.lastName,
                                        socialId: updateResult.socialId,
                                        userType: updateResult.userType,
                                        token: token
                                }
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: obj, });
                        }
                } else {
                        req.body.firstName = req.body.firstName;
                        req.body.lastName = req.body.lastName;
                        req.body.countryCode = req.body.countryCode;
                        req.body.mobileNumber = req.body.mobileNumber;
                        let email = req.body.email;
                        req.body.email = email.split(" ").join("").toLowerCase();
                        req.body.socialId = req.body.socialId;
                        req.body.socialType = req.body.socialType;
                        req.body.refferalCode = await reffralCode();
                        let saveUser = await userModel(req.body).save();
                        if (saveUser) {
                                var token = jwt.sign({ _id: saveUser._id }, 'DMandir', { expiresIn: '365d' });
                                let obj = {
                                        _id: saveUser._id,
                                        firstName: saveUser.firstName,
                                        lastName: saveUser.lastName,
                                        mobileNumber: saveUser.mobileNumber,
                                        userType: saveUser.userType,
                                        token: token
                                }
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: obj, });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.loginWithPhone = async (req, res) => {
        try {
                if (req.body.mobileNumber != (null || undefined)) {
                        const phone = await userModel.findOne({ mobileNumber: req.body.mobileNumber });
                        if (phone) {
                                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                                let update = await userModel.findByIdAndUpdate({ _id: phone._id }, { $set: { otp: otp } }, { new: true });
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: update, });
                        } else {
                                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                                req.body.otp = otp;
                                req.body.refferalCode = await reffralCode();
                                const newUser = await userModel.create(req.body);
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: newUser, });
                        }
                } else {
                        return res.status(401).send({ status: 401, message: "Please provide mobile number.", data: {}, });
                }
        } catch (error) {
                console.log(error);
                return res.status(500).json({
                        errorName: error.name,
                        message: error.message,
                });
        }
};
exports.verifyOtp = async (req, res) => {
        try {
                const { otp } = req.body;
                const user = await userModel.findById(req.params.id);
                if (!user) {
                        return res.status(404).send({ message: "user not found" });
                }
                if (user.otp !== otp || user.otpExpiration < Date.now()) {
                        return res.status(400).json({ message: "Invalid OTP" });
                }
                const updated = await userModel.findByIdAndUpdate({ _id: user._id }, { accountVerification: true }, { new: true });
                const accessToken = await jwt.sign({ id: user._id }, 'DMandir', { expiresIn: '365d', });
                let obj = {
                        userId: updated._id,
                        otp: updated.otp,
                        phone: updated.phone,
                        token: accessToken,
                }
                return res.status(200).send({ status: 200, message: "logged in successfully", data: obj });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ error: "internal server error" + err.message });
        }
};
exports.joinContest = async (req, res) => {
        try {
                const findContest = await contest.findById({ _id: req.params.contestId });
                const user = await userModel.findById({ _id: req.user._id });
                if (!contest || !user) {
                        return res.status(404).json({ status: 404, message: 'Contest or user not found.' });
                }
                if (user.deposite < findContest.entryFee) {
                        return res.status(400).json({ status: 400, message: 'Insufficient balance.' });
                }
                if (findContest.joined == findContest.noOfuser) {
                        return res.status(401).json({ status: 401, message: 'Contest full now.' });
                }
                if (findContest.users.includes(req.user._id)) {
                        return res.status(400).json({ status: 400, message: 'User is already in the contest.' });
                }
                user.deposite -= findContest.entryFee;
                await user.save();
                let findRefferal = await refferal.findOne({ user: user.refferUserId });
                if (findRefferal) {
                        await refferal.findByIdAndUpdate({ _id: findRefferal._id }, { $set: { amount: findRefferal.amount + findContest.entryFee } }, { new: true });
                }
                const adminUser = await userModel.findOne({ userType: 'ADMIN' });
                adminUser.wallet += findContest.entryFee;
                await adminUser.save();
                findContest.joined += 1;
                findContest.users.push(req.user._id);
                await findContest.save();
                return res.status(200).json({ status: 200, message: 'User joined the contest successfully.' });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.winnerContest = async (req, res) => {
        try {
                const findContest = await contest.findById({ _id: req.body.contestId });
                if (!findContest) {
                        return res.status(404).json({ status: 404, message: 'Contest not found.' });
                }
                const user = await userModel.findById({ _id: req.body.userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'user not found.' });
                }
                user.winning += findContest.firstPrize;
                await user.save();
                findContest.winner = user._id;
                await findContest.save();
                return res.status(200).json({ status: 200, message: 'Winned the contest.' });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.secondPrizeContest = async (req, res) => {
        try {
                const findContest = await contest.findById({ _id: req.body.contestId });
                if (!findContest) {
                        return res.status(404).json({ status: 404, message: 'Contest not found.' });
                }
                const user = await userModel.findById({ _id: req.body.userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'user not found.' });
                }
                user.winning += findContest.secondPrize;
                await user.save();
                findContest.IInd = user._id;
                await findContest.save();
                return res.status(200).json({ status: 200, message: 'Winned the contest.' });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.thirdPrizeContest = async (req, res) => {
        try {
                const findContest = await contest.findById({ _id: req.body.contestId });
                if (!findContest) {
                        return res.status(404).json({ status: 404, message: 'Contest not found.' });
                }
                const user = await userModel.findById({ _id: req.body.userId });
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'user not found.' });
                }
                user.winning += findContest.thirdPrize;
                await user.save();
                findContest.IIInd = user._id;
                await findContest.save();
                return res.status(200).json({ status: 200, message: 'Winned the contest.' });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.winnerContestlist = async (req, res) => {
        try {
                const user = await userModel.findById({ _id: req.user._id });
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'user not found.' });
                }
                const findContest = await contest.find({ winner: user._id });
                if (findContest.length == 0) {
                        return res.status(404).json({ status: 404, message: 'Contest not found.', });
                }
                return res.status(200).json({ status: 200, message: 'Winned the contest.', data: findContest });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.lossContestlist = async (req, res) => {
        try {
                const user = await userModel.findById({ _id: req.user._id });
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'user not found.' });
                }
                const findContest = await contest.find({ $or: [{ IInd: user._id }, { IIIrd: user._id }] });
                if (findContest.length == 0) {
                        return res.status(404).json({ status: 404, message: 'Contest not found.', });
                }
                return res.status(200).json({ status: 200, message: 'Winned the contest.', data: findContest });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.transactionList = async (req, res) => {
        try {
                const user = await userModel.findById({ _id: req.user._id });
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'user not found.' });
                }
                const findContest = await transactionModel.find({ user: user._id });
                if (findContest.length == 0) {
                        return res.status(404).json({ status: 404, message: 'Transaction not found.', });
                }
                return res.status(200).json({ status: 200, message: 'Transaction data found.', data: findContest });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.notificationList = async (req, res) => {
        try {
                const user = await userModel.findById({ _id: req.user._id });
                if (!user) {
                        return res.status(404).json({ status: 404, message: 'user not found.' });
                }
                const findContest = await notification.find({ userId: user._id });
                if (findContest.length == 0) {
                        return res.status(404).json({ status: 404, message: 'Notification not found.', });
                }
                return res.status(200).json({ status: 200, message: 'Notification the contest.', data: findContest });
        } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.addMoney = async (req, res) => {
        try {
                const data = await userModel.findOne({ _id: req.user._id, });
                if (data) {
                        let update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { deposite: data.deposite + parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                let obj = {
                                        user: req.user._id,
                                        date: Date.now(),
                                        amount: req.body.balance,
                                        type: "Credit",
                                        relatedPayments: "AddMoney"
                                };
                                const data1 = await transactionModel.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been added.", data: update, });
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.removeMoney = async (req, res) => {
        try {
                const data = await userModel.findOne({ _id: req.user._id, });
                if (data) {
                        let update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { deposite: data.deposite - parseInt(req.body.balance), withdraw: data.withdraw + parseInt(req.body.balance) } }, { new: true });
                        if (update) {
                                let obj = {
                                        user: req.user._id,
                                        date: Date.now(),
                                        amount: req.body.balance,
                                        type: "Debit",
                                        relatedPayments: "Withdrall Money"
                                };
                                const data1 = await transactionModel.create(obj);
                                if (data1) {
                                        return res.status(200).json({ status: 200, message: "Money has been added.", data: update, });
                                }
                        }
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getWallet = async (req, res) => {
        try {
                const data = await userModel.findOne({ _id: req.user._id, });
                if (data) {
                        let obj = {
                                deposite: data.deposite,
                                winning: data.winner,
                                bonus: data.bonus,
                        }
                        return res.status(200).json({ message: "get Wallet", data: obj });
                } else {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getContests = async (req, res) => {
        const categories = await contest.find({ status: "ACTIVE" })
        if (categories.length > 0) {
                return res.status(201).json({ message: "Contest Found", status: 200, data: categories, });
        }
        return res.status(201).json({ message: "Contest not Found", status: 404, data: {}, });
};
exports.updateMusic = async (req, res) => {
        try {
                const data = await userModel.findOne({ _id: req.user._id, });
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        if (data.music == true) {
                                const update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { music: false } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Music off.", data: update });
                        } else {
                                const update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { music: true } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Music on.", data: update });
                        }
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.updateSound = async (req, res) => {
        try {
                const data = await userModel.findOne({ _id: req.user._id, });
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        if (data.sound == true) {
                                const update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { sound: false } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Sound off.", data: update });
                        } else {
                                const update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { sound: true } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Sound on.", data: update });
                        }
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.updateLanguage = async (req, res) => {
        try {
                const data = await userModel.findOne({ _id: req.user._id, });
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        if (data.language == "Hindi") {
                                const update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { language: "English" } }, { new: true })
                                return res.status(200).json({ status: 200, message: "English language.", data: update });
                        } else {
                                const update = await userModel.findByIdAndUpdate({ _id: data._id }, { $set: { language: 'Hindi' } }, { new: true })
                                return res.status(200).json({ status: 200, message: "Hindi language", data: update });
                        }
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.usedRefferCode = async (req, res) => {
        try {
                console.log(req.user._id)
                let findUser1 = await userModel.findOne({ _id: req.user._id, });
                if (findUser1) {
                        console.log(findUser1)
                        if (!findUser1.refferalCodeUsed) {
                                const findUser = await userModel.findOne({ refferalCode: req.body.refferalCode });
                                if (findUser) {
                                        req.body.refferUserId = findUser._id;
                                        let updateWallet = await userModel.findOneAndUpdate({ _id: findUser._id }, { $push: { joinUser: findUser1._id } }, { new: true });
                                        if (updateWallet) {
                                                let findRefferal = await refferal.findOne({ user: findUser._id });
                                                if (findRefferal) {
                                                        await refferal.findOneAndUpdate({ _id: findRefferal._id }, { $set: { noOfRefferal: findRefferal.noOfRefferal + 1 } }, { new: true });
                                                        let updateWallet1 = await userModel.findOneAndUpdate({ _id: findUser1._id }, { $set: { refferalCodeUsed: true, refferUserId: findUser._id } }, { new: true });
                                                        return res.status(200).send({ status: 200, message: "Refer code used ", data: updateWallet1, });
                                                } else {
                                                        let obj = {
                                                                user: findUser._id,
                                                                noOfRefferal: 1,
                                                        }
                                                        const Data = await refferal.create(obj);
                                                        let updateWallet1 = await userModel.findOneAndUpdate({ _id: findUser1._id }, { $set: { refferalCodeUsed: true, refferUserId: findUser._id } }, { new: true });
                                                        return res.status(200).send({ status: 200, message: "Refer code used ", data: updateWallet1, });
                                                }
                                        }
                                } else {
                                        return res.status(400).send({ msg: "not found" });
                                }
                        } else {
                                return res.status(409).send({ status: 409, message: "Refer code already used", data: {} });
                        }
                } else {
                        return res.status(404).send({ status: 404, message: "Invalid refferal code", data: {} });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.getlobby = async (req, res) => {
        try {
                if (req.query.noOfuser = !(null || undefined)) {
                        const categories = await lobby.find({ noOfuser: req.body.noOfuser, status: "ACTIVE" })
                        if (categories.length > 0) {
                                return res.status(201).json({ message: "Lobby Found", status: 200, data: categories, });
                        }
                        return res.status(201).json({ message: "Lobby not Found", status: 404, data: {}, });
                } else {
                        const categories = await lobby.find({ status: "ACTIVE" })
                        if (categories.length > 0) {
                                return res.status(201).json({ message: "Lobby Found", status: 200, data: categories, });
                        }
                        return res.status(201).json({ message: "Lobby not Found", status: 404, data: {}, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.AddContest = async (req, res) => {
        try {
                req.body.contestId = await reffralCode();
                let users = [];
                users.push(req.user._id)
                req.body.users = users;
                const categories = await lobby.findOne({ _id: req.body.lobbyId })
                if (!categories) {
                        return res.status(201).json({ message: "Lobby Found", status: 200, data: categories, });
                }
                if (req.body.noOfuser == 2) {
                        req.body.firstPrize = categories.firstPrize;
                        req.body.entryFee = categories.entryFee;
                }
                if (req.body.noOfuser == 3) {
                        req.body.firstPrize = categories.firstPrize;
                        req.body.secondPrize = categories.secondPrize;
                        req.body.entryFee = categories.entryFee;
                }
                if (req.body.noOfuser == 4) {
                        req.body.firstPrize = categories.firstPrize;
                        req.body.secondPrize = categories.secondPrize;
                        req.body.thirdPrize = categories.thirdPrize;
                        req.body.entryFee = categories.entryFee;
                }
                const Data = await contest.create(req.body);
                if (Data) {
                        const findUser = await userModel.find({ _id: { $ne: req.user._id }, userType: "USER" });
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
exports.dailyWinnerContestlist = async (req, res) => {
        try {
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const dailyWinners = await contest.find({
                        winner: req.user._id,
                        createdAt: { $gte: currentDate },
                }).populate('winner');
                if (dailyWinners.length === 0) {
                        return res.status(404).json({ status: 404, message: 'Daily contest winners not found.' });
                }
                return res.status(200).json({ status: 200, message: 'Daily contest winners', data: dailyWinners });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.weeklyWinnerContestlist = async (req, res) => {
        try {
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const lastWeekDate = new Date(currentDate);
                lastWeekDate.setDate(currentDate.getDate() - 7);
                const weeklyWinners = await contest.find({
                        winner: req.user._id,
                        createdAt: { $gte: lastWeekDate, $lte: currentDate },
                }).populate('winner');

                if (weeklyWinners.length === 0) {
                        return res.status(404).json({ status: 404, message: 'Weekly contest winners not found.' });
                }

                return res.status(200).json({ status: 200, message: 'Weekly contest winners', data: weeklyWinners });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error.' });
        }
};
exports.monthlyWinnerContestlist = async (req, res) => {
        try {
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                const lastMonthDate = new Date(currentDate);
                lastMonthDate.setMonth(currentDate.getMonth() - 1);
                const monthlyWinners = await contest.find({
                        winner: req.user._id,
                        createdAt: { $gte: lastMonthDate, $lte: currentDate },
                }).populate('winner');

                if (monthlyWinners.length === 0) {
                        return res.status(404).json({ status: 404, message: 'Monthly contest winners not found.' });
                }

                return res.status(200).json({ status: 200, message: 'Monthly contest winners', data: monthlyWinners });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error.' });
        }
};


const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}