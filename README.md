# worth-chat
#### Messaging / Video stream using Express.js, Socket.io and WebRTC

## Installing
```bash
npm install
```

## Run
```bash
npm run dev
```

### Configure
```json
{
  "Server" : {
    "settings" :{
      "port"   : "9000"
    }
  }
}
```

##### Current TODO's
- Implement webrtc media connections within the rooms
- Investigate TURN server setup (https://www.npmjs.com/package/node-turn) to remove local limitations
- Handle users leaving the page, updating the participant count
- Capture users in the namespace as well as the rooms