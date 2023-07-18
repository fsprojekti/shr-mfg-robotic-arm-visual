const {task_queue} = require("./task");
const {
    moveToLoadLocation, moveToUnloadLocation, moveToDockLocation, moveToDispatchBuffer, moveToReceiveBuffer,
    moveToResetLocation, receive_buffer, dispatch_buffer, storage_location, dock_location, unload_location, delay,
    saveDataToJSONFile, package_height} = require("./location");
const {suction, move, moveTo} = require("./httpAPI");
const circle = require("./visual");
const {getId, getCenterPy, calculateHeightPy, getNumberOfPackagesPy} = require("./visual_py");
const {
    offer, removeOffer, getPackageData, saveOfferToJSONFile, getIndexOfId, addOffer, reversePackage,
    editOffer, pushPackage
} = require("./offer");

let temp_array2 = [];
let eth_data = {
    id: 0,
    location: 0,
    package: []
};
let state_eth = {
    add_eth: false,
    remove_eth: false,
    edit_eth: false
};
const moveFromLoadLocationToReceiveBuffer = async (offer_id) => {
    let at_id, n_p, S;
    let dx1, dy1, dx, dy;
    // move to location to fetch package
    console.log("moving to load location ... ");
    await moveToLoadLocation(200);
    // calculate dx and dy needed to move robot to collinear center camera and package center in z coordinate
    console.log("getting package center ...");
    await getCenterPy().then((data) => {
        dx1 = data.x
        dy1 = data.y
    });
    console.log("package center: ");
    console.log(dx1 + ", " + dy1)
    console.log("relative move to correct the position of the robot arm ...");
    await move(dx1, dy1, 0)
    await delay(1000);
    //get area size ellipse twice,
    //for solution afterimage image
    console.log("calculating height...");
    // await calculateHeightPy();
    S = await calculateHeightPy();
    console.log("value returned from calculateHeightPy: ");
    console.log(S);
    // get number of packages in load location
    try {
        console.log("get number of packages in the dock (based on the \"height\" od the dock that is represented with the area size of the package ..." );
        n_p = await getNumberOfPackagesPy(S);
        console.log(n_p);
    } catch (e) {
        console.log(e);
    }
    console.log("package height:", n_p)
    if (n_p === undefined || n_p === 0) {
        return console.log("package not found");
    }
    // add new offer
    try {
        await addOffer(offer_id, "receive buffer")
    } catch (e) {
    }
    let c = 0;
    let absx, absy;
    for (n_p; n_p >= 1; n_p--) {

        let h = (200 - (n_p - 1) * package_height);
        // its height to need on top of package for calculate dx and dy
        let s = (h - 100) * -1;
        console.log("move to the height where offset for package center will be calculated ...");
        await move(0, 0, s);
        await delay(1500);
        // calculate just first time in task
        if (c === 0) {
            console.log("get current center ...");
            await getCenterPy(0.17).then(d => {
                dx = d.x;
                dy = d.y;
                c++;
            })
            console.log("move the robot arm to the center of the package ...");
            await move(dx, dy, 0);
            await delay(1000);
            //save abs. coordinate
            absx = 135 + dx1 + dx;
            absy = -135 + dy1 + dy;
            console.log("absolute coordinates for the first package in load location: " + absx + ", " + absy);
        }
        console.log("absolute coordinates for the next package in load location: " + absx + ", " + absy);
        //get apriltag id
        console.log("get aprilTag id ...");
        at_id = await getId();
        console.log("aprilTag id: " + at_id);
        //offset suction and camera
        console.log("move robotic arm to consider the offset between the camera and the suction cup ...");
        await circle.offsetToll();
        await delay(1500);
        console.log("package Id:", Number(at_id));
        console.log("move down 35 mm ...");
        await move(0, 0, -35);
        await delay(1500);
        console.log("suction on ...");
        await suction(true);
        await delay(1500);
        console.log("move up 60 mm ...");
        await move(0, 0, 60);
        await delay(1500);
        //move to receive buffer
        console.log("move to receive buffer ...");
        await moveToReceiveBuffer("load");
        console.log("move down 20 mm ...");
        await move(0, 0, -20);
        await delay(1000);
        console.log("suction off ...");
        await suction(false);
        await delay(2000);
        console.log("move up 60 mm ...");
        await move(0, 0, 60);
        await delay(1500);
        console.log("check if there is more than 1 package in the load location ...");
        if (n_p !== 1) {
            console.log("there is still some package in the load location");
            console.log("move to: " + absx + ", " + absy + ", " + 200);
            await moveTo(absx, absy, 200);
            await delay(1500);
        }

        // push package id to array
        try {
            await pushPackage(offer_id, Number(at_id));
        } catch (e) {
        }
        receive_buffer.storage.push(Number(at_id));
    }
    return 1;
}

