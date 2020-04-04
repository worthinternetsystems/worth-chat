const joinNs = (endpoint) => {
    if(nsSocket){
        // check to see if nsSocket is actually a socket
        nsSocket.close();
        // remove the eventListener before it's added again
        document.querySelector('#user-input').removeEventListener('submit',formSubmission)
    }
    // TODO: load socket from config / env
    nsSocket = io(`http://localhost:9000${endpoint}`)
    nsSocket.on('nsRoomLoad',(nsRooms)=>{
        // console.log(nsRooms)
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = "";
        nsRooms.forEach((room)=>{
            let glyph;
            if(room.privateRoom){
                glyph = 'lock'
            }else{
                glyph = 'globe'
            }
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
        })
        // add click listener to each room
        let roomNodes = document.getElementsByClassName('room');
        Array.from(roomNodes).forEach((elem)=>{
            elem.addEventListener('click',(e)=>{
                joinRoom(e.target.innerText)
            })
        })
        // add room automatically... first time here
        const topRoom = document.querySelector('.room')
        const topRoomName = topRoom.innerText;
        joinRoom(topRoomName)
        
    })    
    nsSocket.on('messageToClients',(msg)=>{
        console.log(msg)
        const newMsg = buildHTML(msg);
        document.querySelector('#messages').innerHTML += newMsg
    });

    nsSocket.on('videoToClients',(userVideo)=>{
        console.log("videoToClients", userVideo);

        const { username, time, video } = userVideo;

        // TODO: 
        // 1. determine if a video tag exists in this room for the incoming video
        // 2. if not create a video tag
        // 3. update the stream for the video

        const userVideoEl = document.querySelector(`#room-video img[data-username="${username}"]`);
        if (!userVideoEl) {
            const newUserVideoEl = document.createElement("img");
            newUserVideoEl.setAttribute("data-username", username);
            newUserVideoEl.setAttribute("src", video);
            // newUserVideoEl.srcObject = video;

            document.querySelector(`#room-video`).appendChild(newUserVideoEl);
        }else{
            userVideoEl.setAttribute("src", video);
            // userVideoEl.srcObject = video;
        }
    });

    document.querySelector('.message-form').addEventListener('submit',formSubmission);

    setupOutboundVideo();
}

const formSubmission = (event) => {
    event.preventDefault();
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer',{text: newMessage});
    
    // remove message from the input
    document.querySelector('input#user-message').value = "";
}

const buildHTML = (msg) => {
    const convertedDate = new Date(msg.time).toLocaleString();
    const newHTML = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}" />
        </div>
        <div class="user-message">
            <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>    
    `
    return newHTML;
}

// TODO: re-introduce video streaming through socket
const setupOutboundVideo = () => {
    // WIP video setup
    var canvas = document.getElementById("preview");
    var context = canvas.getContext('2d');

    canvas.width = 900;
    canvas.height = 700;

    context.width = canvas.width;
    context.height = canvas.height;

    var video = document.getElementById("video");

    function loadCamera(stream){
        try {
            video.srcObject = stream;
            video.volume = 0;
        } 
        
        catch (error) {
            video.src = URL.createObjectURL(stream);
        }
        
        nsSocket.emit('videoToServer', stream);
    }

    function loadFail(){
    }

    function Draw(video,context){
        context.drawImage(video,0,0,context.width,context.height);
        // TODO: stream to current room
        // socket.emit('stream',canvas.toDataURL('image/webp'));
        nsSocket.emit('videoToServer', canvas.toDataURL('image/webp'));
    }

    // TODO: request when DOM is ready / user has clicked a button
    navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );

    if(navigator.getUserMedia)
    {
        navigator.getUserMedia({
            video: true, 
            audio: false
        },loadCamera,loadFail);
    }

    setInterval(function(){
        Draw(video,context);
    },0.1);
}