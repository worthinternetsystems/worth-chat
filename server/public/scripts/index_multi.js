function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

// DOM loaded
r(function(){
  const serverConfig = {
    "iceServers": [ 
      {url:"stun:stun.1.google.com:19302"},
      {url:"stun:stun.1und1.de:3478"},
      {url:"stun:stun.gmx.net:3478"},
      {url:"stun:stun.l.google.com:19302"},
      {url:"stun:stun1.l.google.com:19302"},
      {url:"stun:stun2.l.google.com:19302"},
      {url:"stun:stun3.l.google.com:19302"},
      {url:"stun:stun4.l.google.com:19302"},
      {url:"turn:numb.viagenie.ca", credential: "FreeTurnServer", username: "damey@gmail.com"}
    ]
  };
  
  // holds multiple peerConnection objects keyed by socketId
  // { socketID: {properties:{}, connection}}
  const existingConnections = {};
  
  const { RTCPeerConnection, RTCSessionDescription } = window;
  
  const peerConnection = new RTCPeerConnection(serverConfig);
  
  const callUser = async (socketId) => {
    console.log("calluser", socketId);
    const newConnection = existingConnections[socketId].peer;
    const offer = await newConnection.createOffer();
    await newConnection.setLocalDescription(new RTCSessionDescription(offer));
  
    socket.emit("call-user", {
      offer,
      to: socketId
    });
  }
  
  let socket;
  if(window.location.href.includes("localhost")){
    socket = io.connect("localhost:9000");
  }else{
    socket = io.connect(window.location.href);
  }
  
  socket.on("update-user-list", ({ users }) => {
    console.log("socket event | update-user-list", existingConnections);
    // updateUserList(users);
    users.forEach(socketId => {
      // TODO: check socketId for existence in rrecorded connections
      if(!existingConnections.hasOwnProperty(socketId)){
        // const newConnection = new RTCPeerConnection(serverConfig)
        const newConnection = new RTCPeerConnection();
        
        newConnection.ontrack = function({ streams: [stream] }) {
          console.log("adding track");
          const remoteVideo = document.getElementById("remote-video");
          if (remoteVideo) {
            remoteVideo.srcObject = stream;
          }
        };
        existingConnections[socketId] = {status: "", peer: newConnection};
        callUser(socketId);
      }
    });
    
    // console.log("got ya list yo!", existingConnections);
  
    // socketIds.forEach(socketId => {
    //   const alreadyExistingUser = document.getElementById(socketId);
    //   if (!alreadyExistingUser) {
    //     const userContainerEl = createUserItemContainer(socketId);
  
    //     activeUserContainer.appendChild(userContainerEl);
    //   }
    // });
  });
  
  // TODO: remove from connection mapping, and video element
  socket.on("remove-user", ({ socketId }) => {
    console.log("socket event | remove-user");
    // const elToRemove = document.getElementById(socketId);
  
    // if (elToRemove) {
    //   elToRemove.remove();
    // }
    delete existingConnections[socketId];
  });
  
  socket.on("call-made", async data => {
    console.log("socket event | call-made");
    // if (getCalled) {
    //   const confirmed = confirm(
    //     `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
    //   );
  
    //   if (!confirmed) {
    //     socket.emit("reject-call", {
    //       from: data.socket
    //     });
  
    //     return;
    //   }
    // }
  
    const connection = existingConnections[data.socket].peer;
  
    await connection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(new RTCSessionDescription(answer));
  
    socket.emit("make-answer", {
      answer,
      to: data.socket
    });
    // getCalled = true;
  });
  
  socket.on("answer-made", async data => {
    console.log("answer-made", data.answer);
    const connection = existingConnections[data.socket].peer;
    console.log("answer-made", existingConnections[data.socket]);
    
    await connection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  
    // callUser(data.socket);
    if (connection.status !== "calling") {
      callUser(data.socket);
      connection.status = "calling";
    }
  });
  
  // TODO: refactor to "hangup" feature
  socket.on("call-rejected", data => {
    alert(`User: "Socket: ${data.socket}" rejected your call.`);
  });
  
  // TODO: refactor - needs to work for multiple peer connections
  // peerConnection.ontrack = function({ streams: [stream] }) {
  //   const remoteVideo = document.getElementById("remote-video");
  //   if (remoteVideo) {
  //     remoteVideo.srcObject = stream;
  //   }
  // };
  
  // NOTE: get local user media
  navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );
  
  if(navigator.getUserMedia){
    navigator.getUserMedia(
      // { video: true, audio: true },
      { video: true, audio: false },
      stream => {
        const localVideo = document.getElementById("local-video");
        if (localVideo) {
          localVideo.srcObject = stream;
        }
    
        stream.getTracks().forEach(track => {
          Object.entries(existingConnections).forEach(([key,connection]) => {
            console.log("adding a track");
            connection.peer.addTrack(track, stream)
            return
          });
        });
      },
      error => {
        console.warn(error.message);
      }
    );
  }
});