//move from receive buffer to dock location
const moveFromReceiveBufferToDockLocation = async (offer_id) => {
    try {
        let i = receive_buffer.storage.length;
        console.log(i);
        let location = storage_location();
        for (i; i >= 1; i--) {
            await moveToReceiveBuffer("unload");
            await move(0, 0, -20);
            await delay(1000);
            await suction(true);
            await delay(1500);
            await move(0, 0, 60);
            await delay(1500);
            await moveToDockLocation(location, "load");
            await move(0, 0, -20);
            await delay(1000);
            await suction(false);
            await delay(2000);
            await move(0, 0, 60);
            await delay(2000);
            try {
                dock_location[location].storage.push(receive_buffer.storage.pop());
            } catch (e) {
                console.log(e);
            }
            console.log(dock_location[location].storage);
            try {
                await editOffer(offer_id, location);
            } catch (e) {
            }
        }
        await reversePackage(Number(offer_id));
    } catch (e) {
    }
}

//move from dock location to dispatch buffer
const moveFromDockLocationToDispatchBuffer = async (i) => {
    await moveToDockLocation(i, "unload");
    await move(0, 0, -20);
    await delay(1000);
    await suction(true);
    await delay(1500);
    await move(0, 0, 60);
    await delay(1500);
    await moveToDispatchBuffer("load");
    await move(0, 0, -20);
    await delay(1000);
    await suction(false);
    await delay(2000);
    await move(0, 0, 60);
}

//move from dispatch buffer to unload location
const moveFromDispatchBufferToUnloadLocation = async () => {
    await moveToDispatchBuffer("unload");
    await move(0, 0, -20);
    await delay(1000);
    await suction(true);
    await delay(1500);
    await move(0, 0, 60);
    await delay(1500);
    await moveToUnloadLocation();
    await move(0, 0, -20);
    await delay(1000);
    await suction(false);
    await delay(2000);
    await move(0, 0, 60);
}

