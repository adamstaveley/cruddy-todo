const expect = require('chai').expect;
const request = require('request');

const hostname = '0.0.0.0';
const port = 8000;
const host = `http://${hostname}:${port}/todo`;

//NOTE: Sections will conflict - run individually or call api dynamically in request callback
// e.g. send delete request after creating random entry

describe('CREATE', () => {
	const data = {id: Math.floor(Math.random() * 32000), entry: 'hello world'}
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
	it('invalid parameters return 400', (done) => {
		data.id = '66';
		request.post({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(400);
			done();
		});
	});
});


describe('READ', () => {
	it('successful query returns array', (done) => {
		request.get(host, (err, resp, body) => {
			expect(typeof JSON.parse(body)).to.equal('object');
			done();
		});
	});
});


describe('UPDATE', () => {

	it('successful modify returns 200', (done) => {
		const data = {id: 1, entry: 'hello world', newEntry: 'world hello'};
		request.put({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			done();
		});
	});
	it('non-existent entry returns 404', (done) => {
		const data = {id: 999, entry: 'Burns and Smithers sitting in a tree', newEntry: 'Burns baby Burns'};
		request.put({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(404);
			done();
		})
	});
	it('successful shift returns 200', (done) => {
		const data = {idArray: "[3, 4, 5, 6, 7]"}
		request.put({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			done();
		});
	});
});


describe('DELETE', () => {
	it('successful deletion returns 200', (done) => {
		const data = {id: 1, entry: 'hello world'};
		request.delete({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(200);
			done();
		});
	});
	it('deleting non-existing entry returns 404', (done) => {
		const data = {id: 9999, entry: 'Homer Simpson rides motorcycles'};
		request.delete({url: host, json: data}, (err, resp, body) => {
			expect(resp.statusCode).to.equal(404);
			done();
		});
	});
});

