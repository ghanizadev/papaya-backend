const mongoose = require('mongoose');

var EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		validate: {
			validator: value => value.toString().length >= 4,
			message: 'invalid name'
		},
		trim: true,
		uppercase: true
	},
	code: { type: String, unique: true },
	email: {
		type: String,
		required: true,
		unique: true,
		validate: {
			validator: value => EMAIL_REGEX.test(value),
			message: 'invalid email'
		}
	},
	password: {
		type: String,
		required: true,
		validate: {
			validator: value => value.toString().length >= 4,
			message: 'invalid password'
		},
		trim: true
	},
	authorities: {
		type: Array,
		required: true,
		default: ['READ'],
		validate: {
			validator: array => array.every((v) => typeof v === 'string'),
			message: 'authority must be an array of strings'
		}
	},
}, { collection: 'users', timestamps: true });

const User = mongoose.model('User', UserSchema);


module.exports = User;
