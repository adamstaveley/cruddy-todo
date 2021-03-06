import React from "react";
import ReactDOM from "react-dom";

const host = window.location.host;
const todoRoute = `http://${host}/todo`;
const echoRoute = `ws://${host}/echo`;
console.log(echoRoute);

class Move extends React.Component {
	constructor(props) {
		super(props);
	}

	requestSwitch(direction) {
		const id = this.props.data.id;
		const text = this.props.data.text;
		const target = direction === 'up' ? id - 1 : id + 1;
		const data = {id: id, newId: target, text: text};
		this.props.onClick(data);
	}

	render() {
		return (
			<span>
				<span className="glyphicon glyphicon-chevron-up"
					onClick={() => this.requestSwitch('up')}
					aria-hidden="true"></span>
				<span className="glyphicon glyphicon-chevron-down"
					onClick={() => this.requestSwitch('down')}
					aria-hidden="true"></span>
			</span>
		);
	}
}

function Edit(props) {
	return (	
		<span className="trash-button" onClick={() => props.onClick()}>
			<span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
		</span>
	);
}


function Trash(props) {
	const data = {id: props.data.id, text: props.data.text};
	return (
		<span className="trash-button" onClick={() => props.onClick(data)}>
			<span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
		</span>
	);
}

class AddForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			value: ''
		};

		this.toggleOpen = this.toggleOpen.bind(this);
		this.updateValue = this.updateValue.bind(this);
		this.submit = this.submit.bind(this);
	}

	toggleOpen() {
		this.setState({isOpen: !this.state.isOpen});
	}

	updateValue(event) {
		this.setState({value: event.target.value});
	}

	submit(event) {
		const data = {id: this.props.id + 1, text: this.state.value};
		this.props.onSubmit(data);
		this.setState({value: ''});
		event.preventDefault();
	}

	renderForm() {
		return(
			<form className="entry-form" onSubmit={this.submit}>
				<input className="entry-form-input"
					placeholder="write new entry..."
					value={this.state.value}
					onChange={this.updateValue}
					autoFocus>
				</input>
			</form>
		)
	}

	render() {
		const symbol = this.state.isOpen ? 'minus' : 'plus';
		const glyphicon = `glyphicon glyphicon-${symbol}`;
		return (
			<div className="add">
				<div className="add-button" onClick={this.toggleOpen}>
					<span className={glyphicon} aria-hidden="true"></span>
				</div>
				{this.state.isOpen ? this.renderForm() : <div/>}
			</div>
		);
	}
}

class ModifyForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {value: this.props.data.text};
		this.updateValue = this.updateValue.bind(this);
		this.submit = this.submit.bind(this);
	}

	updateValue(event) {
		this.setState({value: event.target.value});
	}

	submit(event) {
		const data = {
			id: this.props.data.id, 
			text: this.props.data.text,
			newText: this.state.value
		};
		this.props.onSubmit(data);
		event.preventDefault();
	}

	render() {
		return (
			<form className="entry-form" onSubmit={this.submit}>
				<input className="entry-form-input"
					value={this.state.value}
					onChange={this.updateValue}
					autoFocus>
				</input>
			</form>
		);
	}
}

class App extends React.Component {
	constructor() {
		super();
		this.state = {numEntries: 0};

		this.ws = new WebSocket(echoRoute);
		this.ws.onmessage = () => this.getEntries();
		this.ws.onerror = (err) => console.log(err);
	}

	apiRequest(method, data, callback) {
		const xhr = new XMLHttpRequest;
		xhr.open(method, todoRoute, true);
		if (!(method === 'GET')) { 
			xhr.setRequestHeader('Content-Type', 'application/json'); 
		}
		xhr.onreadystatechange = () => { 
			if (xhr.readyState === 4 && xhr.status === 200) {
				callback(xhr, method);
			}
		};
		xhr.onerror = () => console.log(xhr.statusText);
		xhr.send(data);
	}

	getEntries() {
		this.apiRequest('GET', null, (xhr) => {
			this.entries = JSON.parse(xhr.responseText);
			this.entries.forEach((entry) => {
				const openKey = `isOpen${entry.id}`;
				const modifyKey = `modify${entry.id}`;
				this.setState({[openKey]: false});
				this.setState({[modifyKey]: false});
			});
			this.setState({numEntries: this.entries.length});

		});
	}

	updateEntry(method, data) {
		data = JSON.stringify(data);
		this.apiRequest(method, data, (xhr, method) => { 
			if (method === 'DELETE') {
				this.shiftEntries(JSON.parse(data).id);
			} else {
				this.getEntries();
			}
			this.ws.send('UPDATE');
		});
	}

	shiftEntries(id) {
		const numAfter = this.state.numEntries - id;
		if (numAfter > 0) {
			let idArray = Array.from(Array(numAfter).keys());  // populate array of numAfter length
			idArray = idArray.map(i => { return i + id + 1 }); // add id + 1 (given 0 index)
			const data = {idArray: JSON.stringify(idArray)};
			this.updateEntry('PUT', data);
		} else {
			this.getEntries();
		}
	}

	updateOpenState(id) {
		const key = `isOpen${id}`;
		this.setState({[key]: !this.state[key]});
	}

	modifyText(id) {
		const modifyKey = `modify${id}`;
		this.setState({[modifyKey]: true});
	}

	renderEntry() {
		return (
			<div className="entries">
				{this.entries.map(entry => {
					const openKey = `isOpen${entry.id}`;
					const modifyKey = `modify${entry.id}`;
					return (
						<ul className="entry" key={entry.id} data={entry}>
							{this.state[modifyKey] ? 
								<ModifyForm data={entry}
									onSubmit={(data) => this.updateEntry('PUT', data)}/> : 
								<li className="text" id={entry.id} 
									onClick={() => this.updateOpenState(entry.id)}>
									{entry.text}
								</li>}
							{this.state[openKey] ? this.renderButtons(entry) : <li/>}
						</ul>
					);
				})}
			</div>
		);
	}

	renderButtons(entry) {
		return (
			<li className="buttons">
				<Move arrow="down" data={entry} onClick={(data) => this.updateEntry('PUT', data)} />
				<Edit onClick={() => this.modifyText(entry.id)}/>
				<Trash data={entry} onClick={(data) => this.updateEntry('DELETE', data)} />
			</li>
		)
	}

	componentDidMount() {
		this.getEntries();
	}

	render() {
		return (
			<div className="todo-container">
				{this.state.numEntries ? this.renderEntry() : <div/>}
				<AddForm id={this.state.numEntries} 
					onSubmit={(data) => this.updateEntry('POST', data)}/>
			</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.querySelector('#app')
)
