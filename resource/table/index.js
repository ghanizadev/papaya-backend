const express = require('express');

const router = express.Router();
const { Table} = require('../../model');
const {saveDocument} = require('../utils');


router.get('/', async (req, res, next) => {
	const query = Table.find(req.query);
	 return query.exec()
	 .then(foundTables => {
			res.status(200).send(foundTables.sort((a, b) => a.number - b.number));
	 })
	 .catch(next);
});

router.get('/:number', async (req, res, next) => {
	const {number} = req.params;
	const query = Table.find({number});

	return query.exec()
		.then(foundTable => {
			if(!foundTable) return next({tatus: 404, error: 'not_found', error_description: 'requested tables was not found'});
			return res.status(200).send(foundTable);
		}).catch(next);
});

router.post('/', async (req, res, next) => {
	const table = new Table(req.body);

	return saveDocument(table)
		.then(savedTable => {
			res.status(201).send(savedTable);
		}).catch(next);
});

router.put('/:number', async (req, res, next) => {
	const {number} = req.params;
	const query = Table.findOne({ number });
	
	return query.exec()
		.then(foundTable => {
			if (!foundTable)
				return res.status(404).send({ error: 'not_found', error_description: 'requested table was not found in our database' });

			foundTable.set(req.body);

			return saveDocument(foundTable)
				.then(savedTable => res.status(201).send(savedTable));
		})
		.catch(next);
});

module.exports = router;
