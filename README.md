## cruddy-todo

HTTP API at `/todo` endpoint

|method |function 				  |data type											|
|-------|-------------------------|-----------------------------------------------------|
|POST   |Add entry to todo list   |json: `{id: number, entry: string}`					|
|GET    |Retrieve all entries     |														|
|PUT    |Update entry             |json: `{id: number, entry: string, newEntry: string}`|
|PUT    |Shift entry id downwards |json: `{idArray: string}`							|
|DELETE |Delete entry             |json: `{id: number, entry: string}`					|

* Where id is the entry's identifier and entry is the entry's text.
* idArray should contain an array with the ids to be moved e.g. `"[1, 2, 3, 4]"` if you wish to create
	an entry at #1 and have four existing entries.
