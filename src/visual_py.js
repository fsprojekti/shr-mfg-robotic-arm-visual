const {getState} = require("./httpAPI");
const {downloadImage, url, file_path} = require("./visual");
const {delay} = require("./location");
const exec = require('child_process').exec;

//detect april tag id
const getId = async () => {
    await downloadImage(url, file_path);
    await delay(500);
    return new Promise((resolve) => {
        exec('python aprilTag.py', async (error, stdout) => {
            resolve(stdout);
        })
    })
}

// get coordinate center ellipse and his area size
const getImageDataPy = async () => {
    await downloadImage(url, file_path);
    await delay(500);
    return new Promise((resolve) => {
        exec('python visual.py', async (error, stdout) => {
            resolve(stdout);
        })
    })
}

// parse data from python script
const imageProcessingPy = async () => {
    let data = 0;
    await getImageDataPy().then(d => {
        data = JSON.parse(d);
    }).catch(error => {
        console.error(error);
    })
    await delay(200);
    if (data !== undefined) {
        return data;
    } else {
        return console.log("Package not find");
    }
}

// get  data area size
const calculateHeightPy = async () => {
    let S;
    S = await imageProcessingPy();
    console.log(S);
    await delay(1000);
    console.log(S.S);
    return (S.S);
}
// calculate number of packages in the dock under the camera
const getNumberOfPackagesPy = async (S) => {
    if (S >= 47555.8 * 0.95 && S <= 47555.8 * 1.05) {
        return 1;
    } else if (S >= 54495.3257 * 0.95 && S <= 54495.3257 * 1.05) {
        return 2;
    } else if (S >= 61934.139 * 0.95 && S <= 61934.139 * 1.05) {
        return 3;
    } else if (S >= 70604.76 * 0.95 && S <= 70604.76 * 1.05) {
        return 4;
    } else if (S >= 82578.91 * 0.95 && S <= 82578.91 * 1.05) {
        return 5;
    } else {
        return console.log("package not find");
    }
}

//calculate dx and dy to move robot
const getCenterPy = async (k = 0.305) => {
    let current_x = 0, current_y = 0, o;
    await getState((d) => {
        //console.log(d)
        //console.log(state_data)
        current_x = d.x
        current_y = d.y
    })
    await delay(200);

    o = Math.atan(current_y * -1 / current_x);

    let center = await imageProcessingPy();
    console.log("center_pixel：" + JSON.stringify(center));
    let dx_center = ((640 / 2) - center.x_c) * k;

    let dy_center = ((480 / 2) - center.y_c) * (k);
    let d = {
        x: dx_center * Math.cos(o) + dy_center * Math.sin(o),  // +dy;
        y: dx_center * Math.sin(o) - dy_center * Math.cos(o)
    } // -dy
    console.log("first angle :", o * 180 / Math.PI);
    console.log(d);
    return d;
}

module.exports = {getCenterPy, getNumberOfPackagesPy, calculateHeightPy, getId, imageProcessingPy}