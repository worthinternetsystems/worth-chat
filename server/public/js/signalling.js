// TODO: setup new TURN server for webRTC config (https://www.npmjs.com/package/node-turn ?)
const peerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

const sessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

const callUser = (socketId) => {
    console.warn("calling...", socketId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new sessionDescription(offer));
    
    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

socket.on("call-made", async data => {
    await peerConnection.setRemoteDescription(
        new sessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new sessionDescription(answer));
    
    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
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