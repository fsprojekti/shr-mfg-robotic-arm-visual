let task_queue = []

const dispatch = (offerId, mode) => {
    let task = {offerId:offerId, mode: mode}
    task_queue.push(task)
}

/* dispatch(1,"unload")
dispatch(2,"load")
console.log(task_queue[0]) */

module.exports = {task_queue, dispatch}