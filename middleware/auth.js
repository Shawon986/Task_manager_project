const jwt = require("jsonwebtoken");

//Middleware
module.exports= function (req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    res.status(500).json({message:"AuthHeader is not found"});
    return
  }
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken) {
    res.status(401).json({ message: "Visitor unauthorized" });
    return
  } else {
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        res.status(401).json({ message: "Visitor unauthorized" });
      } else {
        req.payload = payload;
        next();
      }
    });
  }
};