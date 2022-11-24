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