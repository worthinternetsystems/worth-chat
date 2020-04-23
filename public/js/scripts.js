let nsSocket = "";

// window.addEventListener('load', function () {
    const username = prompt("What is your username?");
    // TODO: domain / port to come from config / env
    const socket = io('http://localhost:9000', {
        query: {
            username
        }
    });


    // listen for nsList, which is a list of all the namespaces.
    socket.on('nsList', nsData => {
        console.log("The list of rooms has arrived!!");
        
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

// })

