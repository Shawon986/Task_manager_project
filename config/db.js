const mongoose = require("mongoose");

//! MongoDb connection
const uri = process.env.DB_URI;
const db_connect= ()=>{
    try {
        mongoose
        .connect(uri, { useNewUrlParser: true })
        console.log("DB is connected")
    } catch (error) {
        console.error("DB is not connected")
    }
   
}
module.exports = db_connect
  