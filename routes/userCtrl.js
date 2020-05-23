var bcrypt = require("bcrypt")
var jwtUtils = require("../utils/jwt.utils");
var models = require("../models");
var asyncLib = require("async");

module.exports = {
    register: function (req, res) {

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var bio = req.body.bio;

        if (email == null || username == null || password == null) {
            return res.status(400).json({
                'error': 'missing params'
            });
        }



        models.User.findOne({
            attributes: ['email'],
            where: {
                email: email
            }
        }).then(function (userFound) {
            if (!userFound) {

                bcrypt.hash(password, 5, function (err, bcyptedPassword) {
                    var newUser = models.User.create({
                        email: email,
                        username: username,
                        password: bcyptedPassword,
                        bio: bio,
                        isAdmin: 0
                    }).then(function (newUser) {
                        return res.status(201).json({
                            'useriD': newUser.id
                        });
                    }).catch(function (err) {
                        return res.status(500).json({
                            'error': 'cannot add user'
                        });
                    });
                });

            } else {
                return res.status(409).json({
                    'error': 'user already exsist'
                })
            }
        }).catch(function (err) {
            return res.status(500).json({
                'error': 'unabmle to verify iuser'
            });
        });




    },
    login: function (req, res) {

        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({
                'error': 'missing params'
            });
        }

        models.User.findOne({
            where: {
                email: email
            }
        }).then(function (userFound) {

            if (userFound) {

                bcrypt.compare(password, userFound.password, function (errBcrypt, resBycrpt) {
                    if (resBycrpt) {
                        return res.status(200).json({
                            'statut': 'succes',
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });
                    } else {
                        return res.status(403).json({
                            'error': 'invalid password'
                        });
                    }
                })

            } else {
                return res.status(404).json({
                    'error': 'user not found'
                });
            }

        }).catch(function (err) {
            return res.status(500).json({
                'error': 'user not found'
            });
        });

    },
    getUserProfile: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        if(userId < 0){
            return res.status(400).json({
                'error': 'wrong token'
            });
        }

        models.User.findOne({
            attributes: ['id', 'email', 'username', 'bio'],
            where : {id: userId}
        }).then(function(user){
            if(user){
                return res.status(201).json(user);
            }else {
                return res.status(400).json({
                    'error': 'user not fond'
                });
            }
        }).catch(function(err){
            return res.status(404).json({
                'error': 'cannot get user'
            });
        });

    }

}