const express = require("express")
const path = require("path")
const socketio = require("socket.io")
const http = require("http")
const {MoveTo, Move, suction, getState} = require("./src/http-API")
const circle = require("./src/visual") 
const { json } = require("express")
const {Move_Load_location, Move_Unload_location,
      Move_dock_location, dock_location}  = require("./src/location")


const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

let x, y, z, suction_state, state_data

io.on("connection",async (socket) => {
    
    console.log("Connectin successful.")
    
    // get init. current state robot
    getState((d) => {
        //console.log(d)
        state_data = d
        //console.log(state_data)
        x = state_data.x
        y = state_data.y
        z = state_data.z
    })


    //get current state robot
    socket.on("getState", (message, callback) => {
        getState((d) => {
            //console.log(d)
            state_data = d
            console.log(state_data)
            x = state_data.x
            y = state_data.y
            z = state_data.z
        })
    })


    // get x value from client
    socket.on("getvalue-x", (message,callback) => {
        x = message
        console.log("x:", x)
        MoveTo(x, y, z)
        callback()
    })

    // get y value from client
    socket.on("getvalue-y", (message,callback) => {
        y = message
        console.log("y:", y)
        MoveTo(x, y, z)
        callback()
    })

    // get z value from client
    socket.on("getvalue-z", (message,callback) => {
        z = message
        console.log("z:", z)
        MoveTo(x, y, z)
        callback()
    })

    socket.on("suction", (message,callback) => {
        suction_state = message
        console.log("suction:", suction_state.toString())
        suction(suction_state)
        callback()
    })

    socket.on("img_proces",async (message, callback) => {
        console.log(message)
        await circle.getCenter()
        await socket.emit("proces_done", "Done")
        callback()
    })

})

server.listen(3000, () => {
    console.log("App running.")
})