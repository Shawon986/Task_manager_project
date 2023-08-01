const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
app.use(bodyParser.json());
const db_connect = require("./config/db");

//! MongoDb connection
db_connect();

//! Connection Check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Task Manager app" });
});
//! Routes
app.use("/api/visitors", require("./routes/api/route"));
app.use("/api/tasks", require("./routes/api/tasks"));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
