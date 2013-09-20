var config = require('./config.js'),
	mongoose = require('mongoose'),
	User = mongoose.model('User')

exports.userList = function(req, res) {
	var now = new Date().getTime()
	
	User.find(function(err, users) {
		for (var i = 0; i < users.length; i++) {
			users[i] = users[i].toObject()
			users[i].expire = new Date(users[i].expire)
			users[i].is_expired = users[i].expire.getTime() <= new Date().getTime()
		};
		res.render('user_list', {title: 'Users', nav: config.nav, cururl: '/user', users: users})
	});	
}

/**
 * Show user detail
 */
exports.userDetail = function(req, res) {
	var id = req.params.id

	if(id) {
		User.findOne({ mes: id }, function(err, doc) {
			var user = doc.toObject(),
				title = 'User Detail: ' + user.name.last + ', ' + user.name.first
			user.expire = new Date(user.expire)
			user.is_expired = user.expire.getTime() <= new Date().getTime()
			res.render('user_detail', { title: title, nav: config.nav, cururl: '/user', user: user })
		});
	} else {
		res.redirect('/user')
	}
}

/**
 * Adds a user
 */
exports.userAdd = function(req, res) {
	var fields = {
		first: ['', false],
		last: ['', false],
		email: ['', false],
		mes: ['', false],
		expiration: ['', false],
		trial: ['', false]
	}

	var form = req.form,
		err = function(field) {
			return form.getErrors(field).length ? 'error' : '';
		}

	if(typeof form != 'undefined') {
		fields = {
			first: [form.first, err('first')],
			last: [form.last, err('last')],
			email: [form.email, err('email')],
			mes: [form.mes, err('mes')],
			expiration: [form.expiration, err('expiration')],
			trial: [form.trial, err('trial')],
		}
	}

	res.render('user_add', {title: 'Add User', nav: config.nav, cururl: '/user', fields: fields})
}

/**
 * Submits a user.
 */
exports.userSubmit = function(req, res) {
	if(!req.form.isValid) {
		exports.userAdd(req, res)
	} else {
		var trial = (req.body.trial == 'yes' ? true : false)

		// Add validated user to DB.
		var user = new User({
			name: {
				first: req.body.first,
				last: req.body.last
			},
			email: req.body.email,
			mes: req.body.mes,
			expire: new Date(req.body.expiration).getTime(),
			trial: trial,
			mc: 1,
			g: 0,
  			r: 0,
  			n: 0,
  			gt: 0,
		})
		user.save()

		// Redirect back to user list.
		res.redirect('/user')
	}
}