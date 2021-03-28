import React, { Component } from "react";
import { Button, Badge, Form, Container, Spinner } from "react-bootstrap";
import { Link } from 'react-router-dom';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { BsX } from "react-icons/bs";
import axios from 'axios';
import { withRouter } from "react-router";
import { FormattedMessage } from "react-intl";

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      id: undefined,
      profileId: undefined,
      username: "",
      profileUsername: "",
      email: "",
      profileEmail: "",
      books: [],
      isLoading: true,
    }
    this.getBooks = this.getBooks.bind(this);
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getBooks() {
    const username = this.props.match.params.id; //change later
    axios
      .get("/book/userBooks", {
        params: {
          username: username
        }
      })
      .then(response => {
        this.setState({ books: response.data });
      });
  }

  deleteBook(id) {
    const ID = id;
    axios
      .post("/book/deleteBook", { ID })
      .then(response => {
        this.setState({
          books: this.state.books.filter(book => book.id !== ID)
        })
      });
  }

  getUserData() {
    axios
      .get("/user/userData")
      .then(response => {
        if (response.data.status !== 'error') {
          this.setState({
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            role: response.data.role
          }, () => this.setState({ isLoading: false }));
        } else {
          this.setState({ isLoading: false })
        }
      })
  }

  getProfileData() {
    axios
      .get("/user/profileData",
        {
          params: {
            username: this.props.match.params.id,
          }
        })
      .then(response => {
        this.setState({
          profileId: response.data.id,
          profileUsername: response.data.username,
          profileEmail: response.data.email
        })
      })
  }

  componentDidMount() {
    this.getBooks();
    this.getProfileData();
    this.getUserData();
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

    if (!isLoading && !this.state.profileId) {
      return <div>
        <h3 className="mt-5 text-center">
          This user doesn't exist
                </h3>
      </div>
    }

    const columns = [
      {
        dataField: "title",
        text:
          <FormattedMessage
            id="titleProfile"
            defaultMessage="Title"
          />
        ,
        sort: true
      },
      {
        dataField: "genre",
        text:
          <FormattedMessage
            id="genreProfile"
            defaultMessage="Genre"
          />
      },
      {
        dataField: "tags",
        text:
          <FormattedMessage
            id="tagsProfile"
            defaultMessage="Tags"
          />,
        formatter: (cell, row) => cell ? cell.map((label, index) => { return (<Badge key={index} className="mr-2 p-2" variant="secondary">{label.label}</Badge>) })
          : <FormattedMessage
            id="noTagsProfile"
            defaultMessage="No tags"
          />
      },
      {
        dataField: "rating",
        text:
          <FormattedMessage
            id="ratingProfile"
            defaultMessage="Rating"
          />,
        formatter: (cell, row) => row.ratingCount !== 0 ? (cell / row.ratingCount).toPrecision(2) : 0,
        sort: true
      },
      {
        dataField: "createdAt",
        text:
          <FormattedMessage
            id="createdAtProfile"
            defaultMessage="Publication date"
          />,
        formatter: (cell, row) => new Date(cell).toLocaleDateString(),
        sort: true
      },
      {
        dataField: "Edit",
        text: "",
        align: 'center',
        formatter: (cell, row) =>
          <Link to={{ pathname: `/edit/${row.title}`, state: { bookid: row.title } }}>
            <Button variant="secondary">
              <FormattedMessage
                id="editProfile"
                defaultMessage="Edit"
              />
            </Button>
          </Link>,
        hidden: (this.state.username === this.state.profileUsername || this.props.role === 'admin') ? false : true
      },
      {
        dataField: "View",
        text: "",
        align: 'center',
        formatter: (cell, row) =>
          <Link to={`/view/${row.title}`}>
            <Button variant="secondary">
              <FormattedMessage
                id="viewProfile"
                defaultMessage="View"
              />
            </Button>
          </Link>
      },
      {
        dataField: "Delete",
        text: "",
        align: 'center',
        formatter: (cell, row) => <Button onClick={() => this.deleteBook(row.id)}> <BsX /> </Button>,
        hidden: this.state.username === this.state.profileUsername ? false : true
      }
    ]

    return (
      <>
        <Container className="container mt-3">
          <div className="row mt-1">
            <div className="mb-1" style={{
              fontSize: 24,
              fontWeight: 'bold',
              width: 'auto',
            }}>
              <FormattedMessage
                id="usernameProfile"
                defaultMessage="Username:"
              />
            </div>
            <div className="p-1 ml-3">
              <Form.Control type="text" placeholder={this.state.profileUsername} readOnly />
            </div>
          </div>
          <div className="row mt-1">
            <div className="mb-1" style={{
              fontSize: 24,
              fontWeight: 'bold'
            }}>
              <FormattedMessage
                id="emailProfile"
                defaultMessage="Email:"
              />
            </div>
            <div className="p-1 ml-3">
              <Form.Control type="text" placeholder={this.state.profileEmail} readOnly />
            </div>
          </div>

          <div className="container mt-3">
            {(this.state.username === this.props.match.params.id)
              ? <div className="mt-3 mb-3">
                <Link to={"/createBook"}>
                  <Button className="shadow-sm" variant="outline-success" >
                    <FormattedMessage
                      id="createBookButton"
                      defaultMessage="Create fandom"
                    />
                  </Button>
                </Link>
              </div>
              : null
            }

            <BootstrapTable
              bootstrap4
              keyField='id'
              noDataIndication="Table is Empty"
              data={this.state.books}
              columns={columns}
              defaultSorted={[{
                dataField: 'createdAt',
                order: 'desc'
              }]}
              wrapperClasses="table-responsive"
              pagination={paginationFactory()}
            />
          </div>
        </Container>
      </>
    )
  }
}

export default withRouter(Profile);