## cruddy-todo

Add, move, modify and delete todo entries across a local network. The client uses React 
whilst the server queries a postgres database.

## Setup

Postgres setup:
```
CREATE DATABASE todo;
CREATE TABLE entries (id smallint, text varchar);
```

Program setup and start:
```
$ git clone https://github.com/ayuopy/cruddy-todo.git
$ npm install --production
$ npm start
```

Note: to serve across the network, change line 6 in `server.js` from `'localhost'` to your 
server's local IP. 


### HTTP API at `/todo` endpoint

|method |function 				  |data type											|
|-------|-------------------------|-----------------------------------------------------|
|POST   |Add entry to todo list   |json: `{id: number, text: string}`					|
|GET    |Retrieve all entries     |														|
|PUT    |Update entry             |json: `{id: number, text: string, newText: string}`  |
|PUT    |Update id				  |json: `{id: number, newId: number, text: string}`    |
|PUT    |Shift ids upwards        |json: `{idArray: string}`							|
|DELETE |Delete entry             |json: `{id: number, text: string}`					|

### Screenshot:

![mobile](https://github.com/ayuopy/cruddy-todo/blob/master/screenshots/mobile.jpg)
