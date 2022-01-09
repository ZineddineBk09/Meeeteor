const mongoose = require("mongoose");

const connectDB = (url) => {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connection successful to DB");
};

module.exports = connectDB;
