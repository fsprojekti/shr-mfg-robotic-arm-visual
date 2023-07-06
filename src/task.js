//define array for task queue 
let task_queue = [];

//define struct for dispatch task 
const dispatch = (offerId, mode, location) => {
    if (location === undefined || location === "") {
        let task = {offerId: offerId, mode: mode};
        task_queue.push(task);

    } else {
        let task = {offerId: offerId, mode: mode, location: location};
        task_queue.push(task);
    }
}

module.exports = {task_queue, dispatch}