const {robot_busy, task_queue} = require("./task")
const {Move_Load_location,
     Move_Unload_location,
      Move_dock_location,
       dock_location, storage_location, Move_Reset_location} = require("./location")
const {suction} = require("./http-API")

const robot_auto = () => {
    if(task_queue[0] !== undefined && robot_busy !== true) {
        if(task_queue[0].mode === "load"){
            robot_busy = true
            Move_Load_location()
            suction(true)
            Move_dock_location(storage_location(),"load")
            suction(false)
            Move_Reset_location()
            dock_location[storage_location()].push(task_queue[0].offerId)
            robot_busy = false
        }
        else if(task_queue[0].mode === "unload"){
            /* robot_busy = true
            Move_dock_location(offerId,"unload")
            suction(true)
            Move_Unload_location()
            suction(false)
            Move_Reset_location()      
            dock_location[storage_location()].push(task_queue[0].offerId)
            robot_busy = false   */
        }

        
    }
    else{console.log(false)}
}