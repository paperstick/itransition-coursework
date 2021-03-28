import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Toast } from "react-bootstrap"
import axios from "axios";
import { FormattedMessage } from "react-intl";

axios.defaults.withCredentials = true;

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			alert: {
				login: false
			}
		};
		this.onClickLogin = this.onClickLogin.bind(this);
		this.onClickLoginTwitter = this.onClickLoginTwitter.bind(this);
		this.onClickLoginVK = this.onClickLoginVK.bind(this);
		this.onClickLoginGoogle = this.onClickLoginGoogle.bind(this);
	};

	handleInputChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value,
		});
	};

	onClickLoginTwitter() {
		window.location.href = 'https://itransition-coursework.herokuapp.com/user/auth/twitter/callback'
	}

	onClickLoginVK() {
		window.location.href = 'https://itransition-coursework.herokuapp.com/user/auth/vkontakte/callback'
	}

	onClickLoginGoogle() {
		window.location.href = 'https://itransition-coursework.herokuapp.com/user/auth/google/callback'
	}

	onClickLogin() {
		const { username, password } = this.state;
		axios.post('user/login', {
			username,
			password,
		}).then((response) => {
			if (!response.data.message) {
				console.log(response.data)
				this.props.handleSuccessfulAuth(response.data);
			} else {
				this.setState(prevState => ({
					alert:
					{
						...prevState.alert,
						login: true
					}
				}))
			}
		});
	};

	render() {
		return (
			<div className="login">
				{/* <form> */}
				<h3 className="mb-3 mt-5 text-center">
					<FormattedMessage
						id="signIn"
					/>
				</h3>
				<div className="container">
					<div className="row mb-3 mt-5 justify-content-center">
						<label className="form-label">
							<FormattedMessage
								id="username"
							/>
						</label>
						<input type="text" className="col-6 ml-3 form-control" name="username" onChange={this.handleInputChange} />
					</div>
					<div className="row justify-content-center">
						<label className="form-label">
							<FormattedMessage
								id="password"
							/>
						</label>
						<input type="password" className="col-6 ml-3 form-control" name="password" onChange={this.handleInputChange} />
					</div>
					<div className="row mt-5 justify-content-center">
						<button type="button" onClick={this.onClickLogin} className="btn btn-outline-primary">
							<FormattedMessage
								id="logIn"
							/>
						</button>
					</div>
					<div className="row mt-5 justify-content-center">
						<button type="button" onClick={this.onClickLoginTwitter} className="btn btn-primary">
							<FormattedMessage
								id="logInTwitter"
							/>
						</button>
						<button type="button" onClick={this.onClickLoginVK} className="ml-2 btn btn-info">
							<FormattedMessage
								id="logInVK"
							/>
						</button>
						<button type="button" onClick={this.onClickLoginGoogle} className="ml-2 btn btn-danger">
							<FormattedMessage
								id="logInGoogle"
							/>
						</button>
					</div>
				</div>
				<h3 className="mt-5 text-center">
					<Link to="/register" className="register_link">
						<FormattedMessage
							id="createAccount"
						/>
					</Link>
				</h3>
				<div>
					<Toast
						style={{
							position: 'absolute',
							top: 100,
							right: 40,
						}}
						show={this.state.alert.login}
						onClose={() => {
							this.setState(prevState => ({
								alert:
								{
									...prevState.alert,
									login: false
								}
							}))
						}}
						delay={2000}
						autohide
					>
						<Toast.Header>
							<strong>
								<FormattedMessage 
									id="wrongInfo"
								/>
							</strong>
						</Toast.Header>
					</Toast>
				</div>
			</div>
		);
	}
}

export default Login;