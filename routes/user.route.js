const auth = require("../controllers/userControler");
const authJwt = require("../middleware/authJwt");
module.exports = (app) => {
        app.post("/api/v1/user/socialLogin", auth.socialLogin);
        app.post("/api/v1/user/loginWithPhone", auth.loginWithPhone);
        app.post("/api/v1/user/:id", auth.verifyOtp);
        app.get("/api/v1/user/allContest", auth.getContests);
        app.post("/api/v1/user/joinContest/:contestId", [authJwt.verifyToken], auth.joinContest);
        app.post("/api/v1/user/winner/Contest", [authJwt.verifyToken], auth.winnerContest);
        app.post("/api/v1/user/secondPrize/Contest", [authJwt.verifyToken], auth.secondPrizeContest);
        app.post("/api/v1/user/thirdPrize/Contest", [authJwt.verifyToken], auth.thirdPrizeContest);
        app.get("/api/v1/user/winner/Contestlist", [authJwt.verifyToken], auth.winnerContestlist);
        app.get("/api/v1/user/lossContestlist", [authJwt.verifyToken], auth.lossContestlist);
        app.get("/api/v1/user/notificationList", [authJwt.verifyToken], auth.notificationList);
        app.get("/api/v1/user/transactionList", [authJwt.verifyToken], auth.transactionList);
        app.post("/api/v1/user/wallet/addWallet", [authJwt.verifyToken], auth.addMoney);
        app.get("/api/v1/user/wallet/getwallet", [authJwt.verifyToken], auth.getWallet);
        app.put("/api/v1/user/updateMusic", [authJwt.verifyToken], auth.updateMusic);
        app.put("/api/v1/user/updateSound", [authJwt.verifyToken], auth.updateSound);
        app.put("/api/v1/user/updateLanguage", [authJwt.verifyToken], auth.updateLanguage);
        app.post("/api/v1/user/used/RefferCode", [authJwt.verifyToken], auth.usedRefferCode);
}