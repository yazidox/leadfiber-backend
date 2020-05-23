var express = require("express");
var userCtrl = require("./routes/userCtrl");

exports.router = (function (){
    var apiRouter = express.Router();

    apiRouter.route('/users/register/').post(userCtrl.register);
    apiRouter.route('/users/login/').post(userCtrl.login);
    apiRouter.route('/users/me/').get(userCtrl.getUserProfile);

    return apiRouter;
    
})();



