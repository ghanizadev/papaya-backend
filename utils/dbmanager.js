const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
class DBManager {
	constructor() {
		this.db = null;
		this.connection = null;
	}

	async start() {
		if(this.connection === null)
			if (process.env.NODE_ENV !=='test'){
				mongoose.connect(process.env.MONGO_HOST)
					.then(db => {
						console.log('Database successfully connected!');

						db.connection.once('open', () => {
							db.connection.on('disconnected', () => console.log('Database disconnected!'));
							db.connection.on('reconnected', () => console.log('Database reconnected!'));
						});

					})
					.catch(() => {
						throw new Error('Database: Failed to connect to MongoDB!');
					});
			}


	}

	stop() {
		mongoose.disconnect();
	}
}

module.exports = DBManager;
