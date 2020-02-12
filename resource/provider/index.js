const express = require('express');
const router = express.Router();
const {saveDocument} = require('../utils');
const {Provider} = require('../../model');

router.get('/', async (req, res, next) => {

	const query = Provider.find(req.query);
		
	return query.exec()
		.then(foundProviders => res.status(200).send(foundProviders))
		.catch(next);
});

router.post('/', async (req, res, next) => {
	const counter = Provider.estimatedDocumentCount();
		
	await counter.exec()
		.then(count => body.providerId = ((count + 1) / 10000).toString().replace('.', ''))
		.catch(next);
		
	const provider = new Provider(req.body);

	return saveDocument(provider)
		.then(result => res.status(201).send(result))
		.catch(next);
});


router.put('/:providerId', async (req, res, next) => {
	const {providerId} = req.params;
	const query = Provider.findOne({providerId});
		
	return query.exec()
		.then(foundProvider => {
			if (!foundProvider)
				return res.status(404).send({error: 'not_found', error_description:'provider not found, moved, or invalid, please check your data'});
			
			const save = foundProvider.toObject();

			delete save.cnpj;
			delete save.email;
			
			foundProvider.set(req.body);

			saveDocument(foundProvider)
				.then(savedProvider => res.status(201).send(savedProvider));
		})
		.catch(next);
});

module.exports = router;
