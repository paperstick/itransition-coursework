import React, { Component } from "react";
import BookCard from "./components/BookCard";
import BookCardRating from "./components/BookCardRating";
import { TagCloud } from 'react-tagcloud'
import axios from "axios"

const unique = (arr) => {
	return [...new Set(arr.map((o) => JSON.stringify(o))),
	].map((string) => JSON.parse(string));
}

class Home extends Component {
  constructor() {
		super();
		this.state = {
      allTags: [],
    }
    this.getTags = this.getTags.bind(this)
  }

  componentDidMount() {
    this.getTags()
  }

  getTags() {
		axios.get('/book/getTags')
		.then((response) => {
			response.data.map(tag => {
				if(tag.tags) {(tag.tags.map((entry) => { delete entry['customOption']; this.setState(state => ({ allTags: [...state.allTags, entry] })); return entry }))}
				return tag; 
			})
		});
	}

  render() {
    return (
      <>
        <div className="container mt-3">
          <div className="row xl-3">
            <div name="recent" className="col">
              <h3>Recently updated</h3>
              {JSON.parse(localStorage.getItem('books'))
                .filter(book => new Date(book.updatedAt) > (new Date(Date.now() - 7 * 3600 * 1000 * 24)))
                .sort()
                .reverse()
                .map((book, index) => (
                  <BookCard
                    key={book.id}
                    title={book.title}
                    description={book.description}
                    author={book.author}
                    updatedAt={book.updatedAt}
                  />
                ))}
            </div>
            <div name="top" className="col">
              <h3>Top fandoms of the week</h3>
              {JSON.parse(localStorage.getItem('books'))
                .slice(0, 5)
                .filter(book => new Date(book.createdAt) > (new Date(Date.now() - 7 * 3600 * 1000 * 24)))
                .sort((a, b) => (b.rating - a.rating))
                .map((book, index) => (
                  <BookCardRating
                    key={book.id}
                    title={book.title}
                    description={book.description}
                    author={book.author}
                    rating={book.ratingCount ? (book.rating / book.ratingCount) : 0}
                  />
                ))
              }
            </div>
            <div name="tags" className="col">
              <h3>Tags</h3>
              <TagCloud
                minSize={16}
                maxSize={48}
                tags={unique(this.state.allTags)}
                //onClick={tag => alert(`${tag.value} was selected!`)}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default Home