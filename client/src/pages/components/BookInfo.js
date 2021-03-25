import React, { Component } from "react";

class BookInfo extends Component {
  render() {
    return (
      <div className="row mt-1">
        <div className="p-1 mr-5">
          {this.props.label}
        </div>
        <div>
          {this.props.value}
        </div>
      </div>
    )
  }
}

export default BookInfo