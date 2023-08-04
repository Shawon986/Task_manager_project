const express = require("express");
const bcrypt = require("bcrypt");
const Visitors = require("../../models/schema")
const jwt = require("jsonwebtoken");
const authAccessToken = require("../../middleware/auth")
const router = express.Router()
const {body, validationResult} = require("express-validator")


//! Create Visitor
router.post("/",[
  body("name","Please input the name").notEmpty(),
  body("email","Please input your valid email address").isEmail(),
  body("email","Email cannot be empty").notEmpty(),
  body("password","password cannot be empty").notEmpty(),
  body("password","password must be 8-14 charecter").isLength({min:8,max:14})
], async (req, res) => {
    try {
      
      const errors = validationResult(req)
      let error = errors.array().map((error)=>error.msg)
      if(!errors.isEmpty()){
        return res.status(400).json({errors:error})
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.password, salt);
      const password = hashedPass;
      const visitorObject = {
        name: req.body.name,
        email: req.body.email,
        password: password,
      };
      const visitor = new Visitors(visitorObject);
      res.status(201).json(visitor);
      await visitor.save();
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Something went wrong with the server !!!" });
    }
  });

  //! Get all visitors
router.get("/", async (req, res) => {
    try {
      const visitor = await Visitors.find();
      res.json(visitor);
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Something went wrong with the server !!!" });
    }
  });

  //! Get a visitor by id
router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const visitor = await Visitors.findById(id);
      if (!visitor) {
        res.status(404).json({ message: "Visitor not found" });
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

  //! Update a visitor by id
router.put("/:id", async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.password, salt);
      const id = req.params.id;
      const visitor = await Visitors.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!visitor) {
        res.status(404).json({ message: "Visitor not found" });
      } else {
        visitor.password = hashedPass;
        res.json(visitor);
        await visitor.save();
      }
    } catch (error) {}
  });
  
  //! Delete a visitor by id
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const visitor = await Visitors.findByIdAndDelete(id);
      if (!visitor) {
        res.status(404).json({ message: "Visitor not found" });
      } else {
        res.json(visitor);
      }
    } catch (error) {}
  });
  
  //Login a visitor

router.post("/login",[
  body("type","Type must be either Email or Refresh").isIn(["email","refresh"])
], async (req, res) => {
    try {
      const errors = validationResult(req)
      let error = errors.array().map((error)=>error.msg)
      if(!errors.isEmpty()){
        return res.status(400).json({errors:error})
      }  
      const { email, password, type, refreshToken } = req.body;
      
        if (type == "email") {
          await emailLogin(email, res, password);
        } else {
          refreshTokenLogin(refreshToken, res, password);
        }
      }
     catch (error) {
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

  module.exports = router

  function refreshTokenLogin(refreshToken, res, password) {
    if (!refreshToken) {
      res.status(401).json({ message: "RefreshToken is not defined" });
    } else {
      jwt.verify(
        refreshToken,
        process.env.JWT_SECRET,
        async (err, payload) => {
          if (err) {
            res.status(401).json({ message: "Visitor unauthorized" });
          } else {
            const id = payload.id;
            const visitor = await Visitors.findById(id);
            if (!visitor) {
              res.status(404).json({ message: "Visitor  not found" });
            } else {
              const passvalidity = await bcrypt.compare(
                password,
                visitor.password
              );
              if (!passvalidity) {
                res.status(401).json({ message: "Visitor unauthorized" });
              } else {
                getVisitorToken(visitor, res);               
              }
            }
          }
        }
      );
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
  