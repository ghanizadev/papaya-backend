const express = require('express');

const router = express.Router();
const crypto = require('crypto');
const {saveDocument} = require('../utils');

const { Customer } = require('../../model');

router.get('/', (req, res, next) => {

	const query = Customer.find(req.query);

	return query.exec().then(findAnswer => {
		return res.status(200).send(findAnswer);
	}).catch(next);

});

router.post('/', (req, res, next) => {
	const { body } = req;

	body.customerId = crypto.randomBytes(6).toString('hex');
	body.createdAt = new Date();

	const customer = new Customer(body);

	saveDocument(customer)
		.then(answer => {
			res.status(201).send(answer);
		})
		.catch(error => next(error));
});

router.patch('/:email', (req, res, next) => {
	const {body} = req;
	const {email} = req.params;

	if (body.cpf || body.email || body.customerId){
		return next({status: 400, error: 'forbidden_alteration', error_description: 'cannot alter user\'s email or cpf'});
	}
	const query = Customer.findOne({email});
	return query.exec().then(findAnswer => {
		if (!findAnswer)
			return res.status(404).send({
				error: 'customer_not_found',
				error_description:
							'customer not found, moved, or invalid, please, check your data'
			});
		findAnswer.set(req.body);
		saveDocument(findAnswer)
			.then(answer => {
				res.status(201).send(answer);
			})
			.catch(next);
	});
});

module.exports = router;
