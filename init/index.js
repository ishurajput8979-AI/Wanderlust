// const mongoose = require('mongoose');
// const initData = require('./data.js');
// const Listing = require('../modules/listing.js');

// const Mongo_URL = 'mongodb://127.0.0.1:27017/wanderlust';

// main().then(()=>{
//     console.log('connected to DB');
// }).catch((err)=>{
//     console.log(err);
// });


// async function main() {
//     await mongoose.connect(Mongo_URL);
// }

// const initDB = async () => {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) => ({...obj, owner:'6aa6646ffb3a56655fcb2004'}))
//     await Listing.insertMany(initData.data);
//     console.log('Database initialized with data');
// };

// initDB();

const mongoose = require('mongoose');

const initData = require('./data.js');

const Listing = require('../modules/listing.js');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

require('dotenv').config();

const Mongo_URL = 'mongodb://127.0.0.1:27017/wanderlust';

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});


main().then(()=>{

    console.log('connected to DB');

}).catch((err)=>{

    console.log(err);

});


async function main() {

    await mongoose.connect(Mongo_URL);

}


const initDB = async () => {

    await Listing.deleteMany({});

    const listings = [];

    for (let obj of initData.data) {

        let response = await geocodingClient.forwardGeocode({
            query: obj.location,
            limit: 1,
        }).send();

        if (response.body.features.length === 0) {
            console.log(`Location not found: ${obj.location}`);
            continue;
        }

        let geometry = response.body.features[0].geometry;

        listings.push({
            ...obj,
            owner: '6aa6646ffb3a56655fcb2004',
            geometry: geometry
        });

        console.log(`${obj.location} →`, geometry.coordinates);
    }

    await Listing.insertMany(listings);

    console.log('Database initialized with data + geometry');

};

initDB();