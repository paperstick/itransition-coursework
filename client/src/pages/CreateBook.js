import React, { Component, Fragment } from "react";
import { Spinner, Form, Row, Col, Button, Accordion, Card, AccordionToggle, AccordionCollapse } from "react-bootstrap";
import { Typeahead, Token } from 'react-bootstrap-typeahead';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { BsPlus, BsX } from "react-icons/bs";
import { withRouter } from "react-router";
import ReactMarkdown from 'react-markdown';
import ReactMde from "react-mde";
import axios from 'axios';
import Select from 'react-select'
import { FormattedMessage } from "react-intl";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import "react-mde/lib/styles/css/react-mde-all.css";

axios.defaults.withCredentials = true;

const unique = (arr) => {
	return [...new Set(arr.map((o) => JSON.stringify(o))),
	].map((string) => JSON.parse(string));
}

const reorder = (list, startIndex, endIndex) => {
	const result = list;
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return resetNames(resetIds(result));
};

const resetIds = list => {
	const resetList = list.map((el, index) => {
		const ID = el;
		ID.chapterId = index + 1;
		return ID;
	})
	return resetList;
};

const resetNames = list => {
	const resetList = list.map((el, index) => {
		const name = el;
		name.chapterName = index + 1;
		return name;
	})
	return resetList;
};

