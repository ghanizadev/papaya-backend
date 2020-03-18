const express = require('express');

const router = express.Router();
const utils = require('../authentication/utils');

const {saveDocument, friendlyId, checkAuthorities} = require('../utils');
const {User} = require('../../model');

router.get('/', async (req, res, next) => {
	if(!checkAuthorities(req.user.authorities, ['READ']))
		return res.status(403).send({status: 403, error: 'forbidden', error_description: 'you are not permitted to check this content'});

	const query = User.find(req.query);

	return query.exec()
		.then(foundUsers => {
			const result = foundUsers.map((item) => {
				let filtered = new Object();

				const keys = Object.keys(item.toObject());

				keys.forEach(key => {
					if(key !== 'password') filtered[key] = item[key];
				});

				return filtered;

			});
			res.status(200).send(result);
		}).catch(next);
});


router.post('/', async (req, res, next) => {
	const {body} = req;

	const user = new User(body);

	return user.validate()
		.then(() => {

			const update = {
				password: utils.encryptPassword(body.password),
				authorities: ['READ'],
				code: friendlyId(4),
			};

			user.set(update);

			saveDocument(user).then( result =>{
				let filtered = new Object();

				const keys = Object.keys(result.toObject());

				keys.forEach(key => {
					if(key !== 'password') filtered[key] = result[key];
				});

				return res.status(201).send(filtered);

			}).catch(error => next(error));

	
		}).catch (error => {
			const response = {
				status: 400,
				error: 'failed_to_validate',
				error_description: error.message || 'check your request body and try again'
			};
			next(response);
		});

});



router.patch('/:email', async (req, res, next) => {
	const {email} = req.params;
	const query = User.findOne({email});

	return query.exec()
		.then(foundUser => {
			if (!foundUser) return next({status: 404, error: 'not_found', error_description: 'requested user was not found in our database'});

			foundUser.set(req.body);

			return saveDocument(foundUser)
				.then(savedUser => res.status(201).send(savedUser))
				.catch(next);
		})
		.catch(next);
});

module.exports = router;
