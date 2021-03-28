import React, { Component } from "react";
import { Spinner, Button, Pagination, Container, Badge } from "react-bootstrap";
import ReactMarkdown from 'react-markdown';
import ReactStars from "react-rating-stars-component";
import axios from 'axios';
import BookInfo from "./components/BookInfo";
import CommentsSection from "./components/CommentsSection";
import { withRouter } from "react-router";
import { FormattedMessage } from "react-intl";
import "react-mde/lib/styles/css/react-mde-all.css";

axios.defaults.withCredentials = true;

class BookViewer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: true,
			book: [],
			rating: undefined,
			activePage: "",
			editable: true,
			comments: false,
		}
		this.setRating = this.setRating.bind(this);
		this.setRatingBook = this.setRatingBook.bind(this);
		this.setActivePage = this.setActivePage.bind(this);
		this.pushChapters = this.pushChapters.bind(this);
		this.isRated = this.isRated.bind(this);
	}

	componentDidMount() {
		if (this.props.user === undefined) {
			this.setState({ editable: false });
		}
		this.openBook()
	}

	isRated() {
		const bookId = this.state.book.id;
		const authorId = this.props.userId;
		axios.get('/book/isRated', {
			params: {
				authorId, bookId
			}
		})
			.then((response) => {
				console.log(response)
				if (response.data.message) {
					this.setState({ editable: false },
						() => this.setState({ isLoading: false }))
				} else {
					this.setState({ isLoading: false })
				}
			});
	}

	async openBook() {
		const title = this.props.match.params.bookid;
		await axios.get('/book/openBook', {
			params: {
				title: title,
			}
		})
			.then((response) => {
				this.setState({ book: response.data },
					(() => { if (this.props.user) { this.isRated() } else { this.setState({ isLoading: false }) } }))
			})
			.catch(err => console.log(err));
	};

	setActivePage(index) {
		this.setState({ activePage: index });
	}

	pushChapters = () => {
		let chapters = [];
		if (this.state.book.Chapters) {
			this.state.book.Chapters
				.sort((a, b) => {
					if (a.chapterId > b.chapterId) {
						return 1;
					}
					if (a.chapterId < b.chapterId) {
						return -1;
					}
					return 0;
				})
				.map((chapter, index) => {
					chapters.push(
						<Pagination.Item onClick={() => { this.setActivePage(index); this.setState({ comments: false }) }} key={index}>{index + 1}</Pagination.Item>
					)
					return chapters
				})
		}
		return chapters;
	}

	setRating(value) {
		if (this.props.user) {
			this.setState({
				rating: value
			})
		} else {
			console.log("You have to login to set a rating.")
		}
	}

	setRatingBook() {
		if (this.props.user) {
			const author = this.props.user;
			const bookId = this.state.book.id;
			const rating = this.state.book.rating;
			const authorId = this.props.userId;
			const ratingCount = this.state.book.ratingCount;
			axios.post('/book/setRating', {
				author, authorId, bookId, rating, ratingCount
			})
				.then((response) => {
					console.log(response);
				});
		} else {
			console.log('You have to login to set a rating.')
		}
	};

	render() {
		const { isLoading } = this.state;
		if (isLoading) {
			return <div>
				<Spinner animation="border" role="status">
					<span className="sr-only">Loading...</span>
				</Spinner>
			</div>;
		}

		if (!this.state.book) {
			return <div>
				<h3 className="mt-5 text-center">
					<FormattedMessage
						id="noBook"
					/>
				</h3>
			</div>
		}

		return (
			<>
				<Container className="container">
					<BookInfo
						label={
							<FormattedMessage
								id="titleViewer"
							/>
						}
						value={this.state.book.title}
					/>
					<BookInfo
						label={
							<FormattedMessage
								id="authorViewer"
							/>
						}
						value={this.state.book.author}
					/>
					<BookInfo
						label={
							<FormattedMessage
								id="descViewer"
							/>
						}
						value={this.state.book.description}
					/>
					<BookInfo
						label={
							<FormattedMessage
								id="genreViewer"
							/>
						}
						value={this.state.book.genre}
					/>
					<div className="row mt-1">
						<div className="p-1 mr-5">
							<FormattedMessage
								id="tagsViewer"
							/>
						</div>
						{this.state.book.tags
							? this.state.book.tags.map((tag, index) => {
								return (<Badge key={index} className="mr-2 p-2" variant="secondary">
									{tag.value}
								</Badge>)
							})
							: null
						}
					</div>
					<div className="row mt-1">
						<div className="p-1 mr-5">
							<FormattedMessage
								id="ratingViewer"
							/>
						</div>
						<ReactStars
							value={this.state.book.rating / this.state.book.ratingCount}
							count={5}
							edit={(this.props.user && this.state.editable) ? true : false}
							onChange={this.setRating}
							isHalf={true}
							size={24}
							activeColor="#ffd700"
						/>
						<span className="ml-3 mt-2">{this.state.book.rating ? (this.state.book.rating / this.state.book.ratingCount).toPrecision(2) : 0}</span>
						<Button
							className="ml-3 p-1"
							onClick={
								() => this.setState(prevState => ({
									book:
									{
										...prevState.book,
										rating: this.state.editable ? prevState.book.rating + this.state.rating : prevState.book.rating,
										ratingCount: this.state.editable ? prevState.book.ratingCount + 1 : prevState.book.ratingCount,
									},
									editable: false
								}), () => this.setRatingBook())
							}
							variant="outline-success"
						>
							<FormattedMessage
								id="setRatingViewer"
							/>
						</Button>
					</div>
					<div className="row mt-1">
						<div className="p-1 mr-5">
							<FormattedMessage
								id="chaptersViewer"
							/>
						</div>
						<Pagination>
							{this.pushChapters()}
							<Pagination.Item onClick={() => { this.setState(prevState => ({ comments: prevState.comments === false ? true : false })) }}>
								<FormattedMessage
									id="commentsViewer"
								/>
							</Pagination.Item>
						</Pagination>
					</div>
					{this.state.comments
						? <CommentsSection
							username={this.props.user}
							userId={this.props.userId}
							bookId={this.state.book.id}
						/>
						: null
					}
					{this.state.activePage !== ""
						? <div className="row mt-5 ">
							<ReactMarkdown>
								{this.state.book.Chapters[parseInt(this.state.activePage)].text}
							</ReactMarkdown>
						</div>
						: null}
				</Container>
			</>
		);
	}
}

export default withRouter(BookViewer);