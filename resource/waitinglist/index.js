const express = require('express');

const router = express.Router();
const {WaitingList} = require('../../model');

const {saveDocument, friendlyId} = require('../utils');

router.get('/', async (req, res, next) => {
	const query = WaitingList.find(req.query);
	return query.exec()
		.then(foundLine => res.status(200).send(foundLine))
		.catch(next);
});

router.post('/', async (req, res, next) => {
	const customerId = friendlyId(4);
	const user = new WaitingList({...req.body, customerId});

	return saveDocument(user)
		.then(result => res.status(201).send(result))
		.catch(next);
});

router.delete('/:customerId', async (req, res, next) => {
	const {customerId} = req.params;
	const query = WaitingList.findOneAndDelete({customerId});
		
	return query.exec()
		.then(deletedDocument => {
			if(!deletedDocument)
				return next({status: 404, error: 'not_found', error_description: 'requested customer was not found in waiting list'});
			return res.status(200).send(deletedDocument);
		})
		.catch(next);
});

module.exports = router;