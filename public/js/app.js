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

let suction_state = "false"

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
    suction.setAttribute("disabled", "disabled")
    message = "true"
    socket.emit("getState", message, (error) => {
        suction.removeAttribute("disabled")
        if(error) {
            return console.log(error)
        }
        console.log("message delivered")
})
    console.log("submit")

})

image_processing.addEventListener("click", (e) => {
    
    image_processing.setAttribute("disabled", "disabled")
    message = "true"
    socket.emit("img_proces", message, (callback) => {
        suction.removeAttribute("disabled")
})
    console.log("submit")


})

socket.on("proces_done", (message) => {
    console.log(message)
    location.reload()
})