require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const mongo_url = process.env.MONGODB_URL;
console.log("in db.js");

mongoose.connect(mongo_url)
  .then( ()=> {
    console.log("Database connected...");
  }).catch( (err) => {
    console.log("Database has some error: " + err);
  })

module.exports = mongoose;