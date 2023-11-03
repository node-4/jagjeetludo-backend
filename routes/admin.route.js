const auth = require("../controllers/adminController");
const authJwt = require("../middleware/authJwt");
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
}