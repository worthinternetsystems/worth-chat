import React, { Component } from 'react';
import socketIOClient from "socket.io-client";

import './index.scss';

const endpoint = "http://localhost:9000";

class App extends Component {

  render() {
    return (
      <div className="">
        <h1>App</h1>
      </div>
    );
  }
}

export default App;