class CreateBook extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editMode: false,
			isLoading: true,
			multiple: true,
			bookId: "",
			tags: [],
			allTags: [],
			genre: "",
			activeNav: "write",
			desc: "",
			title: "",
			author: "",
			authorId: "",
			chapters: [
				{
					chapterId: 1,
					id: '',
					chapterName: '1',
					text: '',
					BookId: '',
				}
			],
		}
		this.createBook = this.createBook.bind(this);
		this.updateBook = this.updateBook.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.addChapter = this.addChapter.bind(this);
		this.deleteChapter = this.deleteChapter.bind(this);
		this.getTags = this.getTags.bind(this);
	}

	openBook() {
		const title = this.props.match.params.bookid;
		this.getTags()
		axios.get('/book/openBook', {
			params: {
				title: title,
			},
		})
			.then((response) => {
				this.setState({
					title: response.data.title,
					bookId: response.data.id,
					tags: response.data.tags,
					genre: response.data.genre,
					desc: response.data.description,
					author: response.data.author,
					authorId: response.data.authorId,
					chapters: response.data.Chapters
				},
					() => {
						if (this.state.chapters && (this.props.role === 'admin' || this.props.user === this.state.author)) {
							this.state.chapters.map((chapter) => {
								delete chapter['createdAt'];
								delete chapter['updatedAt'];
								return chapter;
							})
							this.setState({ isLoading: false })
						} else {
							this.props.history.push("/");
						}
					})
			});
	};

	onDragEnd(result) {
		if (!result.destination) {
			return;
		}
		const chapters = reorder(
			this.state.chapters,
			result.source.index,
			result.destination.index
		);

		this.setState({ chapters: chapters });
	}

	handleValueChange = (e, index) => {
		const chapters = this.state.chapters;
		chapters[index].text = e;
		this.setState({ chapters });
		/*this.setState(prevState => ({
			chapters: {
				...prevState.chapters,
				[prevState.chapters[index].text]: e,
			},
		}));*/
	};

	handleTabChange = activeTab => {
		this.setState({ activeTab });
	};

	addChapter() {
		//console.log(this.state.chapters.length)
		const chaptersCount = this.state.chapters.length + 1;
		const chapters = this.state.chapters;
		const chapter = {
			BookId: this.state.bookId,
			chapterId: chaptersCount,
			chapterName: chaptersCount.toString(),
			text: ''
		}
		chapters.push(chapter);
		this.setState({ chapters: chapters });
	}

	deleteChapter = id => {
		const chapters = this.state.chapters.filter((chapter) => chapter.chapterId !== id);
		this.setState({ chapters: chapters });
		if (this.state.editMode) {
			const bookId = this.state.bookId;
			const chapterId = id;
			axios
				.post("/book/deleteChapter", { bookId, chapterId });
		}
	}

	componentDidMount() {
		this.setState({ author: this.props.user, authorId: this.props.userId })
		if (this.props.location.pathname === `/edit/${this.props.match.params.bookid}`) {
			this.setState({ editMode: true }, () => this.openBook())
		} else {
			this.setState({ isLoading: false })
		}
	}

	createBook() {
		const {
			author,
			authorId,
			tags,
			genre,
			desc,
			title,
			chapters
		} = this.state;
		axios.post('/book/createBook', {
			author, authorId, tags, genre, desc, title, chapters
		})
			.then((response) => { });
		this.props.history.push(`/view/${title}`);
	};

	updateBook() {
		const {
			author,
			authorId,
			tags,
			genre,
			desc,
			title,
			bookId,
			chapters
		} = this.state;
		axios.post('/book/updateBook', {
			author, authorId, tags, genre, desc, title, bookId, chapters
		})
			.then((response) => { });
		this.props.history.push(`/view/${title}`);
	};

	getTags() {
		axios.get('/book/getTags')
			.then((response) => {
				response.data.map(tag => {
					if (tag.tags) { (tag.tags.map((entry) => { delete entry['customOption']; this.setState(state => ({ allTags: [...state.allTags, entry] })); return entry })) }
					return tag;
				})
			});
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

		const genres = [
			{
				value: 'fantasy',
				label:
					<FormattedMessage
						id="fantasy"
					/>
			},
			{
				value: 'action',
				label:
					<FormattedMessage
						id="action"
					/>
			},
			{
				value: 'adventure',
				label:
					<FormattedMessage
						id="adventure"
					/>
			},
			{
				value: 'detective',
				label:
					<FormattedMessage
						id="detective"
					/>
			},
			{
				value: 'romance',
				label:
					<FormattedMessage
						id="romance"
					/>
			},
			{
				value: 'sci-fi',
				label:
					<FormattedMessage
						id="sci-fi"
					/>
			},
			{
				value: 'horror',
				label:
					<FormattedMessage
						id="horror"
					/>
			},
			{
				value: 'thriller',
				label:
					<FormattedMessage
						id="thriller"
					/>
			},
			{
				value: 'erotic',
				label:
					<FormattedMessage
						id="erotic"
					/>
			},
		]

		return (
			<>
				<div className="mt-4">
					<Form>
						<Form.Group as={Row}>
							<Form.Label column sm={2}>
								<FormattedMessage
									id="titleViewer"
								/>
							</Form.Label>
							<Col sm={6}>
								<Form.Control
									value={this.state.title}
									onChange={event => { this.setState({ title: event.target.value }) }}
									type="text"
								/>
							</Col>
						</Form.Group>

						<Form.Group as={Row}>
							<Form.Label column sm={2}>
								<FormattedMessage
									id="descViewer"
								/>
							</Form.Label>
							<Col sm={6}>
								<Form.Control
									as="textarea"
									rows={3}
									value={this.state.desc}
									onChange={event => { this.setState({ desc: event.target.value }) }}
									type="text"
								/>
							</Col>
						</Form.Group>

						<Form.Group as={Row}>
							<Form.Label column sm={2}>
								<FormattedMessage
									id="tagsViewer"
								/>
							</Form.Label>
							<Col sm={6}>
								<Fragment>
									<Typeahead
										{...this.state}
										allowNew={true}
										highlightOnlyResult={false}
										newSelectionPrefix={
											<FormattedMessage
												id="addTag"
											/>
										}
										id="tags-token"
										defaultSelected={this.state.tags ? this.state.tags : []}
										options={this.state.allTags.length > 0 ? unique(this.state.allTags) : []}
										labelKey="value"
										onChange={(tags) => this.setState({ tags })}
										renderToken={(option, { onRemove }, index) => {
											return (
												<Token key={index} option={option} onRemove={onRemove}>
													{`${option.value}`}
												</Token>
											);
										}}
									/>
								</Fragment>
							</Col>
						</Form.Group>

						<Form.Group as={Row}>
							<Form.Label column sm={2}>
								<FormattedMessage
									id="genreViewer"
								/>
							</Form.Label>
							<Col sm={6}>
								<Select
									defaultValue={{ value: "default", label: this.state.genre }}
									onChange={(genre) => this.setState({ genre })}
									isSearchable={false}
									options={genres}
								/>
							</Col>
						</Form.Group>
					</Form>

					<Card style={{ maxWidth: '45.5rem' }} onClick={this.addChapter}>
						<Card.Header as={Button} variant="light">
							<BsPlus />
						</Card.Header>
					</Card>

					<DragDropContext onDragEnd={this.onDragEnd}>
						<Droppable droppableId="droppable" >
							{(provided) => (
								<div className="col-xs"
									{...provided.droppableProps}
									ref={provided.innerRef}
								>
									<Accordion>
										{(this.state.chapters).map((tab, index) => (
											<Draggable
												key={tab.chapterId}
												draggableId={tab.chapterId.toString()}
												index={index}
											>
												{(provided) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
													>
														<Card key={index} style={{ maxWidth: '45.5rem' }}>
															<Card.Header style={{ display: 'flex', alignItems: 'center', margin: '0' }}>
																<AccordionToggle as={Button} variant="link" eventKey={tab.chapterId}>
																	{this.state.editMode ? `Chapter ${tab.chapterId}` : `Chapter ${tab.chapterName}`}
																</AccordionToggle>
																{(index + 1 === this.state.chapters.length)
																	? <Button variant="link" onClick={() => { this.deleteChapter(tab.chapterId) }} style={{ marginLeft: 'auto' }}>
																		<BsX />
																	</Button>
																	: null
																}
															</Card.Header>
															<AccordionCollapse eventKey={tab.chapterId}>
																<ReactMde
																	value={this.state.chapters[index].text}
																	onChange={
																		e => {
																			this.handleValueChange(e, index)
																		}
																	}
																	selectedTab={this.state.activeTab}
																	onTabChange={this.handleTabChange}
																	generateMarkdownPreview={(markdown) =>
																		Promise.resolve(<ReactMarkdown source={markdown} />)
																	}
																/>
															</AccordionCollapse>
														</Card>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
									</Accordion>
								</div>
							)}
						</Droppable>
					</DragDropContext>

					<div className="mt-3">
						{this.state.editMode
							? <Button onClick={this.updateBook} variant="outline-success">Update</Button>
							: <Button onClick={this.createBook} variant="outline-success">Publish</Button>
						}
					</div>
				</div>
			</>
		);
	}
}

export default withRouter(CreateBook);