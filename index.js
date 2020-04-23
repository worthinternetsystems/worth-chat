const express = require('express');
const app = express();
const path = require('path');
const config = require(path.join(__dirname,"./config/global.json"));
const socketio = require('socket.io');
// const port = process.env.PORT || config.server.settings.port;
const port = 9000;
const helmet = require('helmet')

let namespaces = require('./data/namespaces');

app.use(helmet());
app.use(express.static(__dirname + '/public'));
const expressServer = app.listen(port, () => console.log(`\x1b[40m`,`\x1b[32m`,
`
     ______  __    __  _______  ________ 
    |   ___||  |__|  ||   _   ||__    __|
    |  |    |   __   ||  |_|  |   |  |
    |  |___ |  |  |  ||   _   |   |  |    
    |______||__|  |__||__| |__|   |__|
 
    [+] Server         : http://localhost:${port}
    [~] Running Server...
`,`\x1b[0m`));
const io = socketio(expressServer);

io.on('connection',(socket)=>{
    // console.log(socket.handshake)
    // build an array to send back with the img and endpoing for each NS
    let nsData = namespaces.map((ns)=>{
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })
    // console.log(nsData)
    // send the nsData back to the client. We need to use socket, NOT io, because we want it to 
    // go to just this client. 
    socket.emit('nsList',nsData);

    socket.on("call-user", data => {
        socket.to(data.to).emit("call-made", {
            offer: data.offer,
            socket: socket.id
        });
    });

    socket.on("make-answer", data => {
        socket.to(data.to).emit("answer-made", {
            socket: socket.id,
            answer: data.answer
        });
    });
})


// loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {
    io.of(namespace.endpoint).on('connection',(nsSocket)=>{
        // console.log(nsSocket.handshake)
        const username = nsSocket.handshake.query.username;
        
        // a socket has connected to one of our chatgroup namespaces.
        // send that ns group info back
        nsSocket.emit('nsRoomLoad',namespace.rooms)
        nsSocket.on('joinRoom',(roomToJoin, numberOfUsersCallback)=>{
            // deal with history... once we have it
            // console.log(nsSocket.rooms);
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            nsSocket.leave(roomToLeave);
            updateUsersInRoom(namespace, roomToLeave)
            nsSocket.join(roomToJoin)
            
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomToJoin;
            })
            nsSocket.emit('historyCatchUp', nsRoom.history)
            updateUsersInRoom(namespace, roomToJoin);
        })

        nsSocket.on('videoToServer', (vid) => {
            const userVideo = {
                username,
                time: Date.now(),
                video: vid
            }
            const roomTitle = Object.keys(nsSocket.rooms)[1];

            // console.log("videoToServer", vid);
            
            io.of(namespace.endpoint).to(roomTitle).binary(false).emit('videoToClients', userVideo);
        })

        nsSocket.on('newMessageToServer',(msg)=>{
            const fullMsg = {
                text: msg.text,
                time: Date.now(),
                username: username,
                avatar: 'https://via.placeholder.com/30'
            }
            // console.log(fullMsg)
            // Send this message to ALL the sockets that are in the room that THIS socket is in.
            // how can we find out what rooms THIS socket is in?
            // console.log(nsSocket.rooms)
            // the user will be in the 2nd room in the object list
            // this is because the socket ALWAYS joins its own room on connection
            // get the keys
            const roomTitle = Object.keys(nsSocket.rooms)[1];
            // we need to find the Room object for this room
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomTitle;
            })
            // console.log("The room object that we made that matches this NS room is...")
            // console.log(nsRoom)
            nsRoom.addMessage(fullMsg);
            io.of(namespace.endpoint).to(roomTitle).emit('messageToClients',fullMsg)
        })
    })
})

// TODO: users in namespace as well as rooms...
function updateUsersInRoom(namespace, roomToJoin){
    // Send back the number of users in this room to ALL sockets connected to this room
    io.of(namespace.endpoint).in(roomToJoin).clients((error, clients)=>{
        // console.log(`There are ${clients.length} in this room`);
        io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers',clients)
    })
}