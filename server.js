const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const host = 'localhost';
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
	});
	pool.end();	
}

function addEntry(query, callback) {
	query.text = 'INSERT INTO entries (id, text) VALUES ($1, $2)';
	const pool = createPool();
	pool.query(query.text, query.values, (err, res) => {
		const status = err > 0 ? 500 : 200;
		callback(status);
	});
	pool.end();
}


// READ
app.get('/todo', (req, res) => {
	// no parameters = fetches all entries
	console.log('GET');
	const pool = createPool();
	pool.query('SELECT * FROM entries ORDER BY id', (err, result) => {
		if (result) {
			result.rowCount > 0 ? res.send(result.rows) : res.sendStatus(404);
		}
	});
	pool.end();
});


//UPDATE
app.put('/todo', (req, res) => {
	// json parameters = id, text, newText || idArray
	const data = req.body;
	console.log('PUT');
	console.log(data);
	const callback = (status) => res.sendStatus(status);
	if (data.newText) {
		modifyText(data, callback);
	} else if (data.newId) {
		modifyId(data, callback);
	} else if (data.idArray) {
		shiftEntries(data, callback);
	} else {
		res.status(400).send('TypeError: {id: number, text: string  new[Id/Text]: string} || {idArray: object}')
	}
});

function modifyText(data, callback) {
	const query = {
		text: 'UPDATE entries SET text = $1 WHERE id = $2 AND text = $3',
		values: [data.newText, data.id, data.text]
	}
	const pool = createPool();
	pool.query(query, (err, res) => {
		if (!err) {
			res.rowCount > 0 ? callback(200) : callback(404);
		} else {
			console.log(err);
		}
	});
	pool.end();
}

function modifyId(data, callback) {
	getEntryById(data.newId, (targetText) => { 
		const text = 'Update entries SET id = $1 WHERE id = $2 AND text = $3';
		let queries = [
			{text: text, values: [data.newId, data.id, data.text]},
			{text: text, values: [data.id, data.newId, targetText]}
		];
		const pool = createPool();
		pool.query(queries[0]);
		pool.query(queries[1], (err, res) => {
			if (err) {
				console.log(err);
				callback(500);
			} else {
				res.rowCount > 0 ? callback(200) : callback(500);
			}
		})
		pool.end();
	});
}

function getEntryById(id, callback) {
	const query = {
		text: 'SELECT text FROM entries WHERE id = $1',
		values: [id]
	};
	const pool = createPool();
	pool.query(query, (err, res) => {
		err ? console.log(err) : callback(res.rows[0].text);			
	});
	pool.end();
}

function shiftEntries(data, callback) {
	// used after deletion
	let idArray = JSON.parse(data.idArray);
	const pool = createPool();
	idArray.forEach((id) => {
		const query = {
			text: 'UPDATE entries SET id = $2 WHERE id = $1',
			values: [id, id - 1]
		}
		pool.query(query);
		pool.on('error', () => callback(500));
	});
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
	const pool = createPool();
	pool.query(query, (err, res) => {
		if (err) {
			console.log(err);
			callback(500);
		} else {
			res.rowCount > 0 ? callback(200) : callback(404);
		}
	});
	pool.end();
}


// listen
app.listen(port, host, () => console.log(`Listening on http://${host}:${port}`));
