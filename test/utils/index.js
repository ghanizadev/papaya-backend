const {User, Client, Pizza, Flavor, Product} = require('../../model');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');

const server = new MongoMemoryServer();

const populateDatabase = async () => {	
	await server.getConnectionString()
		.then(async url => {
			await mongoose.connect(url)
				.then(async db => {
					const user = new User({
						name: 'Administrator',
						email: 'admin@admin.com',
						password: bcrypt.hashSync('123456', '$2b$10$vsxz0Ld.zLy6MvmM8b4tRenrWSh.dl4xNHHeevmBI.ndpoC0hAreq'),
					});
				
					const client = new Client({
						clientId: 'lasolana',
						clientSecret: 'minhamarguerita'
					});

					const pizza = new Pizza({
						code: 10,
						title: 'PIZZA PEQUENA'
					});

					const flavor = new Flavor(  {
						description: [
							'MOLHO',
							'PARMESAO',
							'PROVOLONE',
							'GORGONZOLA',
							'CHAMPIGNON',
							'MUSSARELA',
							'OREGANO'
						],
						provider: 'LASOLANA',
						small: 33,
						medium: 44,
						large: 55,
						code: '1141',
						name: 'QUATRO QUEIJOS',
						group: 'COM VEGETAIS',
						variation: 'COM CHAMPIGNON'
					});

					await flavor.save();

					await pizza.save();
				
					await client.save();

					await user.save();

	
					server.getDbName()
						.then(name => db.connection.useDb(name));
				})
				.catch(error => {throw new Error(error);});
		});
};

const close = async http => {
	if (http) {
		await http.close();
	}
	mongoose.connections.forEach(async con => {
		await con.close();
	});
	server.stop();
};

module.exports = {
	populateDatabase,
	close
};