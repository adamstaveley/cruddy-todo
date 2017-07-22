const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const host = '0.0.0.0';
const port = 8000;

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/src/index.html');
});


// CRUD 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

function createPool() {
	const pool = new Pool({database: "todo"});
	pool.connect();
	return pool;
}

function testTypes(data) {
	return typeof data.id === 'number' && typeof data.text === 'string';
}


// CREATE
app.post('/todo', (req, res) => {
	// json parameters = id, text
	const data = req.body;
	console.log('POST')
	console.log(data);
	if (testTypes(data)) {
		verifyEntry(data, (status) => res.sendStatus(status));	
	} else {
		res.status(400).send('TypeError: form: {id: number, entry: string}');
	}
});

function verifyEntry(data, callback) {
	let query = {
		text: 'SELECT * FROM entries WHERE id = $1 AND text = $2',
		values: [data.id, data.text]
	}
	const pool = createPool();
	pool.query(query, (err, res) => {
		res.rowCount > 0 ? callback(409) : addEntry(query, (status) => callback(status));
		pool.end();
	});
}

function addEntry(query, callback) {
	query.text = 'INSERT INTO entries (id, text) VALUES ($1, $2)';
	const pool = createPool();
	pool.query(query.text, query.values, (err, res) => {
		const status = err > 0 ? 500 : 200;
		pool.end();
		callback(status);
	});
}


// READ
app.get('/todo', (req, res) => {
	// no parameters = fetches all entries
	console.log('GET');
	const pool = createPool();
	pool.query('SELECT * FROM entries', (err, result) => {
		if (result) {
			result.rowCount > 0 ? res.send(result.rows) : res.sendStatus(404);
		}
		pool.end();
	});
});


//UPDATE
app.put('/todo', (req, res) => {
	// json parameters = id, text, newEntry || idArray
	const data = req.body;
	if (data.newEntry) {
		modifyEntry(data, (status) => res.sendStatus(status));
	} else if (data.idArray) {
		shiftEntries(data, (status) => res.sendStatus(status));
	} else {
		res.status(400).send('TypeError: {id: number, text: string} || {idArray: object}')
	}
});

function modifyEntry(data, callback) {
	const query = {
		text: 'UPDATE entries SET entry = $1 WHERE id = $2 AND text = $3',
		values: [data.newEntry, data.id, data.text]
	}
	const pool = createPool();
	pool.query(query, (err, res) => {
		res.rowCount > 0 ? callback(200) : callback(404);
		pool.end();
	});
}

function shiftEntries(data, callback) {
	const idArray = JSON.parse(data.idArray);
	const pool = createPool();
	idArray.map((id) => {
		// errors mapped to true in array - if error callback 500
		const query = {
			text: 'UPDATE entries SET id = $2 WHERE id = $1',
			values: [id, id + 1]
		}
		return pool.query(query, (err) => {
			return err ? true : false; 
		});
	});
	idArray.find((bool) => {bool === true}) ? callback(500) : callback(200);
	pool.end();
}


//DELETE
app.delete('/todo', (req, res) => {
	// json parameters = id, text
	const data = req.body;
	console.log('DELETE')
	console.log(data);
	if (testTypes(data)) {
		deleteEntry(data, (status) => res.sendStatus(status));
	} else {
		res.status(400).send('TypeError: form: {id: number, text: string}');
	}
});

function deleteEntry(data, callback) {
	const query = {
		text: 'DELETE FROM entries WHERE id = $1 AND text = $2',
		values: [data.id, data.text]
	}
	console.log(query);
	const pool = createPool();
	pool.query(query, (err, res) => {
		if (res) {
			res.rowCount > 0 ? callback(200) : callback(404);
		}
		pool.end();
	});
}


// listen
app.listen(port, host, () => console.log(`Listening on http://${host}:${port}`));
