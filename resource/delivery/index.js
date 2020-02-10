const express = require('express');

const router = express.Router();
const Delivery = require('../../model').Delivery;
const {saveDocument} = require('../utils');

router.get('/', async (req, res, next) => {
	const query = Delivery.find(req.query);
		 return query.exec()
		 .then(foundDelivery => {
			 if(!foundDelivery)
			 	return next({
					status: 404,
					error: 'delivery_not_found',
					error_descri3ption: 'requested delivery was not found'
			 	});
			return res.status(200).send(foundDelivery);
		 }).catch(next);
});

router.get('/:orderId', async (req, res, next) => {
	const {orderId} = req.params;
	const query = Delivery.findOne({orderId});
	
	return query.exec()
		.then(foundDelivery => {
			if (!foundDelivery)
				return next({
					status: 404,
					error: 'delivery_not_found',
					error_descri3ption: 'requested delivery was not found'
		 });

		 return res.status(200).send(foundDelivery);

		}).catch(next);
});



router.post('/', async (req, res, next) => {
	const { body } = req;

	const delivery = new Delivery(body);

	return saveDocument(delivery)
		.then(savedDelivery => res.status(201).send(savedDelivery))
		.catch(next);
});

router.put('/:orderId', async (req, res, next) => {
	const {orderId} = req.params;
	const query = Delivery.findOne({orderId});
	
	return query.exec()
		.then(foundDelivery => {
			if (!foundDelivery)
				return next({
					status: 404,
					error: 'delivery_not_found',
					error_descri3ption: 'requested delivery was not found'
		 });

			foundDelivery.set(req.body);

			return saveDocument(foundDelivery)
				.then(savedDelivery => res.status(200).send(savedDelivery))
				.catch(next);
		}).catch(next);
});

router.patch('/:orderId/delivered', async (req, res, next) => {
	const {orderId} = req.params;
	const query = Delivery.findOne({orderId});
	
	return query.exec()
		.then(foundDelivery => {
			if (!foundDelivery)
				return next({
					status: 404,
					error: 'delivery_not_found',
					error_descri3ption: 'requested delivery was not found'
		 });

			foundDelivery.set({
				delivered: true,
				deliveredAt: new Date(),
			});

			return saveDocument(foundDelivery)
				.then(savedDelivery => res.status(200).send(savedDelivery))
				.catch(next);
		}).catch(next);
});

module.exports = router;
