import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Users from './pages/Users.js';
import Profile from './pages/Profile.js';
import CreateBook from './pages/CreateBook.js';
import BookViewer from './pages/BookViewer.js';
import BookCard from "./pages/components/BookCard";
import LoginRoute from './LoginRoute.js';
import Search from "./pages/components/Search";
import axios from "axios";
import { withRouter } from "react-router";
import { Navbar, Nav, Button, FormControl, ListGroup, Toast, Spinner, InputGroup } from "react-bootstrap";

/* LUNR SETUP */
const lunr = require("lunr")
require("lunr-languages/lunr.stemmer.support")(lunr)
require('lunr-languages/lunr.multi')(lunr)
require("lunr-languages/lunr.ru")(lunr)
const englishRussianSupport = lunr.multiLanguage('en', 'ru');

axios.defaults.withCredentials = true;

class App extends Component {
	constructor() {
		super();
		this.state = {
			search: '',
			alert: {
				login: false,
				logout: false,
			},
			user: {
				id: undefined,
				username: undefined,
				email: undefined,
				role: undefined,
			},
			isLoading: true,
			chapters: [],
			comments: [],
			//searchResult: [],
			//books: []
		}
		this.handleLogin = this.handleLogin.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
		this.handleSuccessfulAuth = this.handleSuccessfulAuth.bind(this);
		this.getBooks = this.getBooks.bind(this);
		this.getTags = this.getTags.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
	}

	handleSuccessfulAuth(data) {
		this.handleLogin(data);
	}

	handleLogout() {
		this.showLogoutAlert();
		this.setState({
			user: {
				id: undefined,
				username: undefined,
				email: undefined,
				role: undefined
			}
		})
		this.props.history.push("/");
	}

	showLogoutAlert() {
		this.setState(prevState => ({
			alert:
			{
				...prevState.alert,
				logout: true
			}
		}))
	}

	handleLogoutClick() {
		axios.get('/user/logout')
			.then((response) => {
				this.handleLogout();
			});
	}

	showLoginAlert() {
		this.setState(prevState => ({
			alert:
			{
				...prevState.alert,
				login: true
			}
		}))
	}

	handleLogin(data) {
		this.showLoginAlert();
		this.setState({
			user: {
				id: data.id,
				username: data.username,
				email: data.email,
				role: data.role
			}
		}, () => this.props.history.push({
			pathname: "/users",
			state: { user: this.state.user }
		}))
	}

	async getBooks() {
		axios
			.get("/book/allBooks")
			.then(response => {
				//this.setState({ books: response.data }, () => this.setState({ isLoading: false }));
				localStorage.setItem('books', JSON.stringify(response.data))
			})
			.then(() => this.setState({ isLoading: false }));
	}

	getUserData() {
		axios
			.get("/user/userData")
			.then(response => {
				// console.log('getUserData:', response)
				if (response.data.status !== 'error') {
					this.setState({
						user: {
							id: response.data.id,
							username: response.data.username,
							email: response.data.email,
							role: response.data.role
						}
					});
				}
			})
	}

	getTags() {
		axios.get('/book/getTags')
		.then((response) => {
			response.data.map(tag => {
				(tag.tags.map((entry) => { delete entry['customOption']; this.setState(state => ({ allTags: [...state.allTags, entry] })); return entry }));
				return tag;
			})
		});
	}

	handleInputChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value,
		});
	};

	handleSearch() {
		const { search } = this.state
		if (search) {
			axios
				.get("/book/allComments")
				.then(response => {
					localStorage.setItem('comments', JSON.stringify(response.data))
				});
			axios
				.get("/book/allChapters")
				.then(response => {
					localStorage.setItem('chapters', JSON.stringify(response.data))
				});
			const idx = lunr(function () {
				this.use(englishRussianSupport)
				this.ref('id')
				this.field('author')
				this.field('title')
				this.field('description')
				this.field('text')
				JSON.parse(localStorage.getItem('books')).map(book => (
					this.add({
						id: book.id,
						title: book.title,
						author: book.author,
						description: book.description,
					})
				))
				JSON.parse(localStorage.getItem('comments')).map(comment => (
					this.add({
						id: comment.BookId,
						text: comment.text,
					})
				))
				JSON.parse(localStorage.getItem('chapters')).map(chapter => (
					this.add({
						id: chapter.BookId,
						chapter: chapter.text,
					})
				))
			})
			localStorage.setItem('searchResult', JSON.stringify(idx.search(search)))
			this.props.history.replace({ pathname: `/search/${this.state.search}` })
		}
	}

	componentDidMount() {
		this.getUserData();
		this.getBooks();
	}

	render() {
		const { isLoading } = this.state;

		if (isLoading) {
			return <div>
				<Spinner animation="border" role="status">
					<span className="sr-only">Loading...</span>
				</Spinner>
			</div>;
		}

		return (
			<>
				<Navbar collapseOnSelect sticky="top" expand="sm" bg="light" variant="light">
					<Navbar.Brand href="/" ><h3>Mordor</h3></Navbar.Brand>
					<Navbar.Toggle aria-controls="responsive-navbar-nav" />
					<Navbar.Collapse id="responsive-navbar-nav">
						<Nav className="mr-auto">
							{this.state.user && this.state.user.role === 'admin'
								? <Nav.Link href="/users">
									<Button variant="outline-primary">
										Users
									</Button>
								</Nav.Link>
								: null
							}
							<Nav.Link href="/books">
								<Button variant="outline-primary">
									Fandoms
									</Button>
							</Nav.Link>
						</Nav>
						{this.state.user && this.state.user.username
							? <Nav className="ml-auto">
								<Nav.Link>
									<Button onClick={() => this.props.history.replace({ pathname: `/profile/${this.state.user.username}`, state: { user: this.state.user } })} variant="primary">
										Profile
										</Button>
								</Nav.Link>
								<Nav.Link>
									<Button onClick={this.handleLogoutClick} variant="outline-primary">
										Logout
										</Button>
								</Nav.Link>
							</Nav>
							: <Nav.Link href="/login">
								<Button variant="outline-primary">
									Login
									</Button>
							</Nav.Link>
						}
					</Navbar.Collapse>
					<div className="ml-lg-2 ml-md-2 ml-sm-2">
						<InputGroup>
							<FormControl type="text" placeholder="Search" name="search" onChange={this.handleInputChange} />
							<InputGroup.Prepend>
								<Button variant="outline-info" onClick={this.handleSearch}>Search</Button>
							</InputGroup.Prepend>
						</InputGroup>
					</div>
				</Navbar>
				<div className="container">
					<Switch>
						<Route exact path="/" render={props =>
							<Home {...props}
								books={this.state.books}
							/>
						} />
						<Route path="/profile/:id" render={props =>
							<Profile {...props}
								books={JSON.parse(localStorage.getItem('books'))} //change later
								role={this.state.user.role}
							/>
						} />
						<Route path="/view/:bookid" render={props =>
							<BookViewer {...props}
								user={this.state.user.username}
								userId={this.state.user.id}
							/>
						} />
						<Route path="/edit/:bookid" render={props => {
							if (this.state.user.username) {
								return <CreateBook {...props}
									role={this.state.user.role}
									user={this.state.user.username}
									userId={this.state.user.id} />
							} else {
								return (
									<Redirect to="/" />
								);
							}
						}} />
						<Route path="/createBook" render={props => {
							if (this.state.user.username) {
								return <CreateBook {...props}
									user={this.state.user.username}
									userId={this.state.user.id} />
							} else {
								return (
									<Redirect to="/" />
								);
							}
						}} />
						<LoginRoute path="/login" component={Login}
							handleSuccessfulAuth={this.handleSuccessfulAuth}
							handleLogin={this.handleLogin}
							user={this.state.user.username}
						/>
						<Route path="/register" render={props => (
							<Register {...props}
								handleSuccessfulAuth={this.handleSuccessfulAuth}
								handleLogin={this.handleLogin}
							/>
						)} />
						<Route path="/users" render={props => {
							if (this.state.user.role === 'admin') {
								return <Users {...props}
									user={this.state.user.username}
									userId={this.state.user.id} />
							} else {
								return (
									<Redirect to="/" />
								);
							}
						}} />
						<Route path="/books" render={props => (
							<ListGroup>
								{JSON.parse(localStorage.getItem('books')).map((book, index) => (
									<div key={index}>
										<BookCard {...props}
											key={book.id}
											title={book.title}
											description={book.description}
											author={book.author}
											updatedAt={book.updatedAt}
										/>
									</div>
								))}
							</ListGroup>
						)} />
						<Route path="/search" render={props => (
							<ListGroup>
								{JSON.parse(localStorage.getItem('searchResult')).length > 0
									? JSON.parse(localStorage.getItem('searchResult')).map((result, index) => (
										<div key={index}>
											<Search {...props}
												result={result}
												index={index}
												comments={this.state.comments}
												chapters={this.state.chapters}
											/>
										</div>
									))
									: <div>
										<h3 className="mt-5 text-center">
											No search results found.
											</h3>
									</div>
								}
							</ListGroup>
						)} />
						<Route path="*" component={() => <h3 className="text-center">404 NOT FOUND</h3>} />
					</Switch>
					<div>
						<Toast
							style={{
								position: 'absolute',
								top: 100,
								right: 40,
							}}
							show={this.state.alert.logout}
							onClose={() => {
								this.setState(prevState => ({
									alert:
									{
										...prevState.alert,
										logout: false
									}
								}))
							}}
							delay={3000}
							autohide
						>
							<Toast.Header>
								<strong>
									You logged out
								</strong>
							</Toast.Header>
						</Toast>
					</div>
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
							delay={3000}
							autohide
						>
							<Toast.Header>
								<strong>
									{this.state.user.username} logged in
								</strong>
							</Toast.Header>
						</Toast>
					</div>
				</div>
			</>
		);
	}
}

export default withRouter(App);