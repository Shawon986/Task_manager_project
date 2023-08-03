const express = require("express");
const authAccessToken = require("../../middleware/auth");
const router = express.Router();
const Task = require("../../models/task");

router.post("/newTask", [authAccessToken], async (req, res) => {
  try {
    const id = req.payload.id;
    const taskObject = {
      title: req.body.title,
      desc: req.body.desc ?? "",
      userId: id,
    };
    const task = new Task(taskObject);
    res.status(201).json(task);
    await task.save();
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Something went wrong with the server !!!" });
  }
});

//! Get all tasks by visitors
router.get("/get", authAccessToken, async (req, res) => {
  try {
    const id = req.payload.id;
    const task = await Task.find({ userId: id });
    res.json(task);
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Something went wrong with the server !!!" });
  }
});

//! Update a status by visitor
router.put("/status/:id", authAccessToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.payload.id;
    const status = req.body.status;
    const task = await Task.findOneAndUpdate({_id:id,userId:userId}, {status:status}, {
      new: true,
    });
    if (!task) {
      res.status(404).json({ message: "task not found" });
    } else {
      res.json(task);
      await task.save();
    }
  } catch (error) {}
});

//! Update a task by visitor
router.put("/update/:id", authAccessToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.payload.id
    const task = await Task.findOneAndUpdate({_id:id,userId:userId}, req.body, {
      new: true,
    });
    if (!task) {
      res.status(404).json({ message: "task not found" });
    } else {
      res.json(task);
      await task.save();
    }
  } catch (error) {}
});

//! Get a task by visitor
router.get("/getone/:id", authAccessToken,async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.payload.id;
    const task = await Task.findOne({_id: id, userId: userId});
    if (!task) {
      res.status(404).json({ message: "task not found" });
    } else {
      res.json(task);
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Something went wrong with the server !!!" });
  }
});

//! Delete a task by visitor
router.delete("/delete/:id",authAccessToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.payload.id;
    const task = await Task.findOneAndDelete({_id:id,userId:userId});
    if (!task) {
      res.status(404).json({ message: "task not found" });
    } else {
      res.json(task);
    }
  } catch (error) {}
});



module.exports = router;

