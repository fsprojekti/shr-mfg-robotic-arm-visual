const http = require("http");
const config = require("../config.json");
const axios = require("axios");

// call API MoveTo
const moveTo = async (x, y, z) => {
    const req = http.request({
        hostname: config.roboticArmIpAddress,
        path: `/basic/moveTo?msg={"x":%20${x},%20"y":%20${y},%20"z":%20${z}}`,
        port: config.port,
        method: 'GET'
    }, res => {
        if (res.statusCode !== 200)
            console.log(res.statusCode);
        res.on("data", d => {
            console.log(d.toString());
            console.log(req.path);
        })
    });
    req.on("error", err => {
        console.log("error calling moveTo API");
        // console.log(err);
        console.log(req.path);
    })
    req.end();
}
// call API Move
const move = async (x, y, z) => {
    const req = http.request({
        hostname: config.roboticArmIpAddress,
        path: `/basic/move?msg={"x":%20${x},%20"y":%20${y},%20"z":%20${z}}`,
        port: config.port,
        method: 'GET'
    }, res => {
        if (res.statusCode !== 200)
            console.log(res.statusCode);
        res.on("data", d => {
            console.log(d.toString());
            console.log(req.path);
        })
    });
    req.on("error", err => {
        console.log("error calling move API");
        // console.log(err);
        console.log(req.path);
    })
    req.end()
}
// call API suction
const suction = async (state) => {
    const req = http.request({
        hostname: config.roboticArmIpAddress,
        path: `/basic/suction?msg={"data":${state}}`,
        port: config.port,
        method: 'GET'
    }, res => {
        if (res.statusCode !== 200)
            console.log(res.statusCode);
        res.on("data", d => {
            console.log(d.toString());
            console.log(req.path);
        })
    });
    req.on("error", err => {
        console.log("error calling suction API");
        // console.log(err);
        console.log(req.path);
    })
    req.end()

}
// call API getState
const getState = async (cb) => {
    // call /basic/state API endpoint
    axios.get('http://' + config.roboticArmIpAddress + ':' + config.port + '/basic/state')
        .then(async function (response) {
            //console.log("/basic/state response received, data:" + JSON.stringify(response.data));
            await cb(response.data);
        })
        .catch(function (error) {
            console.error("Error calling /basic/state API endpoint.");
            // console.error(error);
        })

}

module.exports = {moveTo, move, suction, getState};
