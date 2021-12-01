var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');

var monk = require('monk');
var db = monk('localhost:27017/sandwiches');
var collection = db.get('sandwiches');
var accountDetails = db.get('accountDetails');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('main', {user: req.user});
});

router.get('/sandwiches', function(req, res) {
	collection.find({}, function(err, sandwiches) {
		if (err) throw err;
		res.render('index', {results: sandwiches, user: req.user});
	})
});

router.get('/sandwiches/:id', function(req, res) {
	collection.findOne({_id : req.params.id}, function(err, sandwich) {
		if (err) throw err;
			res.render('item', {sandwich: sandwich});  
		});
});

router.get('/signup', function(req, res) {
	res.render('signup', {});
});

/*router.get('/', function (req, res) {
    res.render('index1', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', {});
});*/

router.post('/signup', function(req, res) {
	Account.register(new Account({ username : req.body.email }), req.body.password, function(err, account) {
		if (err) {
			return res.render('signup', { account : account });
		}
		accountDetails.insert({
			username: req.body.email,
			name: req.body.name,
			phone: req.body.phone
		}, function(err, account) {
				res.redirect('/');
		})
	});
  });  
  

router.get('/login', function(req, res) {
    res.render('login');
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;
