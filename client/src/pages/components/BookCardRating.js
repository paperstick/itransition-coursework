import React, { Component } from "react";
import { withRouter } from "react-router";
import { Link } from 'react-router-dom';
import ReactStars from "react-rating-stars-component";

class BookCardRating extends Component {
  render() {
    return (
      <div className="card border-info mb-3 mt-3">
        <div className="card-body text-info">
          <Link to={`/view/${this.props.title}`}>
            <h3 className="card-text" >{this.props.title}</h3>
          </Link>
          <Link to={`/profile/${this.props.author}`}>
            <small className="text-muted">{this.props.author}</small>
          </Link>
          <p className="card-text">{this.props.description}</p>
        </div>
        <div className="card-footer">
          <div className="row d-flex">
            <div className="col-md-4">
            <ReactStars
              value={this.props.rating}
              edit={false}
              count={5}
              isHalf={true}
              size={18}
              activeColor="#ffd700"
            />
            </div>
            <div className="offset-col-md-4 small text">
              {this.props.rating.toPrecision(2)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(BookCardRating)