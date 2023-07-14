const {moveTo} = require("./httpAPI");
const fs = require("fs");

//define coordinate every location
const dock_file_path = "./dock.json";
let data = JSON.parse(fs.readFileSync(dock_file_path).toString());
const package_height = data.package_height;
//location,where should AVG wait for unload package
const load_location = {x: data.load_location.x, y: data.load_location.y};

//location, where should AVG wait for load package
const unload_location = {x: data.unload_location.x, y: data.unload_location.y, storage: data.unload_location.storage};

//location, where should robot arm stay, when task done
const reset_location = {x: data.reset_location.x, y: data.reset_location.y, z: data.reset_location.z};
const dock_location = [];
//intermediate location for storing package
const receive_buffer = {x: data.receive_buffer.x, y: data.receive_buffer.y, storage: data.receive_buffer.storage};
//intermediate location for unloading packages from warehouse
const dispatch_buffer = {x: data.dispatch_buffer.x, y: data.dispatch_buffer.y, storage: data.dispatch_buffer.storage};
//locations for storing packages
dock_location[1] = {x: data.dock_location1.x, y: data.dock_location1.y, storage: data.dock_location1.storage};
dock_location[2] = {x: data.dock_location2.x, y: data.dock_location2.y, storage: data.dock_location2.storage};
dock_location[3] = {x: data.dock_location3.x, y: data.dock_location3.y, storage: data.dock_location3.storage};
dock_location[4] = {x: data.dock_location4.x, y: data.dock_location4.y, storage: data.dock_location4.storage};

// used for sorting size dock
let temp_array = [];

console.log(dock_location);

// save dock data
const saveDataToJSONFile = async () => {
    let dock = {
        dock_location1: {x: dock_location[1].x, y: dock_location[1].y, storage: dock_location[1].storage},
        dock_location2: {x: dock_location[2].x, y: dock_location[2].y, storage: dock_location[2].storage},
        dock_location3: {x: dock_location[3].x, y: dock_location[3].y, storage: dock_location[3].storage},
        dock_location4: {x: dock_location[4].x, y: dock_location[4].y, storage: dock_location[4].storage},
        receive_buffer: {
            x: receive_buffer.x,
            y: receive_buffer.y,
            storage: receive_buffer.storage
        },
        dispatch_buffer: {
            x: dispatch_buffer.x,
            y: dispatch_buffer.y,
            storage: dispatch_buffer.storage
        }
    };
    let save_data = JSON.stringify(dock);
    fs.writeFileSync(dock_file_path, save_data);
}
//save_data_to_JSON_file()

//order LOW to HIGH --> storage level
const selectStorageLocation = () => {
    for (let i = 1; i <= 4; i++) {
        temp_array[i] = JSON.parse(JSON.stringify(dock_location[i]));
    }

    for (let i = 1; i <= 4; i++) {
        for (let j = 1; j <= 4 - i; j++) {
            if (temp_array[j].storage.length > temp_array[j + 1].storage.length) {
                let temp = temp_array[j + 1];
                temp_array[j + 1] = temp_array[j];
                temp_array[j] = temp;
            }
        }
    }
    //console.log(temp_array)
    return temp_array;
}

// get index of the first object in the ordered array
const getIndex = () => {
    for (let i = 1; i <= 4; i++) {
        if (temp_array[1].x === dock_location[i].x &&
            temp_array[1].y === dock_location[i].y) {
            return i;
        }
    }
}

const storageLocation = () => {
    selectStorageLocation();
    return getIndex();
}

// delay for ms
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//move to load_location
const moveToLoadLocation = async (z = 100) => {
    await moveTo(load_location.x, load_location.y, z);
    await delay(2000);
}

//move to dispatch buffer
const moveToDispatchBuffer = async (mode) => {
    let z;
    //when robot arm has package on suction
    if (mode === "load") {
        z = (dispatch_buffer.storage.length * package_height) + package_height + 20 + 60;
    }
    //when robot arm does not have package on suction
    if (mode === "unload") {
        z = (dispatch_buffer.storage.length * package_height) + 53 + 20;
    }
    await moveTo(dispatch_buffer.x, dispatch_buffer.y, z);
    await delay(3000);
}

const moveToReceiveBuffer = async (mode) => {
    let z;
    //when robot arm has package on suction
    if (mode === "load") {
        z = (receive_buffer.storage.length * package_height) + package_height + 20 + 60;
    }
    //when robot arm does not have package on suction
    if (mode === "unload") {
        z = (receive_buffer.storage.length * package_height) + 53 + 20;
    }
    await moveTo(receive_buffer.x, receive_buffer.y, z);
    await delay(3000);
}

const moveToUnloadLocation = async () => {
    let z = (unload_location.storage.length * package_height) + package_height + 20 + 60;

    await moveTo(unload_location.x, unload_location.y, z);
    await delay(2500);
}

const moveToResetLocation = async () => {
    await moveTo(reset_location.x, reset_location.y, reset_location.z);
    await delay(2000);
}

const moveToDockLocation = async (i, mode) => {
    let z;
    //when robot arm have package on suction
    if (mode === "load") {
        z = (dock_location[i].storage.length * package_height) + package_height + 20 + 60;
    }
    //when robot arm have not package on suction
    if (mode === "unload") {
        z = (dock_location[i].storage.length * package_height) + 53 + 20;
    }
    console.log("x: ", dock_location[i].x, "y:", dock_location[i].y, "z:", z);

    await moveTo(dock_location[i].x, dock_location[i].y, z);
    await delay(2500);
}

module.exports = {
    moveToLoadLocation, moveToUnloadLocation,
    moveToDockLocation, dock_location, storageLocation, moveToResetLocation,
    temp_array, delay, saveDataToJSONFile, getIndex, package_height,
    moveToDispatchBuffer, moveToReceiveBuffer, unload_location, receive_buffer, dispatch_buffer
};