require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");


const mapboxToken = process.env.MAP_TOKEN;
console.log(mapboxToken);

const geoCodingClient = mboxGeocoding({ accessToken: mapboxToken });
const MONGO_URL = "mongodb://127.0.0.1:27017/HomelyGo";

main()
    .then(() => console.log("Connected to Database successfully"))
    .catch((err) => console.error("Database connection error:", err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const ownerId = '68345504c065ca8aba69b578';

    for (let item of initData.data) {
        try {
            const geoResponse = await geoCodingClient
                .forwardGeocode({
                    query: `${item.location}, ${item.country}`,
                    limit: 1
                })
                .send();

            const geometry = geoResponse.body.features[0]?.geometry;

            if (!geometry) {
                console.warn(`⚠️  Could not geocode: ${item.title}. Skipping.`);
                continue;
            }

            const newListing = new Listing({
                ...item,
                owner: ownerId,
                geometry
            });

            await newListing.save();
            console.log(`✅ Saved: ${item.title} — [${geometry.coordinates}]`);
        } catch (err) {
            console.error(`❌ Error inserting ${item.title}:`, err.message);
        }
    }

    console.log("🎉 All listings inserted with coordinates.");
};

initDB();