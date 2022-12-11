const { task_queue } = require("./task")
const { Move_Load_location,
    Move_Unload_location, delay,
    Move_dock_location, Move_dispatch_buffer, receive_buffer, dispatch_buffer, Move_receive_buffer,
    dock_location, Unload_location,temp_array, storage_location, Move_Reset_location, save_data_to_JSON_file, package_height } = require("./location")
const { suction, Move, MoveTo, getState } = require("./http-API")
const circle = require("./visual")
const { getCenter_py, getId, getNumberPackage_py,calculateHeigh_py } = require("./visual_py")
const { Offer, offer, removeOffer, getPackageData, save_Offer_to_JSON_file, getIndexOfId, Add_offer, reverse_package, edit_offer, push_package } = require("./Offer")


let temp_array2 = []

const T_to_R = async (offer_id) => {
    var sucsses = 0
    var at_id, n_p, S
    var dx1, dy1, dx, dy
    // move to location to fetch package
    await Move_Load_location(200)
    /*await download_image(circle.url,circle.file_path) */
    // calculate dx and dy needed to move robot to collinear center camera and package center in z cordinate 
    await getCenter_py().then((data) => {
        dx1 = data.x
        dy1 = data.y
    })
    await Move(dx1, dy1, 0)
    //get area size ellipse twice,
    //for solution afterimage image
    await calculateHeigh_py()
    S = await calculateHeigh_py()
    console.log(S)
    // get number package in load location
    try {
        n_p = await getNumberPackage_py(S)
    } catch (e) {
        console.log(e)
    }
    console.log("Package Height:", n_p)
    if (n_p === undefined || n_p === 0) {
        return console.log("Package not find")
    }
    // add new offer
    try {
        await Add_offer(offer_id, "receive buffer")
    } catch (e) { }
    var c = 0
    for (n_p; n_p >= 1; n_p--) {
        var absx,absy
        var h = (200 - (n_p - 1) * package_height)
        // it height to need on top of package for calculate dx and dy
        var s = (h - 100) * -1
        await Move(0, 0, s)
        await delay(1500)
        // calculate just first time in task
        if (c === 0) {
            await getCenter_py(0.17).then(d => {
                dx = d.x
                dy = d.y
                c++
            })
            await Move(dx, dy, 0)
            await delay(1000)
            //save abs. cordinate
            absx = 135 + dx1 + dx
            absy = -135 + dy1 +dy
        }
        //get apritag id
        at_id = await getId()
        //offset suction and camera
        await circle.offsetToll()
        await delay(1500)
        console.log("package Id:", Number(at_id))
        await Move(0, 0, -35)
        await delay(1500)
        await suction(true)
        await delay(1500)
        await Move(0, 0, 60)
        await delay(1500)
        //move to receive buffer
        await Move_receive_buffer("load")
        await Move(0, 0, -20)
        await delay(1000)
        await suction(false)
        await delay(2000)
        await Move(0, 0, 60)
        await delay(1500)
        // if package is not only one. turn back location where is package
        if(n_p!==1){
            await MoveTo(absx,absy,h)
            await delay(2500)
        }
        // push packge id to array
        try {
            await push_package(offer_id, Number(at_id))
        } catch (e) { }
        await receive_buffer.storage.push(Number(at_id))
    }
    return sucsses = 1
}

//move from receive buffer to dock location
const R_to_S = async (offer_id) => {
    try {
        var i = receive_buffer.storage.length
        console.log(i)
        var location = storage_location()
        for (i; i >= 1; i--) {
            await Move_receive_buffer("unload")
            await Move(0, 0, -20)
            await delay(1000)
            await suction(true)
            await delay(1500)
            await Move(0, 0, 60)
            await delay(1500)
            await Move_dock_location(location, "load")
            await Move(0, 0, -20)
            await delay(1000)
            await suction(false)
            await delay(2000)
            await Move(0, 0, 60)
            await delay(2000)
            try {
                await dock_location[location].storage.push(receive_buffer.storage.pop())
            } catch (e) {
                console.log(e)
            }

            console.log(dock_location[location].storage)
            try {
                await edit_offer(offer_id, location)
            } catch (e) { }
        }
        await reverse_package(Number(offer_id))
    } catch (e) {

    }

}

//move from dock location to dispatch buffer
const S_to_D = async (i) => {
    await Move_dock_location(i, "unload")
    await Move(0, 0, -20)
    await delay(1000)
    await suction(true)
    await delay(1500)
    await Move(0, 0, 60)
    await delay(1500)
    await Move_dispatch_buffer("load")
    await Move(0, 0, -20)
    await delay(1000)
    await suction(false)
    await delay(2000)
    await Move(0, 0, 60)
}

