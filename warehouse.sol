// SPDX-License-Identifier: MIT
pragma solidity >=0.5.17;

contract warehouse {

    struct Offer{
        uint256 ID;
        uint8 storage_location;
        
    }

    Offer[] public offers;
    mapping(uint => uint[]) PackageData;

    function getPackage(uint id) public view returns(uint256[] memory) {
        return PackageData[id];
    }
    function setPackage(uint id,uint[] memory packageId) public returns(uint256[] memory) {
        for(uint i = 0; i <= packageId.length - 1; i++){
            PackageData[id].push(packageId[i]);
        }
        return PackageData[id];
    }

    function addOffer(uint256 ID,uint8 storage_location,uint[] memory packageId) public {
        offers.push(Offer(ID,storage_location));
        setPackage(ID,packageId);
    }

    function changeLocation(uint256 ID,uint8 storage_location) public {
        uint256 len = offers.length;
        for(uint256 i = 0;i <= len-1; i++){
            if(offers[i].ID == ID){
                offers[i].storage_location = storage_location;
            }
        }
    }
    function getOfferData(uint256 ID) public view returns(Offer memory){
        uint256 len = offers.length;
        Offer memory data;
        for(uint256 i = 0;i <= len-1; i++){
            if(offers[i].ID == ID){
                data = offers[i];
            }
        }
        return data;
    }

    function removeOffer(uint256 ID) public {
        uint256 len = offers.length;
        uint256 index;
        uint256 len_p = PackageData[ID].length;
        for (uint256 i = 0; i <= len - 1; i++) {
            if (offers[i].ID == ID) {
                index = i;
            }
        }
        require(index < offers.length, "index out of bound");
        for (uint256 k = index; k < offers.length - 1; k++) {
            offers[k] = offers[k + 1];
        }
        for (uint256 j = 0; j <= len_p - 1; j++){
            PackageData[ID].pop();
        }
        offers.pop();
    }

}
