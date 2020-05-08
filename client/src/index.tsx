import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App';

ReactDOM.render(
  <React.StrictMode>
    <App test="blah"/>
  </React.StrictMode>,
  document.getElementById('root')
);
