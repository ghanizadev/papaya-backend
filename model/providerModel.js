const mongoose = require('mongoose');

const validateCNPJ = cnpj => {
 
	cnpj = cnpj.replace(/[^\d]+/g,'');

	if(cnpj == '') return false;
   
	if (cnpj.length != 14)
		return false;

	if (cnpj == '00000000000000' || 
      cnpj == '11111111111111' || 
      cnpj == '22222222222222' || 
      cnpj == '33333333333333' || 
      cnpj == '44444444444444' || 
      cnpj == '55555555555555' || 
      cnpj == '66666666666666' || 
      cnpj == '77777777777777' || 
      cnpj == '88888888888888' || 
      cnpj == '99999999999999')
		return false;
       
	let tamanho = cnpj.length - 2;
	let numeros = cnpj.substring(0,tamanho);
	const digitos = cnpj.substring(tamanho);
	let soma = 0;
	let pos = tamanho - 7;
	for (let i = tamanho; i >= 1; i--) {
		soma += numeros.charAt(tamanho - i) * pos--;
		if (pos < 2)
			pos = 9;
	}
	let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if (resultado != digitos.charAt(0))
		return false;
       
	tamanho = tamanho + 1;
	numeros = cnpj.substring(0,tamanho);
	soma = 0;
	pos = tamanho - 7;
	for (let i = tamanho; i >= 1; i--) {
		soma += numeros.charAt(tamanho - i) * pos--;
		if (pos < 2)
			pos = 9;
	}
	resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if (resultado != digitos.charAt(1))
		return false;
         
	return true;
  
};

const ProviderSchema = new mongoose.Schema({
	providerId: { type: String, unique: true },
	name: { type: String, required: true },
	address: {
		street: String,
		number: String,
		district: String, 
		city: String,
		postalCode: String,
		state: String
	},
	cnpj: {
		type: String,
		required: true,
		unique: true,
		validate: { validator: item => validateCNPJ(item), message: 'invalid CNPJ' },
	},
	email: { type: String, required: true },
	website: { type: String },
	phoneNumber: { type: String, required: true },
}, {collection: 'providers', timestamps: true});

const Provider = mongoose.model('Provider', ProviderSchema);

module.exports = Provider;
