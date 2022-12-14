var jwt = require("jsonwebtoken");
const { promisify } = require("util");
const config = require("../config");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  try {
    // console.log(req.headers)
    // let token;
    // if (
    //   req.headers.authorization &&
    //   req.headers.authorization.startsWith("Bearer")
    // ) {
    //   token = req.headers.authorization.split(" ")[1];
    // }

    const token = req.cookies.token; // getting token from  user cookie

    if (!token) {
      return res.status(401).json({
        message: "not authorized",
      });
    }
    // Verify the token using jwt.verify method
    const decodedUserId = await promisify(jwt.verify)(
      // promisify return promise and decoded token has obtained user id and access secret token
      token,
      config.ACCESS_JWT_SECRET
    );
    const user = await User.findById(decodedUserId.id);
    req.user = user;
  } catch (err) {
    return res.status(401).json({ error: err });
  }

  next();
};
