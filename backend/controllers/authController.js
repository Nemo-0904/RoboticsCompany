// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

const User = require("../models/User");



const protect = async (req, res, next) => {

  let token;



  // Check for token in Authorization header

  if (

    req.headers.authorization &&

    req.headers.authorization.startsWith("Bearer")

  ) {

    try {

      // Extract token

      token = req.headers.authorization.split(" ")[1];



      // Verify token

      const decoded = jwt.verify(token, process.env.JWT_SECRET);



      // Attach user (without password) to request

      req.user = await User.findById(decoded.id).select("-password");

      next();

    } catch (error) {

      console.error("Auth error:", error.message);

      return res.status(401).json({ message: "Not authorized, token failed" });

    }

  }



  if (!token) {

    return res.status(401).json({ message: "Not authorized, no token" });

  }

};



module.exports = protect;