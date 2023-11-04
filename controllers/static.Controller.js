const staticContent = require('../models/static');
exports.createAboutUs = async (req, res) => {
        try {
                const data = await staticContent.findOne({ type: "ABOUTUS" });
                if (data) {
                        let aboutUs = req.body.aboutUs || data.aboutUs;
                        const result = await staticContent.findByIdAndUpdate({ _id: data._id }, { $set: { aboutUs: aboutUs, type: data.type, } }, { new: true });
                        return res.status(200).json({ status: 200, message: "update successfully.", data: result });
                } else {
                        const newAboutUs = {
                                aboutUs: req.body.aboutUs,
                                type: "ABOUTUS"
                        }
                        const result = await staticContent.create(newAboutUs)
                        return res.status(200).json({ status: 200, message: "Data create successfully.", data: result });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAboutUs = async (req, res) => {
        try {
                const result = await staticContent.find({ type: "ABOUTUS" });
                if (!result || result.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: result });

        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getAboutUsById = async (req, res) => {
        try {
                const data = await staticContent.findById(req.params.id);
                if (!data || data.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteAboutUs = async (req, res) => {
        try {
                const result = await staticContent.findByIdAndDelete({ _id: req.params.id });
                return res.status(200).json({ message: "ok" })
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.createTerms = async (req, res) => {
        try {
                const data = await staticContent.findOne({ type: "TERMS" });
                if (data) {
                        let terms = req.body.terms || data.terms;
                        const data1 = await staticContent.findOneAndUpdate({ id: data._id }, { terms: terms, type: "TERMS" }, { new: true, });
                        return res.status(200).json({ status: 200, message: "update successfully.", data: data1 });
                } else {
                        if (!req.body.terms) {
                                return res.status(400).send("please specify terms");
                        }
                        const result = await staticContent.create({ terms: req.body.terms, type: "TERMS" });
                        return res.status(200).json({ status: 200, message: "Data create successfully.", data: result });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getTerms = async (req, res) => {
        try {
                const data = await staticContent.find({ type: "TERMS" });
                if (!data || data.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getTermsbyId = async (req, res) => {
        try {
                const data = await staticContent.findById(req.params.id);
                if (!data || data.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deleteTerms = async (req, res) => {
        try {
                const data = await staticContent.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Deleted Successfully", });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message });
        }
};
exports.createPrivacy = async (req, res) => {
        try {
                const data = await staticContent.findOne({ type: "PRIVACY" });
                if (!data) {
                        if (!req.body.privacy) {
                                return res.status(400).send("please specify privacy");
                        }
                        const result = await staticContent.create({ privacy: req.body.privacy, type: "PRIVACY" });
                        return res.status(200).json({ status: 200, message: "Data create successfully.", data: result });
                } else {
                        let privacy = req.body.privacy || data.privacy;
                        const data1 = await staticContent.findByIdAndUpdate({ _id: data._id }, { privacy: privacy, type: data.type }, { new: true, });
                        return res.status(200).json({ status: 200, message: "update successfully.", data: data1 });
                }
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getPrivacy = async (req, res) => {
        try {
                const data = await staticContent.find({ type: "PRIVACY" });
                if (!data || data.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.getPrivacybyId = async (req, res) => {
        try {
                const data = await staticContent.findById(req.params.id);
                if (!data || data.length === 0) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Data found successfully.", data: data });
        } catch (error) {
                console.log(error);
                return res.status(501).send({ status: 501, message: "server error.", data: {}, });
        }
};
exports.deletePrivacy = async (req, res) => {
        try {
                const data = await staticContent.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(404).json({ status: 404, message: "No data found", data: {} });
                }
                return res.status(200).json({ status: 200, message: "Deleted Successfully", });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message });
        }
}