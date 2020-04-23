/**
 * 
 * @param {string} roomName 
 * @param {function} callUser 
 */
const joinRoom = (roomName) => {

    console.log("joinRoom");

    // Send this roomName to the server!
    nsSocket.emit('joinRoom', roomName, (newNumberOfMembers)=>{
        // we want to update the room member total now that we have joined!
        document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`
    })
    nsSocket.on('historyCatchUp',(history)=>{
        // console.log(history)
        const messagesUl = document.querySelector('#messages');
        messagesUl.innerHTML = "";
        history.forEach((msg)=>{
            const newMsg = buildHTML(msg)
            messagesUl.innerHTML += newMsg;
        })
        messagesUl.scrollTo(0,messagesUl.scrollHeight);
    })
    nsSocket.on('updateMembers',(members) => {
        document.querySelector('.curr-room-num-users').innerHTML = `${members.length} <span class="glyphicon glyphicon-user"></span>`;
        // document.querySelector('.room-header ol.participants').innerHTML = members.map(m => `<li class="socket-id" data-socketid="${m}">${m}</li>`);
        document.querySelector('.curr-room-text').innerText = `${roomName}`;

        // document.querySelectorAll('.socket-id').click
        for(let member of members){
            const partLi = document.createElement("li");
            partLi.setAttribute("socket-id", member);
            partLi.innerText = member;
            // console.log("updateMembers", member, partLi)
            partLi.onclick = () => {callUser(member);}
            document.querySelector('.room-header ol.participants').append(partLi);
        }

    });

    // TODO: 
    // 1. video setup logic to be added here.
    // 2. clean out previous videos
};

const error = (err) => {
    console.warn('Error', err);
}