const http = require("http");
const { callbackify } = require("util");
const config = require("../config.json")
const axios = require("axios")

// call API MoveTo
const MoveTo =async (x,y,z) => {
  const req =  http.request({
    hostname: config.roboticArmIpAddress,
    path: `/basic/moveTo?msg={"x":%20${x},%20"y":%20${y},%20"z":%20${z}}`,
    port: config.Port,
    method: 'GET'
  }, res => {
    if (res.statusCode !== 200) 
    console.log(res.statusCode)
    res.on("data", d => {
        console.log(d.toString())
        console.log(req.path)
    })
  });
  req.on("error", err => {
    console.log(err)
    console.log(req.path)
  })
  req.end()
}
// call API Move
const Move =async (x,y,z) => {
  const req =  http.request({
    hostname: config.roboticArmIpAddress,
    path: `/basic/move?msg={"x":%20${x},%20"y":%20${y},%20"z":%20${z}}`,
    port: config.Port,
    method: 'GET'
  }, res => {
    if (res.statusCode !== 200) 
    console.log(res.statusCode)
    res.on("data", d => {
        console.log(d.toString())
        console.log(req.path)
    })
  });
  req.on("error", err => {
    console.log(err)
    console.log(req.path)
  })
  req.end()
}
// call API suction
const suction =async (state) => {
  const req =  http.request({
    hostname: config.roboticArmIpAddress,
    path: `/basic/suction?msg={"data":%20${state}}`,
    port: config.Port,
    method: 'GET'
  }, res => {
    if (res.statusCode !== 200) 
    console.log(res.statusCode)
    res.on("data", d => {
        console.log(d.toString())
        console.log(req.path)
    })
  });
  req.on("error", err => {
    console.log(err)
    console.log(req.path)
  })
  req.end()

}
// call API getstate
const getState = async (cb) => {
  // call /basic/state API endpoint
  axios.get('http://' + config.roboticArmIpAddress+':'+config.Port + '/basic/state')
      .then(async function (response) {
          //console.log("/basic/state response received, data:" + JSON.stringify(response.data));
          await cb(response.data)
      })
      .catch(function (error) {
          console.error("Error calling /basic/state API endpoint.");
          console.error(error); 
      })
      
}

 /*const getState =async (callback = () =>{}) => {
  let data = {
    x: 0, y:0 , z:0
  }
  const req = http.request({
    hostname: config.roboticArmIpAddress,
    path: `/basic/state`,
    port: config.Port,
    method: 'GET'
  }, res => {
    if (res.statusCode !== 200) 
    console.log(res.statusCode)
    res.on("data", d => {
        console.log(JSON.parse(d.toString()).x)
        callback(d.toString()) 
        
    })
  });
  req.on("error", err => {
    console.log(err)
    console.log(req.path)
  })
  await req.end()
  await console.log(data.x)
} */

module.exports = {MoveTo,Move,suction,getState}
