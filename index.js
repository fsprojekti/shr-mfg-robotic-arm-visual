const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const http = require("http");
const {moveTo, suction, getState} = require("./src/httpAPI");
const circle = require("./src/visual");
const {dock_location} = require("./src/location");
const {processTask, state_eth, eth_data} = require("./src/motion");
// const {processTask} = require("./src/motion");
const {task_queue, dispatch} = require("./src/task");
const {offer} = require("./offer");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")))

let x, y, z, suction_state, state_data, start = true, offerId_client;

io.on("connection", async (socket) => {

    console.log("Connection successful.")

    // get init. current state robot
    await getState((d) => {
        //console.log(d)
        state_data = d;
        //console.log(state_data)
        x = state_data.x;
        y = state_data.y;
        z = state_data.z;
    })

    // start
    socket.on("start", () => {
        start = true;
        console.log("start state:", start);
    })

    //stop
    socket.on("stop", () => {
        start = false;
        console.log("start state:", start)
    })

    //get current state robot
    socket.on("getState", () => {
        getState((d) => {
            //console.log(d)
            state_data = d;
            console.log(state_data);
            x = state_data.x;
            y = state_data.y;
            z = state_data.z;
        })
    })

    // get x value from client
    socket.on("getvalue-x", (message, callback) => {
        x = message;
        console.log("x:", x);
        moveTo(x, y, z);
        callback();
    })

    // get y value from client
    socket.on("getvalue-y", (message, callback) => {
        y = message;
        console.log("y:", y);
        moveTo(x, y, z);
        callback();
    })

    // get z value from client
    socket.on("getvalue-z", (message, callback) => {
        z = message;
        console.log("z:", z);
        moveTo(x, y, z);
        callback();
    })

    // on off suction
    socket.on("suction", (message, callback) => {
        suction_state = message;
        console.log("suction:", suction_state.toString());
        suction(suction_state);
        callback();
    })

    // get center package
    socket.on("img_proces", async (callback) => {
        console.log("img_process request received");
        await circle.getCenter();
        await socket.emit("proces_done", "Done");
        callback();
    })

    // dispatch from warehouse to transport
    socket.on("dispatch_w_t", (message, callback) => {
        offerId_client = message;
        console.log(offerId_client);
        dispatch(offerId_client, "unload");
        console.log(task_queue);
        callback();
    })

    // dispatch from transport to warehouse
    socket.on("store_t_w", (message, callback) => {
        offerId_client = message;
        console.log(offerId_client);
        dispatch(offerId_client, "load");
        console.log(task_queue);
        callback();
    })
})

// HTTP API get package data in any location
app.get(`/dock`, (req, res) => {
    console.log("received a request to the /dock API");
    if (!req.query.address || req.query.address > 4) {
        console.log("missing address or address out of range");
        return res.send(dock_location)
    } else if (req.query.address !== undefined && req.query.level === undefined) {
        console.log("missing level, printing the whole dock");
        res.send(dock_location[req.query.address]);
    } else if (req.query.address !== undefined && req.query.level !== undefined) {
        if (dock_location[req.query.address].storage[req.query.level - 1] === undefined) {
            return res.send({
                error: "There is no package in this location."
            })
        }
        console.log("address and level data ok");
        // console.log(dock_location[req.query.address].storage[req.query.level - 1]);
        res.send(dock_location[req.query.address].storage[req.query.level - 1].toString());
    }
})

// HTTP API get current offer save in warehouse
app.get("/offer", (req, res) => {
    res.send(offer);
})

// HTTP API get current task queue
app.get("/task", (req, res) => {
    res.send(task_queue);
})

// HTTP API dispatch task
app.get("/dispatch", async (req, res) => {
    if (req.query.OfferId === undefined || req.query.OfferId === "" && req.query.mode === undefined || req.query.mode === undefined) {
        return res.send("Please set offer Id and dispatch mode.")
    } else if (req.query.OfferId !== undefined && req.query.mode === undefined || req.query.mode === "") {
        return res.send("Please set dispatch mode.");
    } else if (req.query.OfferId === undefined || req.query.OfferId === "" && req.query.mode !== undefined) {
        return res.send("Please set offer Id.");
    } else if (req.query.mode === "relocation" && (req.query.location === undefined || req.query.location === "")) {
        return res.send("Please set target location to relocation");
    } else if (req.query.mode === "relocation" && (req.query.location < 1 || req.query.location > 4)) {
        return res.send("dock location must be 1 - 4");
    }

    for (let i = 0; i <= task_queue.length - 1; i++) {
        let temp_offerId = task_queue[i].offerId;
        if (req.query.OfferId === temp_offerId) {
            return res.send(`Offer Id: ${temp_offerId} is already in task queue`);
        }
    }
    let dispatch_mode = req.query.mode.toString();
    dispatch(req.query.OfferId, dispatch_mode, req.query.location);
    console.log(task_queue);

    res.send(`task is accepted`);
})


let robot_running = false
// for every second check task queue and if program is started
setInterval(async () => {
    if (start === true) {
        if (robot_running !== true) {
            robot_running = true;
            console.log("robot running");
            // console.log("state of add:", state_eth.add_eth);
            // check queue for awaiting tasks and process the first one
            await processTask();
            console.log("state_eth:", state_eth.add_eth);
            console.log(eth_data);
            if (state_eth.add_eth === true) {
                io.emit("addOffer", eth_data)
                // console.log(eth_data);
                state_eth.add_eth = false;
            }
            if (state_eth.remove_eth === true) {
                io.emit("removeOffer", eth_data);
                state_eth.remove_eth = false;
            }
            if (state_eth.edit_eth === true) {
                io.emit("editOffer", eth_data);
                state_eth.edit_eth = false;
            }
            robot_running = false;
        }
    }
}, 1000)

server.listen(3000, () => {
    console.log("App running.")
})
