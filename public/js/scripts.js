const username = prompt("What is your username?")

// TODO: domain / port to come from config / env
const socket = io('http://localhost:9000',{
    query: {
        username
    }
});
let nsSocket = "";


// listen for nsList, which is a list of all the namespaces.
socket.on('nsList',(nsData)=>{
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

// TODO: re-introduce video streaming through socket
const setupVideo = () => {
    // WIP video setup
    var canvas = document.getElementById("preview");
    var context = canvas.getContext('2d');

    canvas.width = 900;
    canvas.height = 700;

    context.width = canvas.width;
    context.height = canvas.height;

    var video = document.getElementById("video");

    // var HOST = location.origin.replace(/^http/, 'ws').replace(/:\d+/,'');
    // var socket = io(HOST+':8001');
    // var socket = io('ws://localhost:8001');

    function loadCamera(stream){
        try {
            video.srcObject = stream;
            video.volume = 0;
        } 
        
        catch (error) {
        video.src = URL.createObjectURL(stream);
        }
    }

    function loadFail(){
    }

    function Draw(video,context){
        context.drawImage(video,0,0,context.width,context.height);
        // TODO: stream to current room
        socket.emit('stream',canvas.toDataURL('image/webp'));
    }

    // TODO: request when DOM is ready / user has clicked a button
    navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );

    if(navigator.getUserMedia)
    {
        navigator.getUserMedia({
            video: true, 
            audio: true
        },loadCamera,loadFail);
    }

    setInterval(function(){
        Draw(video,context);
    },0.1);
}

