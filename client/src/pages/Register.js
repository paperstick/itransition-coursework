import React, { Component } from "react";
import axios from "axios";
import { FormattedMessage } from "react-intl";

axios.defaults.withCredentials = true;

class Register extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			email: '',
			password: '',
		};
	}

	handleInputChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value,
		});
	}

	onClickRegister = () => {
		const { username, email, password } = this.state;
		axios.post('/user/register', {
			username,
			email,
			password,
		}).then((response) => {
			console.log(response);
			if (!response.data.message) {
				this.props.handleSuccessfulAuth(response.data);
			}
		});
	};

	render() {
		return (
			<div className="register">
				<form>
					<h3 className="mb-3 text-center">
						<FormattedMessage
							id="signUp"
						/>
					</h3>
					<div className="container">
						<div className="mb-3 mt-5 row justify-content-center">
							<label className="col-2 form-label">
								<FormattedMessage
									id="username"
								/>
							</label>
							<input type="text" className="col-3 form-control" name="username" onChange={this.handleInputChange} />
						</div>

						<div className="mb-3 row justify-content-center">
							<label className="col-2 form-label">
								<FormattedMessage
									id="email"
								/>
							</label>
							<input type="email" className="col-3 form-control" name="email" onChange={this.handleInputChange} />
						</div>

						<div className="row justify-content-center">
							<label className="col-2 form-label">
								<FormattedMessage
									id="password"
								/>
							</label>
							<input type="password" className="col-3 form-control" name="password" onChange={this.handleInputChange} />
						</div>
						<div className="mt-5 row justify-content-center">
							<button type="button" onClick={this.onClickRegister} className="btn btn-outline-primary">Submit</button>
						</div>
					</div>
				</form>
			</div>
		);
	}
}

export default Register;