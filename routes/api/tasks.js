const express = require("express");
const bcrypt = require("bcrypt");
const Visitors = require("../../models/schema");
const jwt = require("jsonwebtoken");
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

//Login a visitor

router.post("/login", async (req, res) => {
  try {
    const { email, password, type, refreshToken } = req.body;
    if (!type) {
      res.status(401).json({ message: "Type is not defined" });
    } else {
      if (type == "email") {
        await emailLogin(email, res, password);
      } else {
        refreshTokenLogin(refreshToken, res, password);
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Something went wrong with the server !!!" });
  }
});
//! Get a visitor profile
router.get("/user/profile", authAccessToken, async (req, res) => {
  try {
    const id = req.payload.id;
    const visitor = await Visitors.findById(id);
    if (!visitor) {
      res.status(404).json({ message: "Visitor  not found" });
    } else {
      res.json(visitor);
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ message: "Something went wrong with the server !!!" });
  }
});

module.exports = router;

function refreshTokenLogin(refreshToken, res, password) {
  if (!refreshToken) {
    res.status(401).json({ message: "RefreshToken is not defined" });
  } else {
    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        res.status(401).json({ message: "Visitor unauthorized" });
      } else {
        const id = payload.id;
        const visitor = await Visitors.findById(id);
        if (!visitor) {
          res.status(404).json({ message: "Visitor  not found" });
        } else {
          const passvalidity = await bcrypt.compare(password, visitor.password);
          if (!passvalidity) {
            res.status(401).json({ message: "Visitor unauthorized" });
          } else {
            getVisitorToken(visitor, res);
          }
        }
      }
    });
  }
}

async function emailLogin(email, res, password) {
  const visitor = await Visitors.findOne({ email: email });
  if (!visitor) {
    res.status(404).json({ message: "Visitor  not found" });
  } else {
    const passvalidity = await bcrypt.compare(password, visitor.password);
    if (!passvalidity) {
      res.status(401).json({ message: "Visitor unauthorized" });
    } else {
      getVisitorToken(visitor, res);
    }
  }
}

function getVisitorToken(visitor, res) {
  const accessToken = jwt.sign(
    { email: visitor.email, id: visitor._id },
    process.env.JWT_SECRET
  );
  const refreshToken = jwt.sign(
    { email: visitor.email, id: visitor._id },
    process.env.JWT_SECRET
  );

  visitorObject = visitor.toJSON();

  visitorObject.accessToken = accessToken;
  visitorObject.refreshToken = refreshToken;

  res.json(visitorObject);
}
