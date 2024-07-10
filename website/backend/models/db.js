const mongoose = require('mongoose');
const mongo_url = process.env.MONGODB_URI;

mongoose.connect(mongo_url)
  .then( ()=> {
    console.log("Database connected...");
  }).catch( (err) => {
    console.log("Database has some error: " + err);
  })