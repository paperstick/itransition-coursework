import { Link } from 'react-router-dom';

const columns = [
  {
    "dataField": "id",
    "text": "ID"
  },
  {
    "dataField": "username",
    "text": "Username",
    "formatter": (cell, row) => <Link to={`/profile/${cell}`}> {cell} </Link>
  },
  {
    "dataField": "email",
    "text": "Email"
  },
  {
    "dataField": "createdAt",
    "text": "Registration date",
    "formatter": (cell, row) => new Date(cell).toLocaleDateString()
  },
  {
    "dataField": "role",
    "text": "Role"
  },
  {
    "dataField": "status",
    "text": "Block status"
  }
]

export default columns;