const { add } = require("mathjs")
const { delay, dock_location } = require("./location")
const fs = require("fs")

// define offer struct
let Offer = function (id,location) {
    this.id = id
    this.location = location
    this.packageID = []
}

//array for save offers
let offer = [] 
const offer_file_path = "offer.json" 

//get data from json file and push in array
try{
    var data = JSON.parse(fs.readFileSync(offer_file_path))
    for(var i = 0 ; i <= data.length - 1; i++) {
        offer[i] = data[i]
    }
} catch(e) {
}

//add new offer in array 
const Add_offer =async (id,location=0) => {
    for(var i = 0; i <= offer.length - 1; i++){
        if(offer[i].id === id){
            return console.log("Offer id is already exist.")
        }
    }
    offer.push(new Offer(id,location))
}
//edit location offer by id in array
const edit_offer =async (id,location) => {
    for(var i = 0; i <= offer.length - 1; i++){
        if(offer[i].id === id){
            return offer[i].location = location
        }
    }
    return console.log("Offer Id not find.")
}
//add new package in offer by id in array
const push_package =async (id,package) => {
    for(var i = 0; i <= offer.length - 1; i++){
        if(offer[i].id === id){
            return offer[i].packageID.push(package)
        }
    }
    return console.log("Offer Id not find")
}

//reverse package id,which are saved in array
const reverse_package =async (id) => {
    for(var i = 0; i <= offer.length - 1; i++){
        if(offer[i].id === id){
            return offer[i].packageID.reverse()
        }
    }
    return console.log("Offer Id not find")
}

// get package id by id
const getPackageData = async (id) => {
    for(var i = 0; i <= offer.length - 1; i++){
        if(offer[i].id === id){
            return offer[i].packageID
        }
    }
    return console.log("Offer Id not find")
}

//get index of array by id
const getIndexOfId = async (id) => {
    for(var i = 0; i <= offer.length - 1; i++){
        if(offer[i].id === id){
            return i
        }
    }
    return -1
}

//remove offer in array by id
const removeOffer = async (id) => {
    for(var i = 0; i <= offer.length - 1; i++){
        if(offer[i].id === id){
            return offer.splice(i,1)
        }
    }
}

//save array to json file
const save_Offer_to_JSON_file =async () => {
    var save_data = JSON.stringify(offer)
    fs.writeFileSync(offer_file_path,save_data)
    }


module.exports = {Offer,getIndexOfId,Add_offer,reverse_package,edit_offer,push_package,removeOffer,save_Offer_to_JSON_file,getPackageData,offer}

/* Add_offer(12,2)
//console.log(offer)
Add_offer(12,2)
push_package(12,123)
push_package(12,124)
console.log(offer)
reverse_package(1)
//removeOffer(12)
//removeOffer(13)
console.log(offer)
console.log(getPackageData(12)) */