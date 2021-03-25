import React, { Component } from "react";
import { Link } from 'react-router-dom';
import { Toast } from "react-bootstrap"
import axios from "axios";

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
	};

	handleInputChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value,
		});
	};

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
					<h3 className="mb-3 mt-5 text-center">Sign In</h3>
					<div className="container">
						<div className="row mb-3 mt-5 justify-content-center">
							<label className="form-label">Username</label>
							<input type="text" className="col-6 ml-3 form-control" name="username" placeholder="Enter username" onChange={this.handleInputChange} />
						</div>
						<div className="row justify-content-center">
							<label className="form-label">Password</label>
							<input type="password" className="col-6 ml-3 form-control" name="password" placeholder="Enter password" onChange={this.handleInputChange} />
						</div>
						<div className="row mt-5 justify-content-center">
							<button type="button" onClick={this.onClickLogin} className="btn btn-outline-primary">Submit</button>
						</div>
					</div>
				{/* </form> */}
				<h3 className="mt-5 text-center">
					<Link to="/register" className="register_link">
						Create an account
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
								Username or password is wrong
							</strong>
						</Toast.Header>
					</Toast>
				</div>
			</div>
		);
	}
}

export default Login;