const express = require('express');
const Item = require('../../model').Item;
const router = express.Router();

const {saveDocument}  = require('../utils');


router.post('/', async (req, res, next) => {
	const { body } = req;

	if(Array.isArray(body)){
		const itemsToSave = body.map(item => saveDocument(new Item({name: item.toUpperCase()})));

		return Promise.all(itemsToSave)
			.then(itemsSaved => res.status(201).send(itemsSaved))
			.catch(next);
	}else
		return next({status: 400, error: 'invalid_data', error_description: 'request body does not have a valid body'});
});

router.get('/', async (req, res, next) => {
	const string = {name: new RegExp(req.query.name ? req.query.name : '', 'i')};
	console.log(string);
	const query = Item.find(string);
	
	return query.exec()
		.then(foundItems => res.status(200).send(foundItems))
		.catch(next);
});

router.delete('/', async (req, res, next) => {
	if (req.query.name){
		const query = Item.findOneAndDelete({name: req.query.name.toUpperCase()});
	
		return query.exec()
			.then(foundItem => {
				if(!foundItem)
					return next({ status: 404, error: 'not_found',	error_description: 'requested item was not found'	});
				return res.status(200).send(foundItem);
			}).catch(next);
	}
	return next({ status: 400, error: 'invalid_query',	error_description: 'the query must have a "name" property'});

});


module.exports = router;
