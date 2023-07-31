const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
app.use(bodyParser.json());
const db_connect = require("./config/db");



//! MongoDb connection
db_connect()


//! Connection Check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Login Authentication app" });
});
//! Routes
app.use("/api/visitors",require("./routes/api/route"))



const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
