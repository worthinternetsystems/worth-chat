import React, { Component } from 'react';
import socketIOClient from "socket.io-client";

import './index.scss';

const endpoint = "http://localhost:9000";

interface Namespace {
  endpoint: string;
  img: string;
}
interface Props {
  test: string
}
interface State {
  username: string;
  namespaces: Namespace[];
}

class App extends Component<Props, State> {
  state = {
    username: "",
    namespaces: [] as Namespace[]
  }

  componentDidMount() {
    this.getUsername();
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    console.log("[App.componentDidUpdate]", this.state);
    if(prevState.username !== this.state.username) {
      this.setupSocket();
    }
  }
  
  getUsername = (): void => {
    const username = prompt("What is your username?");
    
    if(username) this.setState({username});
  }
  
  setupSocket = () => {
    const socket = socketIOClient(endpoint);

    socket.on("nsList", (nsData: Namespace[]) => {
      this.setState({namespaces: nsData})
    });
  }

  render() {
    return (
      <div className="">
        <h1>App - {this.state.username}</h1>
      </div>
    );
  }
}

export default App;
