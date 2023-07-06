const fs = require("fs");

// define offer struct
let Offer = function (id, location) {
    this.id = id;
    this.location = location;
    this.packageID = [];
}

//array for save offers
let offer = [];
const offer_file_path = "offer.json";

//get data from json file and push in array
try {
    let data = JSON.parse(fs.readFileSync(offer_file_path).toString());
    for (let i = 0; i <= data.length - 1; i++) {
        offer[i] = data[i];
    }
} catch (e) {
}

//add new offer in array 
const addOffer = async (id, location = 0) => {
    for (let i = 0; i <= offer.length - 1; i++) {
        if (offer[i].id === id) {
            return console.log("Offer id is already exist.");
        }
    }
    offer.push(new Offer(id, location));
}
//edit location offer by id in array
const editOffer = async (id, location) => {
    for (let i = 0; i <= offer.length - 1; i++) {
        if (offer[i].id === id) {
            return offer[i].location = location;
        }
    }
    return console.log("Offer Id not find.");
}
//add new package in offer by id in array
const pushPackage = async (id, pack) => {
    for (let i = 0; i <= offer.length - 1; i++) {
        if (offer[i].id === id) {
            return offer[i].packageID.push(pack);
        }
    }
    return console.log("Offer Id not find");
}

//reverse package id,which are saved in array
const reversePackage = async (id) => {
    for (let i = 0; i <= offer.length - 1; i++) {
        if (offer[i].id === id) {
            return offer[i].packageID.reverse();
        }
    }
    return console.log("Offer Id not find");
}

// get package id by id
const getPackageData = async (id) => {
    for (let i = 0; i <= offer.length - 1; i++) {
        if (offer[i].id === id) {
            return offer[i].packageID;
        }
    }
    return console.log("Offer Id not find");
}

//get index of array by id
const getIndexOfId = async (id) => {
    for (let i = 0; i <= offer.length - 1; i++) {
        if (offer[i].id === id) {
            return i;
        }
    }
    return -1;
}

//remove offer in array by id
const removeOffer = async (id) => {
    for (let i = 0; i <= offer.length - 1; i++) {
        if (offer[i].id === id) {
            return offer.splice(i, 1);
        }
    }
}

//save array to json file
const saveOfferToJSONFile = async () => {
    let save_data = JSON.stringify(offer);
    fs.writeFileSync(offer_file_path, save_data);
}

module.exports = {
    Offer,
    addOffer,
    reversePackage,
    editOffer,
    pushPackage,
    removeOffer,
    saveOfferToJSONFile,
    getPackageData,
    getIndexOfId,
    offer
}