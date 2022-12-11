const { MoveTo ,getState} = require("./http-API")
const { download_image ,url,file_path} = require("./visual")
const {delay} =require("./location")
const exec = require('child_process').exec
//detect april tag id
const getId =async () => {
    await download_image(url,file_path)
    await delay(500)
    return new Promise((resolve,reject) => {
      exec('python aprilTag.py',async (error,stdout,stderr) => {
        resolve(stdout)
      })
    })
  }
  
  const getImage_data_py = async () => {
    await download_image(url,file_path)
    await delay(500)
    return new Promise((resolve,reject) => {
      exec('python visual.py',async (error,stdout,stderr) => {
        resolve(stdout)
      })
    })
  }
  
  const ImageProcessing_py = async () => {
    var data = 0
    await getImage_data_py().then(d => {
      data = JSON.parse(d)
    }).catch(e => {})
    await delay(200)
    if(data !== undefined){
      return data
    }
    else{
      return console.log("Package not find")
    }
  }

  // calculate number of package when Packages are under of center camera
const calculateHeigh_py = async () => {
    var S,n
    //await MoveTo(100, -100, 200)
    //await delay(3000)
    S = await ImageProcessing_py()
    console.log(S)
    await delay(1000)
    console.log(S.S)
    return(S.S)
  }
const getNumberPackage_py = async (S) => {
  if( S >= 47555.8 * 0.95 && S <= 47555.8 * 1.05){
    return n = 1
}else if( S >= 54495.3257 * 0.95 && S <= 54495.3257 * 1.05){
    return n = 2
}else if( S >= 61934.139 * 0.95 && S <= 61934.139 * 1.05){
    return n = 3
}else if( S >= 70604.76 * 0.95 && S <= 70604.76 * 1.05){
    return n = 4
}else if( S >= 82578.91 * 0.95 && S <= 82578.91 * 1.05 ){
    return n = 5
}else {
    return console.log("package not find")
}
}

const getCenter_py = async (k=0.305) => {
    var curent_x = 0,curent_y = 0,o =0
    getState( (d) => {
      //console.log(d)
      //console.log(state_data)
      curent_x = d.x
      curent_y = d.y
  })
    await delay(200)
    //await snapshot() 
    //download_image(url,file_path)
    
    o = Math.atan(curent_y *-1/curent_x)
   
    let center = await ImageProcessing_py()
    console.log("center_pixel：" + JSON.stringify(center));
    var dx_center = ((640/2) - center.x_c) * k

    var dy_center = ((480/2) - center.y_c) * (k*1)
    var d = {
      x: dx_center * Math.cos(o) + dy_center * Math.sin(o)  ,  // +dy
      y: dx_center * Math.sin(o) - dy_center * Math.cos(o) } // -dy
      console.log("first angle :",o*180/Math.PI)
      console.log(d)
    return d
  }

module.exports = {getCenter_py,getNumberPackage_py,calculateHeigh_py,getId,ImageProcessing_py}