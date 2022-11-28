require("dotenv").config();

const config = {
  ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET,
  DB_URL:process.env.DB_URL,
};

module.exports = config;
