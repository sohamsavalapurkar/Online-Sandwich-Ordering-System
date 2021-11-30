var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/sandwiches');
var collection = db.get('sandwiches');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('main');
});

router.get('/sandwiches', function(req, res) {
	collection.find({}, function(err, sandwiches) {
		if (err) throw err;
		res.render('index', {results: sandwiches});
	})
});

router.get('/sandwiches/:id', function(req, res) {
	collection.findOne({_id : req.params.id}, function(err, sandwich) {
		if (err) throw err;
			res.render('item', {sandwich: sandwich});  
		});
});

router.get('/signup', function(req, res) {
	res.render('signup');
});

module.exports = router;
