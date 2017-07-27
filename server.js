const express = require('express');
const bodyParser = require('body-parser');
const server = require('http').createServer();
const WebSocket = require('ws');
const Query = require('./queries');

const app = express();
const host = 'localhost';
const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/src/index.html');
});


// CRUD 
app.post('/todo', (req, res) => {
	// json parameters = id, text
	const data = req.body;
	console.log('POST: ' + JSON.stringify(data));
	const query = new Query();
	query.addEntry(data, (status) => {
		res.sendStatus(status)
		query.endPool();
	});
});

app.get('/todo', (req, res) => {
	// no parameters = fetches all entries
	console.log('GET');
	const query = new Query();
	query.getEntries((result) => {
		if (typeof result === Number) {
			res.sendStatus(result);
		} else {
			res.send(result);
		}
		query.endPool();
	});
});

app.put('/todo', (req, res) => {
	// json parameters = id, text, newText || idArray
	const data = req.body;
	console.log('PUT: ' + JSON.stringify(data));
	const query = new Query();
	query.modifyController(data, (result) => {
		if (result === 400) {
			res.status(result).send(
				'FormatError: {id: number, text: string  new[Id/Text]: string} || {idArray: object}'
			)
		} else {
			res.sendStatus(result);
		}
		query.endPool();
	});
});

app.delete('/todo', (req, res) => {
	// json parameters = id, text
	const data = req.body;
	console.log('DELETE: ' + JSON.stringify(data));
	const query = new Query();
	query.deleteEntry(data, (status) => res.sendStatus(status));
	query.endPool();
});


// WEBSOCKET
const wss = new WebSocket.Server({
	server: server,
	path: '/echo'
});

wss.on('connection', (ws) => {
	console.log('client connected');
	ws.on('message', (msg) => {
		console.log(msg);
		wss.clients.forEach((client) => {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				client.send(msg);
			}
		});
	});
});


// LISTEN
server.on('request', app);

server.listen(port, host, () => { 
	console.log(`listening on http://${host}:${port}`)
});
