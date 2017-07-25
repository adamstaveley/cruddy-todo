## cruddy-todo

Add, move, modify and delete todo entries across a local network. The client uses React 
whilst the server queries a postgres database.

## Setup

Postgres setup:

```
$ sudo -u postgres createuser -P $USER
$ sudo -u postgres createdb -O $USER todo
$ psql todo
todo=> CREATE TABLE entries (id smallint, text varchar);
```

To allow node-postgres to access the database, you will need to edit the authentication
method from ident to md5 in your `pg_hba.conf` file (typically located in `/var/lib/pgsql/data/`). 

Program setup and start:
```
$ git clone https://github.com/ayuopy/cruddy-todo.git
$ npm install --production
$ ./setup.sh $YOUR_HOST
$ PGPASSWORD=$YOUR_PASSWORD npm start
```

* Run setup.sh with an IP address parameter to configure the host IP. If don't wish for other 
	devices to access the host, you can skip this step. If you wish to run setup more than once,
	you will need to modify the setup file to search for the last IP address passed to it rather
	than localhost. 


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
