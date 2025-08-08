const mongoose = require("mongoose");
const { ProductData, FeatureData } = require("./data.js");
const Product = require("../models/Product.js");
const Feature = require("../models/feature.js");

const MONGO_URL = "mongodb+srv://makwanadharmik311:mr.dharmik31@cluster0.hlgqmfm.mongodb.net/";

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Product.deleteMany({});
  await Product.insertMany(ProductData);
  console.log("Product data was initialized");

  await Feature.deleteMany({});
  await Feature.insertMany(FeatureData);
  console.log("Feature data was initialized.");
};

initDB();
