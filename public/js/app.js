const socket = io()

const state_robot = document.getElementById("getState")
const suction = document.getElementById("suction")
const x_submit = document.getElementById("x-botton")
const x = document.getElementById("x-input")
const y_submit = document.getElementById("y-botton")
const y = document.getElementById("y-input")
const z_submit = document.getElementById("z-botton")
const z = document.getElementById("z-input")
const image_processing = document.getElementById("img_proces")
const image = document.getElementById("image")
const start_botton = document.getElementById("start_auto")
const stop_botton = document.getElementById("stop_auto")
const offerId = document.getElementById("offerId")
const dispath_botton = document.getElementById("dispath_w_t")
const store_botton = document.getElementById("store")


const ethereumButton = document.querySelector('.enableEthereumButton');
const myABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "ID",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "storage_location",
                "type": "uint8"
            },
            {
                "internalType": "uint256[]",
                "name": "packageId",
                "type": "uint256[]"
            }
        ],
        "name": "addOffer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "ID",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "storage_location",
                "type": "uint8"
            }
        ],
        "name": "changeLocation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "ID",
                "type": "uint256"
            }
        ],
        "name": "removeOffer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "packageId",
                "type": "uint256[]"
            }
        ],
        "name": "setPackage",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "ID",
                "type": "uint256"
            }
        ],
        "name": "getOfferData",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "ID",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint8",
                        "name": "storage_location",
                        "type": "uint8"
                    }
                ],
                "internalType": "struct warehouse.Offer",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "getPackage",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "offers",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "ID",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "storage_location",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const myContractAddress = '0x37dd16690bBBb4beA0C8ffD3F80242C17Dd92738';
ethereumButton.addEventListener('click', () => {
//Will Start the metamask extension
    ethereum.request({ method: 'eth_requestAccounts' })[0];
})

let provider,signer,wallet;
const account_from = {
        privateKey: '94d795e8df9cf344351a365bc47dc1456e2e8d7724bbf977e821bdd44ec392a2',
        };
let myContract;
const init = async () => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    provider = new ethers.providers.Web3Provider(window.ethereum)

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    wallet = new ethers.Wallet(account_from.privateKey, provider);
    signer = await provider.getSigner()
    myContract = await new ethers.Contract(myContractAddress, myABI, wallet);
}
const addOffer = async(id,location,packageId) => {
    await myContract.addOffer(id,location,packageId)
}
const editOffer = async(id,location) => {
    await myContract.changeLocation(id,location)
}
const getPackage = async(id) => {
    await myContract.getPackage(id)
}
const removeOffer = async(id) => {
    await myContract.removeOffer(id)
}
const getOfferData =async (id) => {
    await myContract.getOfferData(id)
}
init()
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


const img = new Image(640,480)
img.src = 'https://avatars.mds.yandex.net/i?id=f45022e5888d50629cedd0aa55fc0e3d8f83ce59-7006309-images-thumbs&n=13'

start_botton.addEventListener("click", (e) => {
    e.preventDefault()
    start_botton.setAttribute("disabled","disabled")
    stop_botton.removeAttribute("disabled","disabled")
    x_submit.setAttribute("disabled", "disabled")
    y_submit.setAttribute("disabled", "disabled")
    z_submit.setAttribute("disabled", "disabled")
    socket.emit("start", (error) => {
        if(error) { return console.log(error)}
    })
})
stop_botton.addEventListener("click", (e) => {
    e.preventDefault()
    start_botton.removeAttribute("disabled")
    x_submit.removeAttribute("disabled")
    y_submit.removeAttribute("disabled")
    z_submit.removeAttribute("disabled")
    socket.emit("stop", (error) => {
        if(error) { return console.log(error)}
    })
})


x_submit.addEventListener("click", (e) => {
    e.preventDefault()
    x_submit.setAttribute("disabled", "disabled")
    const message = x.value
    if(message === "") {
        x_submit.removeAttribute("disabled")
        throw "please set value"
    }

    socket.emit("getvalue-x", message, (error) => {
        x_submit.removeAttribute("disabled")
        x.value = ""
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")

})

y_submit.addEventListener("click", (e) => {
    e.preventDefault()
    y_submit.setAttribute("disabled", "disabled")
    const message = y.value
    if(message === "") {
        y_submit.removeAttribute("disabled")
        throw "please set value"
    }

    socket.emit("getvalue-y", message, (error) => {
        y_submit.removeAttribute("disabled")
        y.value = ""
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")

})

z_submit.addEventListener("click", (e) => {
    e.preventDefault()
    z_submit.setAttribute("disabled", "disabled")
    const message = z.value
    if(message === "") {
        z_submit.removeAttribute("disabled")
        throw "please set value"
    }

    socket.emit("getvalue-z", message, (error) => {
        z_submit.removeAttribute("disabled")
        z.value = ""
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")

})

let suction_state = false

suction.addEventListener("click", (e) => {
    e.preventDefault()
    suction.setAttribute("disabled", "disabled")
    suction_state = !suction_state
    message = suction_state
    socket.emit("suction", message, (error) => {
        suction.removeAttribute("disabled")
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")

})

state_robot.addEventListener("click", (e) => {
    e.preventDefault()
    socket.emit("getState", (error) => {
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")

})

image_processing.addEventListener("click", (e) => {
    
    image_processing.setAttribute("disabled", "disabled")
    socket.emit("img_proces", (callback) => {
})
    console.log("submit")


})

socket.on("proces_done", (message) => {
    console.log(message)
    location.reload()
})

socket.on("addOffer", async(message,callback) => {
    var data = message
    console.log(data.id)
    await delay(500)
    await addOffer(data.id,data.location,data.package)
})
socket.on("removeOffer", async(message,callback) => {
    var data = message
    console.log(data.id)
    await delay(500)
    await removeOffer(data.id)
})
socket.on("editOffer", async(message,callback) => {
    var data = message
    console.log(data.id)
    await delay(500)
    await editOffer(data.id,data.location)
})


dispath_botton.addEventListener("click", (e) => {
    const message = offerId.value
    dispath_botton.setAttribute("disabled", "disabled")
    if(message === "") {
        dispath_botton.removeAttribute("disabled")
        throw "please set value"
    }
    socket.emit("dispath_w_t", message,(error) => {
        dispath_botton.removeAttribute("disabled")
        offerId.value = ""
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")
})

store_botton.addEventListener("click", (e) => {
    const message = offerId.value
    store_botton.setAttribute("disabled", "disabled")
    if(message === "") {
        store_botton.removeAttribute("disabled")
        throw "please set value"
    }
    socket.emit("store_t_w", message,(error) => {
        store_botton.removeAttribute("disabled")
        offerId.value = ""
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")
})

var template = document.getElementById('template').innerHTML;
var rendered = Mustache.render(template, { message: 'Luke' });
document.getElementById('target').innerHTML = rendered;




