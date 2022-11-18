let robot_busy = true

let task_queue = []

function tasks(offerId, mode) {
    this.mode = mode
    this.offerId = offerId
}

const dispatch = (offerId, mode) => {
    let task = new tasks(offerId, mode)
    task_queue.push(task)
}

/* dispatch(1,"unload")
dispatch(2,"load")
console.log(task_queue[0])  */

module.exports = { robot_busy, task_queue}