const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { writeFileSync} = require("fs");
const path = require('path');
const configIp = require("../config.json")

const puppeteer = require('puppeteer');
const { config } = require('process');

const file_path = path.resolve(__dirname,"../public/image/input.jpg") 
const file_path_out = path.resolve(__dirname,"../public/image/output.jpg")

installDOM();
loadOpenCV(); 

async function snapshot() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ // 设置视窗大小
    width: 640,
    height: 480
  });
  await page.goto('http://'+configIp.roboticArmIpAddress+':8080/snapshot?topic=/usb_cam/image_rect_color'); // 打开页面
  //await page.goto('https://socket.io/docs/v3/emitting-events/')
  await page.screenshot({path: file_path }); // path: 截屏文件保存路径

  await browser.close();
}

const imageProcessing = async () => {
  try{
    let x;
    let y;   
    const image = await loadImage(file_path);
    let src = await cv.imread(image);
    let dst = await cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
    let circles = await new cv.Mat();
    let color = await new cv.Scalar(255, 255, 255);
    await cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    /* let low = new cv.Mat(src.rows, src.cols, src.type(), [0, 43, 46, 0]);
    let high = new cv.Mat(src.rows, src.cols, src.type(), [10, 255,255, 255]);
    cv.inRange(src, low, high, src); */
    await cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
                    1, 300, 75, 30, 135, 155);
    // draw circles
    for (let i = 0; i < circles.cols; ++i) {
        x = circles.data32F[i * 3];
        y = circles.data32F[i * 3 + 1];
        let radius = circles.data32F[i * 3 + 2];
        let center = new cv.Point(x, y);
        cv.circle(dst, center, radius, color);
    }
    const canvas = await createCanvas(640, 480);
    cv.imshow(canvas, dst);
    writeFileSync(file_path_out, canvas.toBuffer('image/jpeg'));
    await src.delete(); await dst.delete(); await circles.delete();
    let msg = { x: x, y: y}
    //console.log(msg)
    return msg
  } catch(e) {
    console.log(e)
  }
}

const getCenter = async () => {

  await snapshot();
  let center = await imageProcessing();
  console.log("center：" + JSON.stringify(center));
  return JSON.stringify(center)
}

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

  module.exports = {getCenter}