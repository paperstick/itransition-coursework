import React, { Component } from "react";
import BookCard from "./BookCard";
import { Spinner } from "react-bootstrap";

class Search extends Component {
  constructor() {
    super();
    this.state = {
      book: undefined
    }
    this.getBook = this.getBook.bind(this)
  }

  getBook(dataset, idx) {
    this.setState({ book: dataset.find(data => data.id === parseInt(idx)) },
    () => this.setState({ isLoading: false }))
  }

  componentDidMount() {
    this.getBook(JSON.parse(localStorage.getItem('books')), this.props.result.ref)
  }

  render() {
		if (!this.state.book) {
    return  <div>
				<Spinner animation="border" role="status">
					<span className="sr-only">Loading...</span>
				</Spinner>
			</div>;
		}
    const { book } = this.state
    return (
      <BookCard
        key={book.id}
        title={book.title}
        description={book.description}
        author={book.author}
        updatedAt={book.updatedAt}
      />
    )
  }
}

export default Search