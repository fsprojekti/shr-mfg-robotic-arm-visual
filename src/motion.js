const {task_queue} = require("./task")
const {Move_Load_location,
     Move_Unload_location, delay, 
      Move_dock_location,
       dock_location, temp_array, storage_location, Move_Reset_location,save_data_to_JSON_file} = require("./location")
const {suction,Move, MoveTo} = require("./http-API")
const circle = require("./visual")

const robot_auto =async () => {
    if(task_queue[0] !== undefined) {
        if(task_queue[0].mode === "load"){
            var dx, dy
            await Move_Load_location()
            await circle.getCenter()
            await circle.getCenter().then((data) => {
                dx = data.x
                dy = data.y
            })
            await delay(1000)
            await Move(dx,dy,-20)
            await delay(1000)
            await circle.offsetToll() 
            await delay(1500)
            await Move(0,0,-15)
            await delay(1000)
            await suction(true)
            await Move_dock_location(storage_location(),"load")
            await Move(0,0,-20)
            await delay(1000)
            await suction(false)
            await Move(0,0,20)
            await Move_Reset_location()
            await dock_location[storage_location()].storage.push(task_queue[0].offerId)
            await task_queue.shift()
            await save_data_to_JSON_file()
            await delay(1000)
            console.log("task done")
        }
        else if(task_queue[0].mode === "unload"){
            // i = dock location; j = level
            var i,j
            for(i =1; i<=4 ; i++){
                if(dock_location[i].storage.indexOf(task_queue[0].offerId) !== -1){
                    j = dock_location[i].storage.indexOf(task_queue[0].offerId)
                    break
                } else{ 
                    j=-1
                    console.log("offerId: ", task_queue[0].offerId, ",don't exsist.")
                }
            }
            if(j !== -1) {
                // check if OfferId package in the highest level 
                if(j === (dock_location[i].storage.length - 1)){
                    await Move_dock_location(i,"unload")
                    await Move(0,0,-20)
                    await delay(1000)
                    await suction(true)
                    await Move(0,0,20)
                    await delay(1000)
                    await Move_Unload_location()
                    await suction(false)
                    await Move(0,0,20)
                    await delay(1000)
                    await Move_Reset_location()
                    await dock_location[i].storage.pop()
                    await task_queue.shift()
                    await delay(1000)
                    await save_data_to_JSON_file()
                    console.log("task done")
                }
                else {
                    // calculate how many package need to remove to get target package
                    var k = dock_location[i].storage.length - 1 - j
                    var temp_level = 0
                    var temp_var_for = JSON.parse(JSON.stringify(temp_level))
                    // remove package on the target package
                    for(var l = 0; l<=k-1; l++){
                        await Move_dock_location(i,"unload")
                        await Move(0,0,-20)
                        await delay(1000)
                        await suction(true)
                        await Move(0,0,20)
                        await delay(1000)
                        // temp area
                        //70 -> tool height, 20 -> distance for prevention collision
                        // 12 package height
                        await MoveTo(0, -100, 70 + (12*l) + 12 + 20)
                        await Move(0,0,-20)
                        await delay(1000)
                        await suction(false)
                        await Move(0,0,20)
                        await Move_Reset_location()
                        await temp_array.push(dock_location[i].storage.pop())
                        temp_level++
                    }
                    // move target package to unload area
                    await Move_dock_location(i,"unload")
                    await Move(0,0,-20)
                    await delay(1000)
                    await suction(true)
                    await Move(0,0,20)
                    await Move_Unload_location()
                    await suction(false)
                    await Move(0,0,20)
                    await delay(1000)
                    await Move_Reset_location()
                    await dock_location[i].storage.pop()
                    await delay(1000)

                    // resotre package in temp area
                    for(var n = 0; n <= temp_var_for - 1 ; n++){
                        await MoveTo(0, -100, 70 + (12 * temp_level) + 12 + 20)
                        await Move(0,0,-20)
                        await delay(1000)
                        await suction(true)
                        await Move(0,0,20)
                        await delay(1000)
                        await Move_dock_location(storage_location(),"load")
                        await Move(0,0,-20)
                        await delay(1000)
                        await suction(false)
                        await Move(0,0,20)
                        await delay(1000)
                        await Move_Reset_location()
                        await dock_location[storage_location()].storage.push(temp_array.pop())
                        temp_level--
                    }
                    // task finish
                    await task_queue.shift()
                    await delay(1000)
                    await save_data_to_JSON_file()
                    console.log("task done")
                }
                
            }

        }

        
    }
    else{console.log("No task in queue")}
}

module.exports = {robot_auto}