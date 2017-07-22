import React from "react";
import ReactDOM from "react-dom";

const noResult =  (
	<div className="entries">
		<p>No entries found</p>
	</div>
);

function Up() {
	return (
		<span className="up-button">
			<span className="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>
		</span>
	);
}

function Down() {
	return (
		<span className="down-button">
			<span className="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
		</span>
	);
}

function Trash(props) {
	return (
		<span className="trash-button" onClick={() => props.onClick(props.id, props.text)}>
			<span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
		</span>
	);
}

class Add extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			text: ''
		};

		this.toggleOpen = this.toggleOpen.bind(this);
		this.updateValue = this.updateValue.bind(this);
		this.submit = this.submit.bind(this);
	}

	toggleOpen() {
		this.setState({isOpen: !this.state.isOpen});
	}

	updateValue(event) {
		this.setState({text: event.target.value});
	}

	submit(event) {
		this.props.onSubmit(this.props.id + 1, this.state.text);
		this.setState({isOpen: false});
		event.preventDefault();
	}

	renderForm() {
		return(
			<form className="add-form" onSubmit={this.submit}>
				<input className="add-form-input"
				placeholder="write new entry..."
				value={this.state.value}
				onChange={this.updateValue}>
				</input>
			</form>
		)
	}

	render() {
		return (
			<div className="add">
				<div className="add-button" onClick={this.toggleOpen}>
					<span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
				</div>
				{this.state.isOpen ? this.renderForm() : <div/>}
			</div>
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
		xhr.open(method, 'http://localhost:8000/todo', true);
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
			this.setState({numEntries: this.result.length});
		});
	}

	updateEntry(method, id, text) {
		const data = JSON.stringify({"id": id, "text": text});
		this.apiRequest(method, data, () => { this.getEntries(); });
	}

	componentDidMount() {
		this.getEntries();
	}

	renderEntry() {
		return (
			<div className="entries">
				{this.result.map(entry => {
					return (
						<ul className="entry" key={entry.id}>
							<li className="text">{entry.text}</li>
							<li className="buttons">
								<Up />
								<Down />
								<Trash id={entry.id} text={entry.text} 
									onClick={(id, text) => this.updateEntry('DELETE', id, text)} />
							</li>
						</ul>
					);
				})}
			</div>
		);
	}

	render() {
		const notEmpty = this.state.numEntries;
		return (
			<div className="todo-container">
				{notEmpty ? this.renderEntry() : noResult}
				<Add id={this.state.numEntries} 
					 onSubmit={(id, text) => this.updateEntry('POST', id, text)}/>
			</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.querySelector('#app')
)
