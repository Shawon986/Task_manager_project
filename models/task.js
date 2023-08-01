const mongoose = require("mongoose");


//! Schema
const taskSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    status: {
      type: String,
      enum:["to-do","in-progress","done"],
      default:"to-do"
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