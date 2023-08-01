const mongoose = require("mongoose");


//! Schema
const taskSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    status: {
      type: String,
    },
    userId: {
      type:  mongoose.Schema.Types.ObjectId,
      ref: "Visitors"
    },
    desc: {
        type: String,
        
    }
  },{timestamps:true});
  
  //! Model
  module.exports= Task = mongoose.model("Task", taskSchema);