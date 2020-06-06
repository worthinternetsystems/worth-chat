function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

// DOM loaded
r(function(){
  navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );
  
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
  
  const existingCalls = [];
  const { RTCPeerConnection, RTCSessionDescription } = window;
  
  let isAlreadyCalling = false;
  let getCalled = false;
  let peerConnection;

  const setupLocalStream = () => {
    if(navigator.getUserMedia){
      navigator.getUserMedia(
        { video: true, audio: false },
        stream => {
          const localVideo = document.getElementById("local-video");
          if (localVideo) {
            localVideo.srcObject = stream;
          }
      
          stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        },
        error => {
          console.warn(error.message);
        }
      );
    }
  }

  const onAddTrack = ({streams: [stream]}) => {
    const remoteStreamsContainer = document.getElementById("remote-streams");
    // TODO: add dynamic vids
    if (remoteStreamsContainer) {
      const remoteVideo = document.createElement("video");
      remoteVideo.id = "remote-stream-1";
      remoteVideo.autoplay = true;
      remoteVideo.srcObject = stream;
      remoteStreamsContainer.appendChild(remoteVideo);
    }
  };
  
  const setupPeerConnection = () => {
    peerConnection = new RTCPeerConnection(serverConfig);
    peerConnection.ontrack = onAddTrack;
    setupLocalStream();
  }
  
  async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
  
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
    console.log("update-user-list", users);

    callUser(users[0]);
  });
  
  socket.on("remove-user", ({ socketId }) => {
    console.log("user removed")
    const elToRemove = document.getElementById("remote-stream-1");
  
    if (elToRemove) {
      elToRemove.remove();
    }

    setupPeerConnection();
    isAlreadyCalling = false;
    getCalled = false;
  });
  
  socket.on("call-made", async data => {
    if (getCalled) {
      const confirmed = confirm(
        `User "Socket: ${data.socket}" wants to call you. Do accept this call?`
      );
  
      if (!confirmed) {
        socket.emit("reject-call", {
          from: data.socket
        });
  
        return;
      }
    }
  
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
  
    socket.emit("make-answer", {
      answer,
      to: data.socket
    });
    getCalled = true;
  });
  
  socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  
    if (!isAlreadyCalling) {
      callUser(data.socket);
      isAlreadyCalling = true;
    }
  });
  
  socket.on("call-rejected", data => {
    alert(`User: "Socket: ${data.socket}" rejected your call.`);
  });

  setupPeerConnection();
});