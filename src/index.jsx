import React from "react";
import ReactDOM from "react-dom";

const noResult =  (
	<div className="entries">
		<p>No entries found</p>
	</div>
);


function Move(props) {
	const arrow = `glyphicon glyphicon-chevron-${props.arrow}`;
	return (
		<span className="down-button">
			<span className={arrow} aria-hidden="true"></span>
		</span>
	);
}

function Edit(props) {
	return (	
		<span className="trash-button" onClick={() => props.onClick()}>
			<span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
		</span>
	);
}


function Trash(props) {
	const data = {id: props.id, text: props.text};
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
		this.state = {value: this.props.text};
		this.updateValue = this.updateValue.bind(this);
		this.submit = this.submit.bind(this);
	}

	updateValue(event) {
		this.setState({value: event.target.value});
	}

	submit(event) {
		const data = {
			id: this.props.id, 
			text: this.props.text,
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
					   autoFocus="true">
				</input>
			</form>
		);
	}

}

class App extends React.Component {
	constructor() {
		super();
		this.state = {numEntries: 0};
	}

	apiRequest(method, data, callback) {
		const xhr = new XMLHttpRequest;
		xhr.open(method, 'http://192.168.1.6:8000/todo', true);
		if (!(method === 'GET')) { 
			xhr.setRequestHeader('Content-Type', 'application/json'); 
		}
		xhr.onreadystatechange = () => { 
			if (xhr.readyState === 4 && xhr.status === 200) {
				callback(xhr);
			}
		};
		xhr.onerror = () => console.log(xhr.statusText);
		xhr.send(data);
	}

	getEntries() {
		this.apiRequest('GET', null, (xhr) => {
			this.result = JSON.parse(xhr.responseText);
			this.result.forEach((entry) => {
				const openKey = `isOpen${entry.id}`;
				const modifyKey = `modify${entry.id}`;
				this.setState({[openKey]: false});
				this.setState({[modifyKey]: false});
			});
			this.setState({numEntries: this.result.length});
		});
	}

	updateEntry(method, data) {
		data = JSON.stringify(data);
		this.apiRequest(method, data, () => { 
			if (method === 'DELETE') {
				this.shiftEntries(JSON.parse(data).id);
			} else {
				this.getEntries();
			}
		});
	}

	shiftEntries(id) {
		const numAfter = this.state.numEntries - id;
		if (numAfter > 0) {
			let idArray = Array.from(Array(numAfter).keys());  // populate array of numAfter length
			idArray = idArray.map(i => { return i + id + 1 }); // add id + 1 (given 0 index)
			const data = {idArray: JSON.stringify(idArray)};
			this.updateEntry('PUT', data);
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
				{this.result.map(entry => {
					const openKey = `isOpen${entry.id}`;
					const modifyKey = `modify${entry.id}`;
					return (
						<ul className="entry" key={entry.id} id={entry.id}>
							{this.state[modifyKey] ? 
								<ModifyForm id={entry.id} text={entry.text} 
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
				<Move arrow="up" />
				<Move arrow="down" />
				<Edit onClick={() => this.modifyText(entry.id)}/>
				<Trash id={entry.id} text={entry.text} 
					   onClick={(data) => this.updateEntry('DELETE', data)} />
			</li>
		)
	}

	componentDidMount() {
		this.getEntries();
	}

	render() {
		const notEmpty = this.state.numEntries;
		return (
			<div className="todo-container">
				{notEmpty ? this.renderEntry() : noResult}
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
