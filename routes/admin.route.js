const auth = require("../controllers/adminController");
const authJwt = require("../middleware/authJwt");
const { upload, FranchiseUpload, productUpload } = require('../middleware/imageupload')
module.exports = (app) => {
        app.post("/api/v1/admin/registration", auth.registration);
        app.post("/api/v1/admin/signin", auth.signin);
        app.post("/api/v1/admin/AddContest", authJwt.verifyToken, auth.AddContest);
        app.get("/api/v1/admin/allContest", auth.getContests);
        app.put("/api/v1/admin/Contest/:id", authJwt.verifyToken, auth.activeBlockContest);
        app.get("/api/v1/admin/Contest/:id", auth.getIdContest);
        app.delete("/api/v1/admin/Contest/:id", [authJwt.verifyToken], auth.deleteContest);
        app.get("/api/v1/admin/userList", auth.userList);
        app.get("/api/v1/admin/User/:id", auth.getUserById);
        app.delete("/api/v1/admin/User/:id", [authJwt.verifyToken], auth.deleteUser);
        app.post("/api/v1/admin/addBonus/:id", [authJwt.verifyToken], auth.addBonusTouser);
        app.post("/api/v1/admin/AddHowToPlay", authJwt.verifyToken, auth.AddHowToPlay);
        app.get("/api/v1/admin/getHowToPlay", auth.getHowToPlay);
        app.delete("/api/v1/admin/HowToPlay", [authJwt.verifyToken], auth.deleteHowToPlay);
        app.post("/api/v1/admin/AddHelpDesk", authJwt.verifyToken, auth.AddHelpDesk);
        app.get("/api/v1/admin/getHelpDesk", auth.getHelpDesk);
        app.delete("/api/v1/admin/HelpDesk", [authJwt.verifyToken], auth.deleteHelpDesk);
        app.post("/api/v1/admin/AddLobby", authJwt.verifyToken, auth.AddLobby);
        app.get("/api/v1/admin/allLobby", auth.getLobbys);
        app.put("/api/v1/admin/Lobby/:id", authJwt.verifyToken, auth.activeBlockLobby);
        app.delete("/api/v1/admin/Lobby/:id", [authJwt.verifyToken], auth.deleteLobby);
        app.post("/api/v1/static/faq/createFaq", authJwt.verifyToken, auth.createFaq);
        app.put("/api/v1/static/faq/:id", authJwt.verifyToken, auth.updateFaq);
        app.delete("/api/v1/static/faq/:id", authJwt.verifyToken, auth.deleteFaq);
        app.get("/api/v1/static/faq/All", auth.getAllFaqs);
        app.get("/api/v1/static/faq/:id", auth.getFaqById);
        app.post("/api/v1/admin/Store/addStore", [authJwt.verifyToken], upload.single('image'), auth.addStore);
        app.get("/api/v1/admin/listStore", auth.listStore);
        app.get("/api/v1/admin/viewStore/:id", auth.viewStore);
        app.put("/api/v1/admin/Store/editStore/:id", [authJwt.verifyToken], upload.single('image'), auth.editStore);
        app.delete("/api/v1/admin/deleteStore/:id", [authJwt.verifyToken], auth.deleteStore);
        app.post("/api/v1/Ads/addAds", [authJwt.verifyToken], upload.single('video'), auth.addAds);
        app.get("/api/v1/getAds", auth.getAds);
        app.get("/api/v1/getAdsforUser", [authJwt.verifyToken], auth.getAdsforUser);
        app.get("/api/v1/viewAds/:id", auth.getAdsById);
        app.delete("/api/v1/DeleteAds/:id", [authJwt.verifyToken], auth.DeleteAds);
        app.get("/api/v1/admin/winner/dailyWinnerContestlist", auth.dailyWinnerContestlist);
        app.get("/api/v1/admin/weeklyWinnerContestlist", auth.weeklyWinnerContestlist);
        app.get("/api/v1/admin/monthlyWinnerContestlist", auth.monthlyWinnerContestlist);

}