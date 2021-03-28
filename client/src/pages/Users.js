import React, { Component } from "react";
import axios from "axios";
import BootstrapTable from 'react-bootstrap-table-next';
import { withRouter, Link } from "react-router-dom";
import { Alert } from 'react-bootstrap';
import { FormattedMessage } from "react-intl";

axios.defaults.withCredentials = true;

class Users extends Component {
	constructor(props) {
		super(props)

		this.state = {
			users: [],
			selectedRows: [],
			alert: {
				block: false,
				unblock: false,
				delete: false
			},
		}

		this.blockUsers = this.blockUsers.bind(this);
		this.unblockUsers = this.unblockUsers.bind(this);
		this.deleteUsers = this.deleteUsers.bind(this);
		this.getData = this.getData.bind(this);
		this.showBlockAlert = this.showBlockAlert.bind(this);
		this.showUnblockAlert = this.showUnblockAlert.bind(this);
		this.showDeleteAlert = this.showDeleteAlert.bind(this);
	}

	async getData() {
		await new Promise(resolve => setTimeout(resolve, 200));
		let data = [];
		data = await axios.get('/user/usersTable')
			.then(response => {
				return response.data;
			})
			.catch(err => {
				console.log(err);
				this.props.history.push('/');
			});
		this.setState({ users: data });
	}

	componentDidMount() {
		this.getData();
	}

	showBlockAlert() {
		this.setState(prevState => ({
			alert:
			{
				...prevState.alert,
				block: true
			}
		}))
		setTimeout(() => {
			this.setState(prevState => ({
				alert:
				{
					...prevState.alert,
					block: false
				}
			}))
		}, 2000);
	}

	showUnblockAlert() {
		this.setState(prevState => ({
			alert:
			{
				...prevState.alert,
				unblock: true
			}
		}))
		setTimeout(() => {
			this.setState(prevState => ({
				alert:
				{
					...prevState.alert,
					unblock: false
				}
			}))
		}, 2000);
	}

	showDeleteAlert() {
		this.setState(prevState => ({
			alert:
			{
				...prevState.alert,
				delete: true
			}
		}))
		setTimeout(() => {
			this.setState(prevState => ({
				alert:
				{
					...prevState.alert,
					delete: false
				}
			}))
		}, 2000);
	}

	blockUsers() {
		const selectedRows = this.state.selectedRows;
		axios.post('/table/block', {
			selectedRows,
		})
			.then((response) => {
				if (response) {
					if (selectedRows.includes(parseInt(this.props.userId))) {
						this.handleLogoutClick();
					}
					else {
						this.showBlockAlert();
						this.getData();
					}
				}
			})
	};

	unblockUsers() {
		const selectedRows = this.state.selectedRows;
		axios.post('/table/unblock', {
			selectedRows,
		})
			.then((response) => {
				if (response) {
					this.showUnblockAlert();
					this.getData();
				}
			});
	};

	deleteUsers() {
		const selectedRows = this.state.selectedRows;
		axios.post('/table/delete', {
			selectedRows,
		}).then((response) => {
			if (response) {
				if (selectedRows.includes(parseInt(this.props.userId))) {
					this.handleLogoutClick();
				}
				else {
					this.showDeleteAlert();
					this.getData();
				}
			}
		});
	};

	render() {
		const columns = [
			{
				"dataField": "id",
				"text": "ID"
			},
			{
				"dataField": "username",
				"text":
					<FormattedMessage
						id="usernameTable"
					/>,
				"formatter": (cell, row) => <Link to={`/profile/${cell}`}> {cell} </Link>
			},
			{
				"dataField": "email",
				"text":
					<FormattedMessage
						id="emailTable"
					/>,
			},
			{
				"dataField": "createdAt",
				"text":
					<FormattedMessage
						id="registrationDate"
					/>,
				"formatter": (cell, row) => new Date(cell).toLocaleDateString()
			},
			{
				"dataField": "role",
				"text":
					<FormattedMessage
						id="roleTable"
					/>,
			},
			{
				"dataField": "status",
				"text":
					<FormattedMessage
						id="statusTable"
					/>
			}
		]

		return (
			<div className="container mt-3">
				<Alert show={this.state.alert.block} variant="danger">
					<p>
						<FormattedMessage
							id="blockAlert"
						/>
					</p>
				</Alert>
				<Alert show={this.state.alert.unblock} variant="danger">
					<p>
						<FormattedMessage
							id="unblockAlert"
						/>
					</p>
				</Alert>
				<Alert show={this.state.alert.delete} variant="danger">
					<p>
						<FormattedMessage
							id="deleteAlert"
						/>
					</p>
				</Alert>
				<div className="btn-group mb-3" role="group">
					<button onClick={this.blockUsers} type="button" className="btn btn-outline-primary">
						<FormattedMessage
							id="blockButton"
						/>
					</button>
					<button onClick={this.unblockUsers} type="button" className="btn btn-outline-primary">
						<FormattedMessage
							id="unblockButton"
						/>
					</button>
					<button onClick={this.deleteUsers} type="button" className="btn btn-outline-danger">
						<FormattedMessage
							id="deleteButton"
						/>
					</button>
				</div>
				<BootstrapTable
					keyField='id'
					noDataIndication="Table is Empty"
					data={this.state.users}
					columns={columns}
					hiddenRows={[5]} //Admin ID
					wrapperClasses="table-responsive"
					selectRow={{
						mode: 'checkbox',
						clickToSelect: true,
						onSelectAll: (row, rows, isSelect) => {
							if (row) {
								for (let r of rows) {
									this.setState(prevState => ({
										selectedRows: [...prevState.selectedRows, r.id]
									}))
								}
							} else {
								this.setState({ selectedRows: [] });
							}
						},
						onSelect: (row, isSelect) => {
							if (isSelect) {
								this.setState(prevState => ({
									selectedRows: [...prevState.selectedRows, row.id]
								}))
							} else {
								this.setState({
									selectedRows: this.state.selectedRows.filter(function (selectedRows) {
										return selectedRows !== row.id
									})
								})
							}
						}
					}}
				/>
			</div>
		)
	}
}

export default withRouter(Users);