import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css'; 
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from "history";
import './index.css';
import App from './App';
import axios from 'axios';

axios.defaults.baseURL = 'https://itransition-coursework.herokuapp.com';
// axios.defaults.baseURL = 'http://localhost:5000';

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <App />
  </Router>,
  document.getElementById('root')
);
