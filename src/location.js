const {MoveTo, Move, suction, getState} = require("./http-API")

const package_height = 20
const Load_location = {x:-75, y:-75}
const Unload_location = {x:150, y:-150}
const reset_location = {x:-150, y:38, z:200}
const dock_location = []
dock_location[1] = {x:-75, y:-150, storage:[{offerId: 1},{offerId:3}]}
dock_location[2] = {x:0, y:-150, storage:[{offerId:5}]}
dock_location[3] = {x:75, y:-150, storage:[{offerId: 2}]}
dock_location[4] = {x:150, y:-150, storage:[]}


//order LOW to HIGH --> storage level
const select_storage_location = () => {
    var temp_array =JSON.parse(JSON.stringify(dock_location))
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
        if(select_storage_location()[1].x === dock_location[i].x && 
        select_storage_location()[1].y === dock_location[i].y){
            return i
        }
    }}
/* console.log(select_storage_location()[1])
console.log(getIndex())
console.log(dock_location[getIndex()])
console.log(dock_location) */

const storage_location = () => {
    return getIndex()
}

console.log(storage_location())

//console.log(select_storage_location()[1])

const Move_Load_location = () => {
    MoveTo(Load_location.x, Load_location.y, 60)
}

const Move_Unload_location = () => {
    MoveTo(Unload_location.x, Unload_location.y, 60)
}

const Move_Reset_location = () => {
    MoveTo(reset_location.x, reset_location.y, reset_location)
}

const Move_dock_location = (i,mode) => {
    let z
    if(mode === "load"){
        z = (dock_location[i].storage.length * package_height) + package_height + 2
}
    if(mode === "unload"){
        z = (dock_location[i].storage.length * package_height)
    }
    MoveTo(dock_location[i].x, dock_location[i].y, z)
} 

module.exports = {Move_Load_location, Move_Unload_location, Move_dock_location, dock_location, storage_location, Move_Reset_location}