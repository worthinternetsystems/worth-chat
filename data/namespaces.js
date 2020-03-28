// Bring in the room class
const Namespace =  require('../classes/Namespace');
const Room =  require('../classes/Room');

// Set up the namespaces
let namespaces = [];
let worthNs = new Namespace(0,'Worth','https://images.ctfassets.net/bwx98rfv5w3w/3Xzy1AQAXmCm0iK62iAiOm/7bb9e0d9cd0020949d4554f4c66ed785/worth-logo-svg.svg','/worth');

namespaces.push(worthNs);

// Make the main room and add it to rooms. it will ALWAYS be 0
worthNs.addRoom(new Room(0,'New Articles','Worth'));
worthNs.addRoom(new Room(1,'Editors','Worth'));
worthNs.addRoom(new Room(2,'Other','Worth'));

module.exports = namespaces;