//move from dispatch buffer to unload location
const D_to_T = async () => {
        await Move_dispatch_buffer("unload")
        await Move(0, 0, -20)
        await delay(1000)
        await suction(true)
        await delay(1500)
        await Move(0, 0, 60)
        await delay(1500)
        await Move_Unload_location()
        await Move(0, 0, -20)
        await delay(1000)
        await suction(false)
        await delay(2000)
        await Move(0, 0, 60)
}

const robot_auto = async () => {
    if (task_queue[0] !== undefined) {
        if (task_queue[0].mode === "load") {
            // Move package from transport car to receive buffer
            var Step1 = await T_to_R(Number(task_queue[0].offerId))
            if(Step1 !== 1){
                return console.log("Step 1 error.")
            }
            await Move_Reset_location()
            // Move package from receive buffer to dock
            await R_to_S(Number(task_queue[0].offerId))
            await Move_Reset_location()
            //remove task from task queue
            await task_queue.shift()
            //save data
            await save_data_to_JSON_file()
            await save_Offer_to_JSON_file()
            await delay(1000)
            console.log("task done")
        }
<<<<<<< HEAD
        else if (task_queue[0].mode === "unload") {
            try{
                var packageData = await getPackageData(Number(task_queue[0].offerId))
                var packageData_len = packageData.length
                console.log("package length: ",packageData_len)
                console.log(packageData[packageData_len - 1])
            } catch(e){
                console.log("Offer Id :",task_queue[0].offerId,"dont exist.")
                return task_queue.shift()     
=======
        else if(task_queue[0].mode === "unload"){
            // i = dock location; j = level
            var i,j
            for(i =1; i<=4 ; i++){
                var parse_dock = []
                 if(dock_location[i].storage.indexOf(task_queue[0].offerId) !== -1){
                    j = dock_location[i].storage.indexOf(task_queue[0].offerId)
                    break
                } 
                 else{ 
                      if(i===4){
                    j=-1
                    console.log("offerId: ", task_queue[0].offerId, "don't exsist.")
                    await task_queue.shift()
                    await delay(1000)
                    break  }              
                }
>>>>>>> e8126049379f8350a39a794aaa5822bc5fa6da77
            }
            // i = dock location; j = level
            var i, j
            for (i = 1; i <= 4; i++) {
                var found = 0
                var dock_lent = dock_location[i].storage.length
                for(dock_lent;dock_lent>=1;dock_lent--){
                    if(dock_location[i].storage[dock_lent-1] === packageData[packageData_len-1]){
                    j = dock_lent - 1
                    found = 1
                    console.log(j)
                    break
                    }
                }
                /* if (dock_location[i].storage.indexOf(packageData[packageData_len - 1]) !== -1) {
                    j = dock_location[i].storage.indexOf(packageData[packageData_len - 1])
                    console.log(j)
                    break */
                if(found === 1){
                        break
                    }
            }
            if (j !== -1) {
                // check if OfferId package in the highest level
                if (j === (dock_location[i].storage.length - 1)) {
                    /* await Move_dock_location(i,"unload")
                    await Move(0,0,-20)
                    await delay(1000)
                    await suction(true)
                    await delay(1500)
                    await Move(0,0,60)
                    await delay(1500)
                    await Move_Unload_location()
                    await Move(0,0,-35)
                    await delay(1000)
                    await suction(false)
                    await delay(2000)
                    await Move(0,0,60)
                    await delay(1000)
                    await Move_Reset_location()
                    await dock_location[i].storage.pop()
                    await task_queue.shift()
                    await delay(1000)
                    await save_data_to_JSON_file() */
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await S_to_D(i)
                        await Move_Reset_location()
                        await dispatch_buffer.storage.push(dock_location[i].storage.pop())
                        
                    }
                    var dl=dispatch_buffer.storage.length
                    for(dl;dl>=1;dl--){
                        await D_to_T(i)
                        await Move(0,0,100)
                        await delay(1500)
                        await Unload_location.storage.push(dispatch_buffer.storage.pop())
                    }
                        //await removeOffer(task_queue[0].offerId)
                        await Move_Reset_location()
                        await removeOffer(Number(task_queue[0].offerId))
                        await task_queue.shift()
                        Unload_location.storage = []
                        await delay(1000)
                        await save_data_to_JSON_file()
                        await save_Offer_to_JSON_file()
                        console.log("task done")
                }
                else {
                    // calculate how many package need to remove to get target package
                    var k = dock_location[i].storage.length - 1 - j
                    var temp_level = 0
                    // remove package on the target package
                    for (var l = 0; l <= k - 1; l++) {
                        await Move_dock_location(i, "unload")
                        await Move(0, 0, -22)
                        await delay(1000)
                        await suction(true)
                        await delay(1500)
                        await Move(0, 0, 60)
                        await delay(1500)
                        // temp area
                        //54 -> tool height, 20 -> distance for prevention collision
                        // 12 package height
                        await MoveTo(0, -120, 60 + (package_height * l) + package_height + 20)
                        await delay(2000)
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(false)
                        await delay(2000)
                        await Move(0, 0, 100)
                        await delay(1500)
                        await temp_array2.push(dock_location[i].storage.pop())
                        temp_level++
                    }
                    // move target package to unload area
                    /* await Move_dock_location(i,"unload")
                    await Move(0,0,-20)
                    await delay(1000)
                    await suction(true)
                    await delay(1500)
                    await Move(0,0,60)
                    await delay(1500)
                    await Move_Unload_location()
                    await Move(0,0,-35)
                    await delay(1000)
                    await suction(false)
                    await delay(2000)
                    await Move(0,0,60)
                    await delay(1000) 
                    await Move_Reset_location()
                    await dock_location[i].storage.pop()
                    await delay(1000)*/
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await S_to_D(i)
                        await Move(0,0,100)
                        await delay(1500)
                        await dispatch_buffer.storage.push(dock_location[i].storage.pop())
                        
                    }
                    var dl=dispatch_buffer.storage.length
                    for(dl;dl>=1;dl--){
                        await D_to_T(i)
                        await Move(0,0,100)
                        await delay(1500)
                        await Unload_location.storage.push(dispatch_buffer.storage.pop())
                    }
                        //await removeOffer(task_queue[0].offerId)
                        await removeOffer(Number(task_queue[0].offerId))
                        await task_queue.shift()
                        Unload_location.storage = []
                        await delay(1000)
                    // resotre package in temp area
                    var temp_var_for = JSON.parse(JSON.stringify(temp_level))
                    for (var n = 0; n < temp_var_for; n++) {
                        await MoveTo(0, -120, 53 + (package_height * temp_level) + 20)
                        await delay(2000)
                        await Move(0, 0, -20)
                        await delay(1500)
                        await suction(true)
                        await delay(1500)
                        await Move(0, 0, 60)
                        await delay(1500)
                        await Move_dock_location(i, "load")
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(false)
                        await delay(2000)
                        await Move(0, 0, 60)
                        await delay(1500)
                        await Move_Reset_location()
                        await dock_location[i].storage.push(temp_array2.pop())
                        await delay(1000)
                        temp_level--
                    }
                    // task finish
                    await task_queue.shift()
                    await delay(1000)
                    await save_data_to_JSON_file()
                    await save_Offer_to_JSON_file()
                    console.log("task done")
                }

            }

        }
<<<<<<< HEAD
        else if (task_queue[0].mode === "relocation") {
            try{
                var packageData = await getPackageData(Number(task_queue[0].offerId))
                var packageData_len = packageData.length
                console.log("package length: ",packageData_len)
                console.log(packageData[packageData_len - 1])
            } catch(e){
                console.log("Offer Id :",task_queue[0].offerId,"dont exist.")
                return task_queue.shift()     
=======
        else if(task_queue[0].mode === "relocation" ){
            //offerId,and target location relocation
            // i = dock location; j = level
            var i,j
             for(i =1; i<=4 ; i++){
                var parse_dock = []
                 if(dock_location[i].storage.indexOf(task_queue[0].offerId) !== -1){
                    j = dock_location[i].storage.indexOf(task_queue[0].offerId)
                    break
                } 
                 else{ 
                      if(i===4){
                    j=-1
                    console.log("offerId: ", task_queue[0].offerId, "don't exsist.")
                    await task_queue.shift()
                    await delay(1000)
                    break  }              
                }
>>>>>>> e8126049379f8350a39a794aaa5822bc5fa6da77
            }
            // i = dock location; j = level
            var i, j
            for (i = 1; i <= 4; i++) {
                var found = 0
                var dock_lent = dock_location[i].storage.length
                for(dock_lent;dock_lent>=1;dock_lent--){
                    if(dock_location[i].storage[dock_lent-1] === packageData[packageData_len-1]){
                    j = dock_lent - 1
                    found = 1
                    console.log(j)
                    break
                    }
                }
                /* if (dock_location[i].storage.indexOf(packageData[packageData_len - 1]) !== -1) {
                    j = dock_location[i].storage.indexOf(packageData[packageData_len - 1])
                    console.log(j)
                    break */
                if(found === 1){
                        break
                    }
            }
            if (j !== -1) {
                // check if OfferId package in the highest level 
                if (j === (dock_location[i].storage.length - 1)) {
                    /* await Move_dock_location(i,"unload")
                    await Move(0,0,-20)
                    await delay(1000)
                    await suction(true)
                    await delay(1500)
                    await Move(0,0,60)
                    await delay(1500)
                    await Move_dock_location(task_queue[0].location,"load")
                    await Move(0,0,-20)
                    await delay(1000)
                    await suction(false)
                    await delay(2000)
                    await Move(0,0,60)
                    await delay(1000)
                    await Move_Reset_location()
                    await dock_location[task_queue[0].location].storage.push(dock_location[i].storage.pop())
                    await task_queue.shift()
                    await delay(1000)
                    await save_data_to_JSON_file() */
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await Move_dock_location(i, "unload")
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(true)
                        await delay(1500)
                        await Move(0, 0, 60)
                        await delay(1500)
                        await Move_dock_location(task_queue[0].location, "load")
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(false)
                        await delay(2000)
                        await Move(0, 0, 100)
                        await delay(1000)
                        await dock_location[task_queue[0].location].storage.push(dock_location[i].storage.pop())
                        await delay(1000)
                    }
                    var Offerid = (Number(task_queue[0].offerId))
                    await edit_offer(Number(task_queue[0].offerId), Number(task_queue[0].location))
                    console.log(Offerid)
                    await reverse_package(Offerid)
                        await Move_Reset_location()
                        await task_queue.shift()
                        await save_data_to_JSON_file()
                        await save_Offer_to_JSON_file()
                        console.log("task done")
                }
                else {
                    // calculate how many package need to remove to get target package
                    var k = dock_location[i].storage.length - 1 - j
                    var temp_level = 0
                    // remove package on the target package
                    for (var l = 0; l <= k - 1; l++) {
                        await Move_dock_location(i, "unload")
                        await Move(0, 0, -22)
                        await delay(1000)
                        await suction(true)
                        await delay(1500)
                        await Move(0, 0, 60)
                        await delay(1500)
                        // temp area
                        //54 -> tool height, 20 -> distance for prevention collision
                        // 12 package height
                        await MoveTo(0, -120, 60 + (package_height * l) + package_height + 20)
                        await delay(2000)
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(false)
                        await delay(2000)
                        await Move(0, 0, 100)
                        await delay(1500)
                        await temp_array2.push(dock_location[i].storage.pop())
                        temp_level++
                    }
                    // move target package to target location
                    for (packageData_len; packageData_len >= 1; packageData_len--) {
                        await Move_dock_location(i, "unload")
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(true)
                        await delay(1500)
                        await Move(0, 0, 60)
                        await delay(1500)
                        await Move_dock_location(task_queue[0].location, "load")
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(false)
                        await delay(2000)
                        await Move(0, 0, 100)
                        await delay(1000)
                        await dock_location[task_queue[0].location].storage.push(dock_location[i].storage.pop())
                        await delay(1000)
                    }
                    var Offerid = (Number(task_queue[0].offerId))
                    await edit_offer(Number(task_queue[0].offerId), Number(task_queue[0].location))
                    console.log(Offerid)
                    await reverse_package(Offerid)
                    
                    

                    // resotre package of temp area
                    var temp_var_for = JSON.parse(JSON.stringify(temp_level))
                    for (var n = 0; n < temp_var_for; n++) {
                        await MoveTo(0, -120, 53 + (package_height * temp_level) + 20)
                        await delay(2000)
                        await Move(0, 0, -20)
                        await delay(1500)
                        await suction(true)
                        await delay(1500)
                        await Move(0, 0, 60)
                        await delay(1500)
                        await Move_dock_location(i, "load")
                        await Move(0, 0, -20)
                        await delay(1000)
                        await suction(false)
                        await delay(2000)
                        await Move(0, 0, 100)
                        await delay(1500)
                        await dock_location[i].storage.push(temp_array2.pop())
                        await delay(1000)
                        temp_level--
                    }
                    // task finish
                    await Move_Reset_location()
                    await task_queue.shift()
                    await delay(1000)
                    await save_data_to_JSON_file()
                    await save_Offer_to_JSON_file()
                    console.log("task done")
                }
            }
        }
        else {
            await task_queue.shift()
            console.log("Invalid task")
        }


    }
    else {
        console.log("No task in queue")
    }
}

<<<<<<< HEAD
module.exports = { robot_auto, T_to_R, R_to_S }
=======
module.exports = {robot_auto}
>>>>>>> e8126049379f8350a39a794aaa5822bc5fa6da77
