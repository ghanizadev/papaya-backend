
const crypto = require('crypto');

const checkAuthorities = (authorities = [], required = []) => {
	let count = 0;
  
	if (required.length === 0)
		return true;
    
	required.forEach(authority => {
		if (authorities.includes(authority))
			count ++;
	});

	return count === required.length;
};

const saveDocument = (document) => new Promise((resolve, reject) =>{
	
	document.validate()
		.then(() => {
			document.save()
				.then(resolve)
				.catch(error => {

					if(error.code && error.code === 11000){
						const response ={
							status: 400,
							error: 'failed_to_validate',
							error_description: 'please, check your request body, probably the content you are trying to save is already saved'
						};
						return reject(response);
					}
					return reject({ status: 500,  error: 'internal_error', error_description: 'save file was not possible' });
	
				});
		})
		.catch(validationError => {
			return reject({ status: 400, error: 'failed_to_validate', error_description: validationError.message });
		});
});

const friendlyId = lenght => crypto
	.randomBytes(Math.ceil((lenght * 3) / 4))
	.toString('base64')
	.slice(0, lenght)
	.replace(/\+/g, '0')
	.replace(/\//g, '0');


const calculateValues = (doc) => {
	let total = doc.total || 0;
	const result = doc;

	let paid = 0;

	result.items.forEach(item => {
		total += item.subtotal;
	});


	result.payments.forEach(payment => {
		paid += payment.value;
	});

	const serviceTax = total * 0.1; //TODO valor da taxa de serviço
	const final = total + serviceTax;
	const remaining = Math.max(0, final - paid);
	const change = Math.max(0, paid - final);

	result.change = change.toPrecision(6);
	result.serviceTax = serviceTax.toPrecision(6);
	result.total = total.toPrecision(6);
	result.final = final.toPrecision(6);
	result.paid = paid.toPrecision(6);
	result.remaining = remaining.toPrecision(6);

	return result;
};

const calculateCustomerValues = customer => {
	const {pricing} = global.config.rules;
	const {name, items} = customer;

	let total = 0;
	let paid = 0;
	let remaining = 0;
	const serviceTax = pricing.serviceTax;

	items.forEach(item => {
		total += item.price;

		item.payments && item.payments.forEach(payment => {
			paid += payment.value;
		});

		remaining = total - remaining;
	});

	return {
		name,
		items,
		total,
		remaining,
		paid,
		serviceTax: serviceTax * 0.01 * remaining,
		final: total + (serviceTax * 0.01 * remaining)
	};
};

const calculateProductValues = product => {
	const {payments, price, code, ref, quantity, owner} = product;
	const {pricing} = global.config.rules;

	const total= price * quantity;
	const serviceTax = pricing.serviceTax * 0.01 * total;
	let paid = 0;

	payments.forEach(payment => {
		paid += payment.value;
	});

	const result = {
		code,
		ref,
		price,
		total,
		serviceTax,
		final: total + serviceTax,
		paid
	};

	return result;

};

module.exports = {
	saveDocument,
	friendlyId,
	calculateValues, 
	calculateCustomerValues,
	calculateProductValues,
	checkAuthorities
};
