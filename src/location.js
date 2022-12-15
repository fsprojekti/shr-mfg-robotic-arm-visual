const {MoveTo, Move, suction, getState} = require("./http-API")
const fs = require("fs")


//define cordinate every location
const dock_file_path = "dock.json" 
var data = JSON.parse(fs.readFileSync(dock_file_path))
const package_height = 10.6
//location,where should AVG wait for unload package
const Load_location = {x:135, y:-135}

//location, where should AVG waite for load package
const Unload_location = {x:200, y:0,storage:[]}

//location, where should robot arm stay, when task done
const reset_location = {x:0, y:-100, z:200}
const dock_location = []
//intermediate location for store package
const receive_buffer = {x:data.receive_buffer.x,y:data.receive_buffer.y,storage:data.receive_buffer.storage}
//intermediate location for unload package from warehouse
const dispatch_buffer = {x:data.dispatch_buffer.x,y:data.dispatch_buffer.y,storage:data.dispatch_buffer.storage}
/* dock_location[1] = {x:-150, y:75, storage:[{offerId: 1},{offerId:3}]}
dock_location[2] = {x:-150, y:0, storage:[{offerId:5}]}
dock_location[3] = {x:-150, y:-75, storage:[{offerId: 2}]}
dock_location[4] = {x:-150, y:-150, storage:[]} */

//location to store package
dock_location[1] = {x:data.dock_location1.x, y:data.dock_location1.y, storage:data.dock_location1.storage}
dock_location[2] = {x:data.dock_location2.x, y:data.dock_location2.y, storage:data.dock_location2.storage}
dock_location[3] = {x:data.dock_location3.x, y:data.dock_location3.y, storage:data.dock_location3.storage}
dock_location[4] = {x:data.dock_location4.x, y:data.dock_location4.y, storage:data.dock_location4.storage}

// used for sorting size dock
var temp_array = []

console.log(dock_location)
//console.log(dock_location[4].storage)
// save dock data
const save_data_to_JSON_file =async () => {
let dock = {
    dock_location1 : {x:dock_location[1].x, y:dock_location[1].y, storage:dock_location[1].storage},
    dock_location2 : {x:dock_location[2].x, y:dock_location[2].y, storage:dock_location[2].storage},
    dock_location3 : {x:dock_location[3].x, y:dock_location[3].y, storage:dock_location[3].storage},
    dock_location4 : {x:dock_location[4].x, y:dock_location[4].y, storage:dock_location[4].storage},
    receive_buffer: {
        x: 0,
        y: -160,
        storage: receive_buffer.storage
    },
    dispatch_buffer: {
        x: 125,
        y: 0,
        storage: dispatch_buffer.storage
    }
    }
let save_data = JSON.stringify(dock)
fs.writeFileSync(dock_file_path,save_data)
}
//save_data_to_JSON_file()


//order LOW to HIGH --> storage level
const select_storage_location = () => {
    for(var i = 1; i<=4; i++) {
        temp_array[i] =JSON.parse(JSON.stringify(dock_location[i]))
    }
    
    for(var i=1; i<=4; i++){
        for(var j = 1; j<=4-i; j++){
            if(temp_array[j].storage.length > temp_array[j+1].storage.length) {
                var temp = temp_array[j+1]
                temp_array[j+1] = temp_array[j]
                temp_array[j] = temp
            }
    }
    }
    //console.log(temp_array)
    return temp_array
}

// get index first object ordered array
const getIndex = () => {
    for(var i=1; i<=4; i++){
        if(temp_array[1].x === dock_location[i].x && 
        temp_array[1].y === dock_location[i].y){
            return i
        }
    }}
/* console.log(select_storage_location()[1])
console.log(getIndex())
console.log(dock_location[getIndex()])
console.log(dock_location) */

const storage_location = () => {
    select_storage_location()
    return getIndex()
}

//console.log(storage_location())

//console.log(select_storage_location()[1])

// delay for ms
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

//Move to load_location
const Move_Load_location =async (z=100) => {
    await MoveTo(Load_location.x, Load_location.y, z)
    await delay(2000)
}

//Move to dispatch buffer
const Move_dispatch_buffer = async (mode) => {
    var z
    //when robot arm have package on suction
    if(mode === "load"){
       z = (dispatch_buffer.storage.length * package_height) + package_height + 20 + 60
    }
    //when robot arm have not package on suction
    if(mode === "unload"){
        z = (dispatch_buffer.storage.length * package_height) + 53 + 20
    }
    MoveTo(dispatch_buffer.x, dispatch_buffer.y, z)
    await delay(3000)
}

const Move_receive_buffer = async (mode) => {
    var z
    //when robot arm have package on suction
    if(mode === "load"){
       z = (receive_buffer.storage.length * package_height) + package_height + 20 + 60
    }
    //when robot arm have not package on suction
    if(mode === "unload"){
        z = (receive_buffer.storage.length * package_height) + 53 + 20
    }
    MoveTo(receive_buffer.x, receive_buffer.y, z)
    await delay(3000)
}

const Move_Unload_location =async () => {
    var z = (Unload_location.storage.length * package_height) + package_height + 20 + 60
    
    MoveTo(Unload_location.x, Unload_location.y, z)
    await delay(2500)
}

const Move_Reset_location =async () => {
    MoveTo(reset_location.x, reset_location.y, reset_location.z)
    await delay(2000)
}

const Move_dock_location =async (i,mode) => {
    let z
    //when robot arm have package on suction
    if(mode === "load"){
        z = (dock_location[i].storage.length * package_height) + package_height + 20 + 60
    }
    //when robot arm have not package on suction
    if(mode === "unload"){
        z = (dock_location[i].storage.length * package_height) + 53 + 20 
    }
    console.log("x: ",dock_location[i].x
                ,"y:",dock_location[i].y,
                "z:",z )
                
    MoveTo(dock_location[i].x, dock_location[i].y, z)
    await delay(2500)
} 

module.exports = {Move_Load_location, Move_Unload_location, 
    Move_dock_location, dock_location, storage_location, Move_Reset_location, 
    temp_array,delay,save_data_to_JSON_file,getIndex,package_height,
    Move_dispatch_buffer,Move_receive_buffer, Unload_location,receive_buffer,dispatch_buffer}