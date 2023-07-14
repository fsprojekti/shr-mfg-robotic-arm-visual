const {Canvas, Image, ImageData} = require('canvas');
const {JSDOM} = require('jsdom');
// const {writeFileSync} = require("fs");
const path = require('path');
const configIp = require("../config.json")
const axios = require("axios")
const fs = require("fs")
const {getState, move} = require("./httpAPI");
const {delay} = require("./location");


//url to get image
const url = 'http://' + configIp.roboticArmIpAddress + ':8080/snapshot?topic=/usb_cam/image_rect_color'
const file_path = path.resolve(__dirname, "../public/image/input.jpg")
// const file_path_out = path.resolve(__dirname, "../public/image/output.jpg")

installDOM();
loadOpenCV();

//download image from url
const downloadImage = async () => {
    console.log("downloading image from " + url + " to " + file_path);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(file_path))
            .on('error', reject)
            .once('close', () => resolve(file_path))
    })
}

// find circle in image. 
//now in program is using python script to find ellipse.
// so this function is no longer to use
// const imageProcessing = async () => {
//     try {
//         let x = 0;
//         let y = 0;
//         // const image = await loadImage(file_path);
//         let src = await cv.imread(file_path);
//         let dst = await cv.Math.zeros(src.rows, src.cols, cv.CV_8U);
//         let circles = await new cv.Math();
//         let color = await new cv.Scalar(255, 0, 0);
//         await cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
//         await cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
//             1, 1000, 50, 70, 75, 140);
//         // draw circles
//         for (let i = 0; i < circles.cols; ++i) {
//             x = circles.data32F[i * 3];
//             y = circles.data32F[i * 3 + 1];
//             let radius = circles.data32F[i * 3 + 2];
//             let center = new cv.Point(x, y);
//             cv.circle(dst, center, radius, color);
//         }
//         const canvas = await createCanvas(640, 480);
//         cv.imshow(canvas, dst);
//         writeFileSync(file_path_out, canvas.toBuffer('image/jpeg'));
//         await src.delete();
//         await dst.delete();
//         await circles.delete();
//         //console.log(msg)
//         return {x: x, y: y}
//     } catch (e) {
//         console.log("error doing imageProcessing function");
//         // console.log(e);
//     }
// }

// calculate dx and dy to move robot by detection circle.
// no longer in use
// const getCenter = async () => {
//
//     let current_x = 0, current_y = 0, o;
//     await getState((d) => {
//         current_x = d.x
//         current_y = d.y
//     })
//     await delay(200);
//     // await snapshot()
//     await downloadImage(url, file_path);
//     console.log("image downloaded");
//
//     o = Math.atan(current_y * -1 / current_x);
//     //
//     let center = await imageProcessing();
//     console.log("image processed");
//     console.log("center_pixel：" + JSON.stringify(center));
//     // let dx_center = ((640 / 2) - center.x) * 0.15;
//     // let dy_center = ((480 / 2) - center.y) * 0.2;
//     // let d = {
//     //     x: dx_center * Math.cos(o) + dy_center * Math.sin(o),  // +dy
//     //     y: dx_center * Math.sin(o) - dy_center * Math.cos(o)
//     // } // -dy
//     // console.log("first angle :", o * 180 / Math.PI);
//     // console.log(d);
//     // return d;
// }

// move robot for offset between camera and suction
const offsetToll = async () => {
    let current_x, current_y, o;
    await getState((d) => {
        current_x = d.x;
        current_y = d.y;
    })
    await delay(200);
    o = Math.atan(current_y * -1 / current_x);
    console.log("middleware angle", o * 180 / Math.PI);
    await move(Math.cos(o) * 50, (-1) * Math.sin(o) * 49, 0);
}

// call opencv.js file
function loadOpenCV() {
    return new Promise(resolve => {
        global.Module = {
            onRuntimeInitialized: resolve
        };
        global.cv = require('./opencv.js');
    });
}

function installDOM() {
    const dom = new JSDOM();
    global.document = dom.window.document;
    // The rest enables DOM image and canvas and is provided by node-canvas
    global.Image = Image;
    global.HTMLCanvasElement = Canvas;
    global.ImageData = ImageData;
    global.HTMLImageElement = Image;
}

module.exports = {downloadImage, offsetToll}