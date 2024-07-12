require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const mongo_url = process.env.MONGODB_URL;

mongoose.connect(mongo_url)
  .then( ()=> {
    console.log("Database connected...");
  }).catch( (err) => {
    console.log("Database has some error: " + err);
  })