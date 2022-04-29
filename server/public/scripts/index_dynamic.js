function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}

// DOM loaded
r(function(){
  let isAlreadyCalling = false;
  let getCalled = false;
  
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
  
  const peerConnection = new RTCPeerConnection(serverConfig);
  
  peerConnection.onicecandidate = function(evt) {
    if (evt.target.iceGatheringState == "complete") { 
        console.log("ice candidate complete: " + evt.target);
      // local.createOffer(function(offer) {
      //   console.log("Offer with ICE candidates: " + offer.sdp);
      //   signalingChannel.send(offer.sdp); 
      // });
    } 
  }
  
  function unselectUsersFromList() {
    const alreadySelectedUser = document.querySelectorAll(
      ".active-user.active-user--selected"
    );
  
    alreadySelectedUser.forEach(el => {
      el.setAttribute("class", "active-user");
    });
  }
  
  function createUserItemContainer(socketId) {
    return;
    // const userContainerEl = document.createElement("div");
    // const usernameEl = document.createElement("p");
  
    // userContainerEl.setAttribute("class", "active-user");
    // userContainerEl.setAttribute("id", socketId);
    // usernameEl.setAttribute("class", "username");
    // usernameEl.innerHTML = `Socket: ${socketId}`;
  
    // userContainerEl.appendChild(usernameEl);
  
    // userContainerEl.addEventListener("click", () => {
    //   unselectUsersFromList();
    //   userContainerEl.setAttribute("class", "active-user active-user--selected");
    //   const talkingWithInfo = document.getElementById("talking-with-info");
    //   talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    //   callUser(socketId);
    // });
  
    // return userContainerEl;
  }
  
  async function callUser(socketId) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
  
    socket.emit("call-user", {
      offer,
      to: socketId
    });
  }
  
  // function updateUserList(socketIds) {
  //   const activeUserContainer = document.getElementById("active-user-container");
  
  //   socketIds.forEach(socketId => {
  //     const alreadyExistingUser = document.getElementById(socketId);
  //     if (!alreadyExistingUser) {
  //       const userContainerEl = createUserItemContainer(socketId);
  
  //       activeUserContainer.appendChild(userContainerEl);
  //     }
  //   });
  // }
  
  let socket;
  if(window.location.href.includes("localhost")){
    socket = io.connect("localhost:9000");
  }else{
    socket = io.connect(window.location.href);
  }
  
  socket.on("update-user-list", ({ users }) => {
    // updateUserList(users);
    console.log("update-user-list", users);

    callUser(users[0]);
  });
  
  socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);
  
    if (elToRemove) {
      elToRemove.remove();
    }
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
    unselectUsersFromList();
  });
  
  peerConnection.ontrack = function({ streams: [stream] }) {
    console.log("addTrack");
    const remoteVideo = document.getElementById("remote-video");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };
  
  navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );
  
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
  
   
});