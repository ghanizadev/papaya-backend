const express = require('express');

const router = express.Router();
const {connect, saveDocument} = require('../utils');

const mongoose = require('mongoose');
const {Provider} = require('../../model');

//TODO: fix route
router.get('/', (req, res) => 
	connect(res, () => {
		Provider.find(req.query, (findError, findAnswer) => {
			if (findError)
				return res.status(400).send({
					error: 'provider_not_found',
					error_description:
					'provider not found, moved, or invalid, please check your data'
				});
			return res.status(200).send(findAnswer);
		});
	}));

//TODO: fix route
router.post('/', (req, res) =>
	connect(res, () => { 
		const { body } = req;

		Provider.estimatedDocumentCount( (countError, count) => {
			body.providerId = ((count + 1) / 10000).toString().replace('.', '');
			const provider = new Provider(body);

			return saveDocument(provider)
				.then(
					result => {
						
						res.status(201).send(result);
					}
				)
				.catch(error => {
					
					error.error ? 
						res.status(400).send(error)
						:
						res.status(500).send({
							error: 'failed_to_save',
							error_description: 'a attempt to persist failed'
						});
				});
		}
		);
	
	}));

//TODO: fix route
router.patch('/:id', (req, res) => {
	mongoose.connect(process.env.MONGO_HOST, connectionError => {
		if (connectionError)
			return res.status(500).send({
				error: 'failed_to_connect',
				error_description: 'a attempt to connect failed'
			});
		try {

			return Provider.findById(req.query.id, (findError, findAnswer) => {
				if (findError)
					return res.status(400).send({
						error: 'provider_not_found',
						error_description:
							'provider not found, moved, or invalid, please check your data'
					});
				findAnswer.set(req.body);

				findAnswer.save((saveError, savedDocument) => {
					if (saveError) {
						
						return res.status(500).send({
							error: 'failed_to_save',
							error_description: 'a attempt to persist failed'
						});
					}
					
					return res.status(201).send(savedDocument);
				});
			});
		} catch (error) {
			
			return res.status(500).send({
				error: 'internal_error',
				error_description: 'something went wrong'
			});
		}
	});
});

//TODO: fix route
router.delete('/:id', (req, res) => {
	mongoose.connect(process.env.MONGO_HOST, connectionError => {
		if (connectionError)
			return res.status(500).send({
				error: 'failed_to_connect',
				error_description: 'a attempt to connect failed'
			});
		try {
			return Provider.findById(req.query.id, (findError, findAnswer) => {
				if (findError)
					return res.status(400).send({
						error: 'provider_not_found',
						error_description:
							'provider not found, moved, or invalid, please check your data'
					});
				findAnswer.remove((removeError, removedDocument) => {
					if (removeError)
						return res.status(500).send({
							error: 'failed_to_remove',
							error_description: 'a attempt to remove failed'
						});
					
					return res.status(200).send(removedDocument);
				});
			});
		} catch (error) {
			
			return res.status(500).send({
				error: 'internal_error',
				error_description: 'something went wrong'
			});
		}
	});
});

module.exports = router;