//process tasks in queue
const processTask = async () => {
    if (task_queue[0] !== undefined) {
        if (task_queue[0].mode === "load") {
            // move package from transport car to receive buffer
            console.log("moving from load location to receive buffer ...");
            let step1 = await moveFromLoadLocationToReceiveBuffer(Number(task_queue[0].offerId));
            if (step1 !== 1) {
                return console.log("Step 1 error.");
            }
            else {
                console.log("Step 1: " + step1);
            }

            // move package from receive buffer to dock
            console.log("moving from receive buffer to dock location ...");
            await moveFromReceiveBufferToDockLocation(Number(task_queue[0].offerId));
            console.log("moving to reset location ...");
            await moveToResetLocation();
            //remove task from task queue 
            let id = Number(task_queue[0].offerId);
            let index = await getIndexOfId(id);

            let eth_id = offer[index].id;
            let eth_location = offer[index].location;
            let eth_package = offer[index].packageID;
            eth_data.id = eth_id;
            eth_data.location = eth_location;
            eth_data.package = eth_package;
            // console.log(eth_data);
            state_eth.add_eth = true;
            try {
                await task_queue.shift();
                //save data
                await saveDataToJSONFile();
                await saveOfferToJSONFile();
                await delay(1000);
                console.log("task done");
            } catch (e) {
                console.log("error saving data/offer to JSON file");
                // console.log(e);
            }

        } else if (task_queue[0].mode === "unload") {
            // check if offer id exists
            let packageData, packageData_len;
            try {
                packageData = await getPackageData(Number(task_queue[0].offerId));
                packageData_len = packageData.length;
                console.log("package length: ", packageData_len);
                console.log(packageData[packageData_len - 1]);
            } catch (e) {
                console.log("Offer Id :", task_queue[0].offerId, " doesn't exist.");
                return task_queue.shift();
            }
            // find i = dock location; and find j = level
            let i, j;
            for (i = 1; i <= 4; i++) {
                let found = 0;
                let dock_lent = dock_location[i].storage.length;
                for (dock_lent; dock_lent >= 1; dock_lent--) {
                    if (dock_location[i].storage[dock_lent - 1] === packageData[packageData_len - 1]) {
                        j = dock_lent - 1;
                        found = 1;
                        console.log(j);
                        break;
                    }
                }
                // when it is found, break this for loop
                if (found === 1) {
                    break;
                }
            }
            //when offer id is found
            if (j !== -1) {
                // check if OfferId package in the highest level
                if (j === (dock_location[i].storage.length - 1)) {
                    //move from dock location to dispatch buffer
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await moveFromDockLocationToDispatchBuffer(i);
                        await moveToResetLocation();
                        dispatch_buffer.storage.push(dock_location[i].storage.pop());
                    }
                    let dl = dispatch_buffer.storage.length;

                    //move from dispatch buffer to unload area
                    for (dl; dl >= 1; dl--) {
                        await moveFromDispatchBufferToUnloadLocation(i);
                        await move(0, 0, 100);
                        await delay(1500);
                        unload_location.storage.push(dispatch_buffer.storage.pop());
                    }
                    //await removeOffer(task_queue[0].offerId)
                    await moveToResetLocation();
                    await removeOffer(Number(task_queue[0].offerId));
                    eth_data.id = Number(task_queue[0].offerId);
                    state_eth.remove_eth = true;
                    // console.log(eth_data);
                    await task_queue.shift();
                    unload_location.storage = [];
                    await delay(1000);
                    await saveDataToJSONFile();
                    await saveOfferToJSONFile();
                    console.log("task done");
                }
                //when offer is not in the highest level
                else {
                    // calculate how many package need to remove to get target package
                    let k = dock_location[i].storage.length - 1 - j;
                    let temp_level = 0;
                    // remove package on the target package
                    for (let l = 0; l <= k - 1; l++) {
                        await moveToDockLocation(i, "unload");
                        await move(0, 0, -22);
                        await delay(1000);
                        await suction(true);
                        await delay(1500);
                        await move(0, 0, 60);
                        await delay(1500);
                        // temp area
                        await moveTo(0, -120, 60 + (package_height * l) + package_height + 20);
                        await delay(2000);
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(false);
                        await delay(2000);
                        await move(0, 0, 100);
                        await delay(1500);
                        temp_array2.push(dock_location[i].storage.pop());
                        temp_level++;
                    }
                    // move target package to unload area
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await moveFromDockLocationToDispatchBuffer(i)
                        await move(0, 0, 100)
                        await delay(1500)
                        dispatch_buffer.storage.push(dock_location[i].storage.pop())
                    }
                    let dl = dispatch_buffer.storage.length;
                    for (dl; dl >= 1; dl--) {
                        await moveFromDispatchBufferToUnloadLocation(i);
                        await move(0, 0, 100);
                        await delay(1500);
                        unload_location.storage.push(dispatch_buffer.storage.pop());
                    }
                    //await removeOffer(task_queue[0].offerId)
                    await removeOffer(Number(task_queue[0].offerId));
                    unload_location.storage = [];
                    await delay(1000);
                    // restore package in temp area
                    let temp_let_for = JSON.parse(JSON.stringify(temp_level));
                    for (let n = 0; n < temp_let_for; n++) {
                        await moveTo(0, -120, 53 + (package_height * temp_level) + 20);
                        await delay(2000);
                        await move(0, 0, -20);
                        await delay(1500);
                        await suction(true);
                        await delay(1500);
                        await move(0, 0, 60);
                        await delay(1500);
                        await moveToDockLocation(i, "load");
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(false);
                        await delay(2000);
                        await move(0, 0, 60);
                        await delay(1500);
                        await moveToResetLocation();
                        dock_location[i].storage.push(temp_array2.pop());
                        await delay(1000);
                        temp_level--;
                    }
                    // task finish
                    eth_data.id = Number(task_queue[0].offerId);
                    state_eth.remove_eth = true;
                    await task_queue.shift();
                    await delay(1000);
                    await saveDataToJSONFile();
                    await saveOfferToJSONFile();
                    console.log("task done");
                }
            }
        }
        //its similar code mode "unload"
        else if (task_queue[0].mode === "relocation") {
            let packageData, packageData_len;
            try {
                packageData = await getPackageData(Number(task_queue[0].offerId));
                packageData_len = packageData.length;
                console.log("package length: ", packageData_len);
                console.log(packageData[packageData_len - 1]);
            } catch (e) {
                console.log("Offer Id :", task_queue[0].offerId, "doesn't exist.");
                return task_queue.shift();
            }
            // i = dock location; j = level
            let i, j;
            for (i = 1; i <= 4; i++) {
                let found = 0;
                let dock_lent = dock_location[i].storage.length;
                for (dock_lent; dock_lent >= 1; dock_lent--) {
                    if (dock_location[i].storage[dock_lent - 1] === packageData[packageData_len - 1]) {
                        j = dock_lent - 1;
                        found = 1;
                        console.log(j);
                        break;
                    }
                }
                if (found === 1) {
                    break;
                }
            }
            if (j !== -1) {
                // check if OfferId package in the highest level 
                if (j === (dock_location[i].storage.length - 1)) {
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await moveToDockLocation(i, "unload");
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(true);
                        await delay(1500);
                        await move(0, 0, 60);
                        await delay(1500);
                        await moveToDockLocation(task_queue[0].location, "load");
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(false);
                        await delay(2000);
                        await move(0, 0, 100);
                        await delay(1000);
                        dock_location[task_queue[0].location].storage.push(dock_location[i].storage.pop());
                        await delay(1000);
                    }
                    let Offerid = (Number(task_queue[0].offerId));
                    await editOffer(Number(task_queue[0].offerId), Number(task_queue[0].location));
                    console.log(Offerid);
                    await reversePackage(Offerid);
                    await moveToResetLocation();
                    let eth_id = Number(task_queue[0].offerId);
                    let eth_location = Number(task_queue[0].location);
                    eth_data.id = eth_id;
                    eth_data.location = eth_location;
                    state_eth.edit_eth = true;
                    await task_queue.shift();
                    await saveDataToJSONFile();
                    await saveOfferToJSONFile();
                    console.log("task done");
                } else {
                    // calculate how many package need to remove to get target package
                    let k = dock_location[i].storage.length - 1 - j;
                    let temp_level = 0;
                    // remove package on the target package
                    for (let l = 0; l <= k - 1; l++) {
                        await moveToDockLocation(i, "unload");
                        await move(0, 0, -22);
                        await delay(1000);
                        await suction(true);
                        await delay(1500);
                        await move(0, 0, 60);
                        await delay(1500);
                        // temp area
                        await moveTo(0, -120, 60 + (package_height * l) + package_height + 20);
                        await delay(2000);
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(false);
                        await delay(2000);
                        await move(0, 0, 100);
                        await delay(1500);
                        temp_array2.push(dock_location[i].storage.pop());
                        temp_level++;
                    }
                    // move target package to target location
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await moveToDockLocation(i, "unload");
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(true);
                        await delay(1500);
                        await move(0, 0, 60);
                        await delay(1500);
                        await moveToDockLocation(task_queue[0].location, "load");
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(false);
                        await delay(2000);
                        await move(0, 0, 100);
                        await delay(1000);
                        dock_location[task_queue[0].location].storage.push(dock_location[i].storage.pop());
                        await delay(1000);
                    }
                    let Offerid = (Number(task_queue[0].offerId));
                    await editOffer(Number(task_queue[0].offerId), Number(task_queue[0].location));
                    console.log(Offerid);
                    await reversePackage(Offerid);

                    // restore package of temp area
                    let temp_let_for = JSON.parse(JSON.stringify(temp_level));
                    for (let n = 0; n < temp_let_for; n++) {
                        await moveTo(0, -120, 53 + (package_height * temp_level) + 20);
                        await delay(2000);
                        await move(0, 0, -20);
                        await delay(1500);
                        await suction(true);
                        await delay(1500);
                        await move(0, 0, 60);
                        await delay(1500);
                        await moveToDockLocation(i, "load");
                        await move(0, 0, -20);
                        await delay(1000);
                        await suction(false);
                        await delay(2000);
                        await move(0, 0, 100);
                        await delay(1500);
                        dock_location[i].storage.push(temp_array2.pop());
                        await delay(1000);
                        temp_level--;
                    }
                    // task finish
                    await moveToResetLocation();
                    let eth_id = Number(task_queue[0].offerId);
                    let eth_location = Number(task_queue[0].location);
                    eth_data.id = eth_id;
                    eth_data.location = eth_location;
                    state_eth.edit_eth = true;
                    await task_queue.shift();
                    await delay(1000);
                    await saveDataToJSONFile();
                    await saveOfferToJSONFile();
                    console.log("task done");
                }
            }
        } else {
            await task_queue.shift();
            console.log("Invalid task");
        }
    } else {
        console.log("No task in queue");
    }
}

module.exports = {processTask, moveFromLoadLocationToReceiveBuffer, moveFromReceiveBufferToDockLocation, eth_data, state_eth};