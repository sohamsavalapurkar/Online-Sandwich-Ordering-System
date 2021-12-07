var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');

var monk = require('monk');
var db = monk('localhost:27017/sandwiches');
var collection = db.get('sandwiches');
var accountDetails = db.get('accountDetails');
var cart = db.get('cart');
var orderedItems = db.get('orderedItems');

var multer = require('multer');

var Storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, "./public/images");
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw error;
			console.log(userDetails[0].name);
			res.render('main', {user: req.user, userDetails: userDetails[0]});
		})
	}
	else {
		res.render('main', {user: req.user});
	}
	
	
});

router.get('/index2', function(req, res) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw error;
			console.log(userDetails[0].name);
			collection.find({}, function(err, sandwiches) {
				if (err) throw err;
				res.render('index1', {results: sandwiches, user: req.user, userDetails: userDetails[0]});
			})
		})
	}
	else {
		collection.find({}, function(err, sandwiches) {
			if (err) throw err;
			res.render('index1', {results: sandwiches, user: req.user});
		})
	}
	
});

router.get('/sandwiches', function(req, res) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw error;
			console.log(userDetails[0].name);
			collection.find({}, function(err, sandwiches) {
				if (err) throw err;
				res.render('index', {results: sandwiches, user: req.user, userDetails: userDetails[0]});
			})
		})
	}
	else {
		collection.find({}, function(err, sandwiches) {
			if (err) throw err;
			res.render('index', {results: sandwiches, user: req.user});
		})
	}
	
});

router.get('/sandwiches/new', function(req, res, next) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw err;
			console.log(userDetails[0].name);
			res.render('new', {user: req.user, userDetails: userDetails[0]});
		})
	}
	else {
		res.render('new', {user: req.user});
	}
});

var upload = multer({
	storage: Storage
}).single("image");

router.post('/sandwiches/new', function(req, res) {
	upload(req, res, function(err) {
		if (err) throw err;
		
	console.log(req.file)
	collection.insert({
		name : req.body.name,
		description : req.body.description,
		price : req.body.price,
		image : req.file.path.split('/')[2],
		ingredients : req.body.ingredients.split(','),
		isDeleted : false
	}, function(err, account) {

			res.redirect('/sandwiches');
	})
});
});

router.get('/sandwiches/edit/:id', function(req, res, next) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw err;
			collection.findOne({_id : req.params.id}, function(err, sandwich) {
				if (err) throw err;
				
			console.log(userDetails[0].name);
			res.render('edit', {user: req.user, userDetails: userDetails[0], sandwich:sandwich});
		});
		})
	}
	else {
		res.render('edit', {user: req.user});
	}
});

router.put('/sandwiches/:id', function(req, res) {
	upload(req, res, function(err) {
		if (err) throw err;
		
	//console.log(req.file)
	if(req.file != undefined) {
		collection.update({_id : req.params.id},
			{ $set: {
				name : req.body.name,
				description : req.body.description,
				price : req.body.price,
				image : req.file.path.split('/')[2],
				ingredients : req.body.ingredients.split(','),
				isDeleted : false
			}}, function(err, video) {
				if (err) throw err;
				//if update is successful it will return update video object
				res.redirect('/sandwiches');
			  });
	}
	else {
		collection.update({_id : req.params.id},
			{ $set: {
				name : req.body.name,
				description : req.body.description,
				price : req.body.price,
				ingredients : req.body.ingredients.split(','),
				isDeleted : false
			}}, function(err, video) {
				if (err) throw err;
				//if update is successful it will return update video object
				res.redirect('/sandwiches');
			  });
	}
	
});
});

router.get('/sandwiches/:id', function(req, res) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw error;
			console.log(userDetails[0].name);
			collection.findOne({_id : req.params.id}, function(err, sandwich) {
				if (err) throw err;
					res.render('item', {sandwich: sandwich, user:req.user, userDetails: userDetails[0]});  
				});
		})
	}
	else {
		collection.findOne({_id : req.params.id}, function(err, sandwich) {
			if (err) throw err;
				res.render('item', {sandwich: sandwich, user:req.user});  
			});
	}
	
});
router.delete('/sandwiches/:id', function(req, res) {
	console.log("hello")
	collection.update({_id : req.params.id},
	{ $set: {
		isDeleted: true
	}}, function(err, sandwich) {
		if (err) throw err;
		//if update is successful it will return update video object
    	res.redirect('/sandwiches');
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
  
  router.get('/franchise', function(req, res, next) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw error;
			console.log(userDetails[0].name);
			res.render('franchise', {user: req.user, userDetails: userDetails[0]});
		})
	}
	else {
		res.render('franchise', {user: req.user});
	}
	
	
});

router.get('/cart', function(req, res, next) {
	if(req.user) {
		console.log(req.user.username);
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw error;
			console.log(userDetails[0].name);
			cart.find({username: req.user.username}, function(err, cartItems) {
				collection.find({}, function(err, sandwiches) {
					if (err) throw err;
				res.render('cart', {user: req.user, userDetails: userDetails[0], cartItems: cartItems, sandwiches:sandwiches});
				})
				
			})
			
		})
	}
	else {
		res.render('cart', {user: req.user});
	}
	
	
});
router.delete('/cart/:id', function(req, res) {
	
	cart.remove({_id : req.params.id}, function(err, video) {
		if (err) throw err;
			res.redirect('/cart');  
		});
	
});

router.post('/checkout/:total_cost', function(req, res) {
	cart.find({username: req.user.username}, function(err, cartItems) {
		orderedItems.find({username: req.user.username}, function(err, items) {
			
		var order_number = items.length + 1;
		for(var i=0; i< cartItems.length; i++) {
			var quantity = cartItems[i].quantity
			collection.findOne({_id: cartItems[i].item_id}, function(err, sandwich) {
				if (err) throw err;
			
			
			orderedItems.insert({
				order_number: order_number,
				username: req.user.username,
				item: sandwich.name,
				quantity: quantity,
				total_cost: req.params.total_cost
			})
		})
		}
			if (err) throw err;
		
		})
	})
	cart.remove({username : req.user.username}, function(err, video) {
		if (err) throw err;
			res.redirect('/');  
		});
	

	})

router.post('/sandwiches/addToCart/:id', function(req, res) {
	
	cart.insert({
		username: req.user.username,
		item_id: req.params.id,
		quantity: req.body.quantity
	}, function(err, account) {
			res.redirect('/sandwiches');
	})
});

router.get('/orderHistory', function(req, res, next) {
	if(req.user) {
		
		accountDetails.find({username: req.user.username}, function(err, userDetails) {
			if (err) throw error;
			console.log(userDetails[0].name);
			orderedItems.find({username: req.user.username}, {$sort: {order_number: 1}}, function(err, orderItems) {
					console.log(orderItems)
					if (err) throw err;
				res.render('orderHistory', {user: req.user, userDetails: userDetails[0], orderItems: orderItems});
				
				
			})
			
		})
	}
	else {
		res.render('cart', {user: req.user});
	}
	
	
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
