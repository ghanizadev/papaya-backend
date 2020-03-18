const express = require('express');
const router = express.Router();
const {Management} = require('../../model');
const {saveDocument} = require('../utils');
const uuid = require('uuid/v4');


router.post('/', async (req, res, next) => {
	try{
		const query = Management.findOne({opened: true});
		await query.exec()
			.then(result => {
				if(result){
					throw new Error ({status: 400, error: 'already_open', error_description: 'there is a jounal currently open'});
				}
			});
		const {email} = req.user;
		const hash = uuid();
    
		const day = new Management(req.body);
  
		day.set({
			email,
			hash
		});
		return saveDocument(day)
			.then(savedManagement => res.status(201).send(savedManagement))
			.catch(next);
	} catch(e){
		return next(e);
	}

});

router.post('/income', async (req, res, next) => {
	try{
		const {email} = req.user;
    
		const id = req.body.id ||  uuid();
		const value = req.body.value;
		const user = email;

		if(!req.body.source || !['CASH', 'CREDIT', 'DEBIT', 'TICKET', 'OTHERS'].includes(req.body.source.toUpperCase()))
			return next({status: 400, error: 'invalid_source', error_description: 'a valid source must be specified'});

		const source = req.body.source;
    
		const item = { id, value, user, source };
    
		const query = Management.findOneAndUpdate({opened: true}, {$push: {incomes: item}}, {new: true});
    
		return query.exec()
			.then(foundManagement => res.status(201).send(foundManagement))
			.catch(next);
  
	} catch(e){
		return next(e);
	}

});

router.post('/outgoing', async (req, res, next) => {
	try{
		const {email} = req.user;
    
		const id = req.body.id ||  uuid();
		const value = req.body.value;
		const user = email;

		const item = { id, value, user };
    
		const query = Management.findOneAndUpdate({opened: true}, {$push: {outgoings: item}}, {new: true});
    
		return query.exec()
			.then(foundManagement => {
				if (!foundManagement)
					return next({status: 404, error: 'not_found', error_description: 'there is no open journal at the moment'});
				res.status(201).send(foundManagement);
			})
			.catch(next);
  
	} catch(e){
		return next(e);
	}

});

const getBalance = management => {
	const incomes = management.incomes;
	const outgoings = management.outgoings;

	const creditArr =  incomes.filter(item => item.source === 'CREDIT');
	const debitArr =  incomes.filter(item => item.source === 'DEBIT');
	const ticketArr =  incomes.filter(item => item.source === 'TICKET');
	const othersArr =  incomes.filter(item => item.source === 'OTHERS');
	const cashArr =  incomes.filter(item => item.source === 'CASH');

	const credit = creditArr.reduce((stack, actual) => stack + actual.value, 0);
	const debit = debitArr.reduce((stack, actual) => stack + actual.value, 0);
	const ticket = ticketArr.reduce((stack, actual) => stack + actual.value, 0);
	const others = othersArr.reduce((stack, actual) => stack + actual.value, 0);
	const cash = cashArr.reduce((stack, actual) => stack + actual.value, 0);

	const outgoing = outgoings.reduce((stack, actual) => stack + actual.value, 0);

	const total = credit + debit + ticket + others + cash;

	const balance = management.amount + total - outgoing;
	
	return {
		income: {
			card: {
				credit,
				debit,
				ticket
			},
			cash,
			others
		},
		outgoing,
		total,
		firstAmount: management.amount,
		balance,
		grossProfit: balance - management.amount,
	};
};

router.get('/balance', async (req, res, next) => {
	try{

		let query= Management.findOne({opened: true});
    
		return query.exec()
			.then(foundManagement => {
				if (!foundManagement)
					return next({status: 404, error: 'not_found', error_description: 'there is no open journal at the moment'});

				result = getBalance(foundManagement);
        
				return res.status(200).send(result);
			})
			.catch(next);
  
	} catch(e){
		return next(e);
	}

});

router.patch('/close', async (req, res, next) => {
	try{
		const query = Management.findOneAndUpdate({opened: true}, {opened: false}, {new: true});
    
		return query.exec()
			.then(closedManagement => {
				if (!closedManagement)
					return next({status: 404, error: 'not_found', error_description: 'there is no open journal at the moment'});
					
				result = getBalance(closedManagement);

				return res.status(200).send(result);
			})
			.catch(next);
  
	} catch(e){
		return next(e);
	}
});



module.exports = router;
