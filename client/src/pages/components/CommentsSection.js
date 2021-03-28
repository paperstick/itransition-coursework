import React, { Component } from "react";
import { withRouter } from "react-router";
import { Comment, Form, Button } from 'semantic-ui-react'
import { FormattedMessage } from "react-intl";
import 'semantic-ui-css/components/comment.min.css'
import 'semantic-ui-css/components/form.min.css'
import 'semantic-ui-css/components/button.min.css'
import 'semantic-ui-css/components/icon.min.css'

class CommentsSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      comment: ''
    };
  }

  // ws = new WebSocket(`ws://${process.env.ORIGINAL_URL || "localhost:5000"}/${this.props.bookId}`)
  ws = new WebSocket(window.location.origin.replace(/^http/, 'ws') + `/${this.props.bookId}`)

  handleInputChange = (event) => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  componentDidMount() {
    this.ws.onopen = () => {
      console.log('Connected to server')
    }
    this.ws.onmessage = evt => {
      const comment = JSON.parse(evt.data)
      this.addCommentsFromServer(comment);
    }
    this.ws.onclose = () => {
      console.log('Disconnected from server')
      this.setState({
        ws: new WebSocket(window.location.origin.replace(/^http/, 'ws') + `/${this.props.bookId}`),
        // ws: new WebSocket(`ws://${process.env.ORIGINAL_URL || "localhost:5000"}/${this.props.bookId}`),
      })
    }
  }

  addCommentsFromServer = comments => {
    this.setState(state => ({ comments: comments }))
  }

  addReply() {
    if (this.state.comment) {
      const comment = {
        author: this.props.username,
        UserId: this.props.userId,
        BookId: this.props.bookId,
        text: this.state.comment
      }
      this.ws.send(JSON.stringify(comment))
      this.setState({ comment: '' })
    }
  }

  render() {
    return (
      <div>
        <Comment.Group size='small'>
          {this.state.comments.map((comment, index) => (
            <Comment key={index}>
              <Comment.Content>
                <Comment.Author as='a'>{comment.author}</Comment.Author>
                <Comment.Metadata>
                  <div>{new Date(comment.createdAt).toLocaleString("ru-RU")}</div>
                </Comment.Metadata>
                <Comment.Text>{comment.text}</Comment.Text>
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
        {this.props.username ?
          <Form reply>
            <Form.TextArea
              value={this.state.comment}
              onChange={e => this.handleInputChange(e)}
              name='comment'
              width={8}
            />
            <Button
              ws={this.ws}
              onClick={() => this.addReply()}
              content={
                <FormattedMessage
                  id="addReply"
                  defaultMessage="Add reply"
                />
              }
              labelPosition='left'
              icon='edit'
              size='small'
              primary
            />
          </Form>
          : null}
      </div>
    )
  }
}

export default withRouter(CommentsSection);