import React, { Component } from "react";
import { withRouter } from "react-router";
import { Link } from 'react-router-dom';
import { FormattedMessage } from "react-intl";

class BookCard extends Component {
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
          <small className="text-muted">
            <FormattedMessage
              id="lastUpdatedFooter"
              defaultMessage="Last updated"
            />
            {new Date(this.props.updatedAt).toLocaleDateString()}</small>
        </div>
      </div>
    )
  }
}

export default withRouter(BookCard)