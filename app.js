var express = require('express');
var path = require('path');
const fs = require('fs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nanoid = require('nanoid');
var compression = require('compression');
var viewEngine = require('express-json-views');
var dotenv = require('dotenv');
var gobalSetup = require('./utils/globalSetup');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
global.secret = nanoid(16);
app.engine('json', viewEngine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'json');

var mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

gobalSetup();

var authRoutes = require('./resource/authentication/endpoints');
var { JWTParser } = require('./resource/authentication/token');
var user = require('./resource/user');
var product = require('./resource/product');
var order = require('./resource/order');
var customer = require('./resource/customer');
var provider = require('./resource/provider');
var delivery = require('./resource/delivery');
var table = require('./resource/table');
var item = require('./resource/item');
var flavor = require('./resource/flavor');
var pizza = require('./resource/pizza');
var waitingList = require('./resource/waitinglist');

let connected = [];

const DbManager = require('./utils/dbmanager');
const db = new DbManager();
db.start();

if(app.get('env') === 'development')
	app.use(logger('dev'));
else
	app.use(logger('common', {
		stream: fs.createWriteStream('./access.log', {flags: 'a'}),
		skip: (req, res) => res.statusCode < 300
	}));


app.use('/', (req, res, next) =>{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
	res.setHeader('Access-Control-Allow-Headers', 'Authorization, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
	next();
});


app.options('*', (req, res)=> {
	res.sendStatus(200);
});

const updateCallback = (req, res, next) => {
	req.on('close', () => {
		connected.forEach(socket => socket.emit('update'));
		// console.info('Emmiting to ' + connected.length + ' users');
	});
	next();
};

const onAuth = (req, res, next) => {
	io.on('connection', socket => {
		if (connected.find(s => s.id === socket.id) === undefined){
			connected.push(socket);
			console.log(`Client connected! (${socket.id}) => ${connected.length} now connected`);
		}

		socket.on('disconnect', () => {
			connected = connected.filter(item => item.id !== socket.id);
			console.log(`Client disconnected! (${socket.id}) => ${connected.length} now connected`);

		});
	});
	next();
};

const auth = (req, res, next) => {
	if(req.headers.authorization){
		const auth = req.headers.authorization || req.query.access_token;

		if(auth.startsWith('Bearer')){
			const jwtParser = new JWTParser(auth.substring(7));

			jwtParser
				.getUserData()
				.then(result => {
				//TODO: Validar authorities;
					req.user = result;
					next();
				})
				.catch(error => {
					res.status(error.status).send(error);
				});
		}
		else {
			res.status(400).send({error: 'auth_missing', error_description: 'a token of type bearer is expected'});
		}
	}else {
		res.status(403).send({error: 'auth_missing', error_description: 'authorization is required for this endpoint'});
	}
};

app.use('*', (req, res, next) => {
	if (req.is('application/json') || req.is('application/x-www-form-urlencoded'))
		next();
	else if (req.method === 'GET' || req.method === 'DELETE') next();
	else
		return next({status: 400, error: 'invalid_content', error_description: 'only JSON is acceptable for this request'});
});

app.get('/api/v1/user', auth, user);

app.use('/api/v1/user', user);
app.use('/oauth', onAuth, authRoutes);
app.use('/api/v1/product', product);
app.use('/api/v1/order', auth, updateCallback, order);
app.use('/api/v1/customer', auth, customer);
app.use('/api/v1/provider', provider);
app.use('/api/v1/delivery', delivery);
app.use('/api/v1/table', table);
app.use('/api/v1/item', item);
app.use('/api/v1/flavor', flavor);
app.use('/api/v1/pizza', pizza);
app.use('/api/v1/waitinglist',  updateCallback, waitingList);


// eslint-disable-next-line no-unused-vars
/** Comentário aqui */
app.use(function (err, req, res, next) {
	console.log(err);
	const response = {
		error: err.error || 'internal_error',
		error_description: err.error_description || 'something went bad',
		status: err.status || 500
	};
	res.status(err.status || 500);

	res.send(response);
});

module.exports = http;
