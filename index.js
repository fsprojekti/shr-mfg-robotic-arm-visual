const express = require("express")
const path = require("path")
const socketio = require("socket.io")
const http = require("http")
const {MoveTo, Move, suction, getState} = require("./src/http-API")
const circle = require("./src/visual") 
const { json } = require("express")
const {Move_Load_location, Move_Unload_location,
      Move_dock_location, dock_location, delay}  = require("./src/location")
const {robot_auto} = require("./src/motion")
const {task_queue, dispatch} = require("./src/task")


const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

let x, y, z, suction_state, state_data, start = false, offerId_client

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

    // start
    socket.on("start", () => {
        start = true
        console.log("start state:", start)
    })

    //stop
    socket.on("stop", () => {
        start = false
        console.log("start state:", start)
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

    // on off suction
    socket.on("suction", (message,callback) => {
        suction_state = message
        console.log("suction:", suction_state.toString())
        suction(suction_state)
        callback()
    })

    // get center package
    socket.on("img_proces",async (callback) => {
        await circle.getCenter()
        await socket.emit("proces_done", "Done")
        callback()
    })

    socket.on("dispath_w_t", (message,callback) => {
        offerId_client = message
        console.log(offerId_client)
        dispatch(offerId_client,"unload")
        console.log(task_queue)
        callback()
    })
    socket.on("store_t_w", (message,callback) => {
        offerId_client = message
        console.log(offerId_client)
        dispatch(offerId_client,"load")
        console.log(task_queue)
        callback()
    })

})

app.get(`/dock`, (req,res) => {
    if(!req.query.address || req.query.address > 4){
        return res.send(dock_location)}
    else if(req.query.address !== undefined && req.query.level === undefined){
        res.send(dock_location[req.query.address])
    }
    else if(req.query.address !== undefined && req.query.level !== undefined){
        if(dock_location[req.query.address].storage[req.query.level - 1] === undefined){
            return res.send({
                error: "Here is no package."
            })
        }
        res.send(dock_location[req.query.address].storage[req.query.level - 1])
    }
})

app.get("/task", (req,res) => {
    res.send(task_queue)
})

app.get("/dispatch",async (req,res) => {
    if(req.query.OfferId === undefined ||req.query.OfferId === "" && req.query.mode === undefined || req.query.mode === undefined){
        return res.send("Please set offer Id and dispath mode.")
    } else if (req.query.OfferId !== undefined && req.query.mode === undefined || req.query.mode === "") {
        return res.send("Please set dispath mode.")
    } else if ( req.query.OfferId === undefined || req.query.OfferId === "" && req.query.mode !== undefined ){
        return res.send("Please set offer Id.")
    } else if( req.query.mode === "relocation" && (req.query.location === undefined || req.query.location === "")){
        return res.send("Please set target location to relocation")
    } else if( req.query.mode === "relocation" && (req.query.location < 1 || req.query.location > 4)){
        return res.send("dock location must be 1 - 4")
    } 

    for(var i=0;i<=task_queue.length-1;i++){
        var temp_offerId = task_queue[i].offerId
        if(req.query.OfferId === temp_offerId){
            return res.send(`Offer Id: ${temp_offerId} is already in task queue`)
        }
    }
    var disapath_mode = req.query.mode.toString()
    dispatch(req.query.OfferId, disapath_mode, req.query.location)
    console.log(task_queue)

    res.send(`task is accepted`)


}) 


var robot_runing = false
setInterval(async () => {
    if(start === true){
        if(robot_runing !== true){
            robot_runing = true
            console.log("robot running")
            await robot_auto()
            robot_runing = false
            
        }
    }
}, 1000)

server.listen(3000, () => {
    console.log("App running.")
})