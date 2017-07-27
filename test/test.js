const expect = require('chai').expect;
const request = require('request');

const hostname = 'localhost';
const port = 8000;
const host = `http://${hostname}:${port}/todo`;

function addTempTestData() {
	const data = {id: 2, text: 'Hello'};
	request.post({url: host, json: data});
}

function DeleteRemainingData() {
	const data = {id: 1, text: 'world hello'};
	request.delete({url: host, json: data});
}

addTempTestData();

describe('CREATE', () => {
	const data = {id: 1, text: 'hello world'}
	it('new entry returns 200', (done) => {
		request.post({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			done();
		});
	});
	it('extant entry returns 409', (done) => {
		request.post({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(409);
			done();
		});
	});
});


describe('READ', () => {
	it('successful query returns array', (done) => {
		request.get(host, (err, resp, body) => {
			expect(JSON.parse(body) instanceof Array).to.equal(true);
			done();
		});
	});
});


describe('UPDATE', () => {
	it('successful text modify returns 200', (done) => {
		const data = {id: 1, text: 'hello world', newText: 'world hello'};
		request.put({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			done();
		});
	});
	it('sucessful id switch returns 200', (done) => {
		const data = {id: 1, newId: 2, text: 'world hello'};
		request.put({url:host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			done();
		});
	});
	it('successful shift returns 200', (done) => {
		const data = {idArray: "[1, 2]"}
		request.put({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			done();
		});
	});
	it('missing parameters returns 400', (done) => {
		const data = {id: 999, text: 'Bonjour mon ami'};
		request.put({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(400);
			done();
		})
	});
});


describe('DELETE', () => {
	it('successful deletion returns 200', (done) => {
		const data = {id: 0, text: 'Hello'};
		request.delete({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			DeleteRemainingData();
			done();
		});
	});
	it('deleting non-existing entry returns 404', (done) => {
		const data = {id: 9999, text: 'Homer Simpson rides motorcycles'};
		request.delete({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(404);
			done();
		});
	});
});


