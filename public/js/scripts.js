const username = prompt("What is your username?");

// TODO: setup new TURN server for webRTC config (https://www.npmjs.com/package/node-turn ?)
const peerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

const sessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

// TODO: domain / port to come from config / env
const socket = io('http://localhost:9000', {
    query: {
        username
    }
});
let nsSocket = "";


// listen for nsList, which is a list of all the namespaces.
socket.on('nsList', nsData => {
    console.log("The list of .rooms has arrived!!")
    // console.log(nsData)
    let namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = "";
    nsData.forEach((ns)=>{
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint} ><img src="${ns.img}" /></div>`
    })

    // Add a clicklistener for each NS
    console.log(document.getElementsByClassName('namespace'))
    Array.from(document.getElementsByClassName('namespace')).forEach((elem)=>{
        // console.log(elem)
        elem.addEventListener('click',(e)=>{
            const nsEndpoint = elem.getAttribute('ns');
            // console.log(`${nsEndpoint} I should go to now`)
            joinNs(nsEndpoint)
        })
    })
    joinNs('/worth');
})

async function callUser(socketId) {
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
