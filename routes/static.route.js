const staticContent = require('../controllers/static.Controller');
const authJwt = require("../middleware/authJwt");
const express = require("express");
const router = express();
module.exports = (app) => {
        app.post('/api/v1/static/createAboutus', [authJwt.verifyToken], staticContent.createAboutUs);
        app.delete('/api/v1/static/aboutUs/:id', [authJwt.verifyToken], staticContent.deleteAboutUs);
        app.get('/api/v1/static/getAboutUs', staticContent.getAboutUs);
        app.get('/api/v1/static/aboutUs/:id', staticContent.getAboutUsById);
        app.post('/api/v1/static/createPrivacy', [authJwt.verifyToken], staticContent.createPrivacy);
        app.delete('/api/v1/static/privacy/:id', [authJwt.verifyToken], staticContent.deletePrivacy);
        app.get('/api/v1/static/getPrivacy', staticContent.getPrivacy);
        app.get('/api/v1/static/privacy/:id', staticContent.getPrivacybyId);
        app.post('/api/v1/static/createTerms', [authJwt.verifyToken], staticContent.createTerms);
        app.delete('/api/v1/static/terms/:id', [authJwt.verifyToken], staticContent.deleteTerms);
        app.get('/api/v1/static/getTerms', staticContent.getTerms);
        app.get('/api/v1/static/terms/:id', staticContent.getTermsbyId);
};