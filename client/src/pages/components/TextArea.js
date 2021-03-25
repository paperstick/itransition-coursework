import React, { Component } from "react";
import { Form, Row, Col, } from "react-bootstrap";

class TextArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
    }
  }

  handleChange = e => {
    this.setState({ text: e.target.value }, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state.text);
      }
    })
  };

  componentDidMount() {
    this.setState({ text: this.props.text })
  }

	render() {
		return (
      <Form.Group as={Row}>
        <Col>
          <Form.Control 
            as="textarea" 
            rows={3}
            value={this.state.text}
            onChange={this.handleChange}
            type="text"
          />
        </Col>
      </Form.Group>
    );
  }
}
  
export default TextArea;