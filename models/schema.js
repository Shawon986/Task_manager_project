const mongoose = require("mongoose");


//! Schema
const VisitorSchema = new mongoose.Schema({
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },{timestamps:true});
  
  //! Model
  module.exports= Visitors = mongoose.model("Visitor", VisitorSchema);