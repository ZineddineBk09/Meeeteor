const mongoose = require("mongoose");

//define the collection(table) fields and theire data types
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must provide a name for the User"],
    trim: true, //remove uneccessary spaces
    maxlength: [20, "name cannot surpasse 20 caracters"],
  },
  email: {
    type: String,
    trim: true, //remove uneccessary spaces
  },
  password: {
    type: String,
  },
  password2: {
    type: String,
  },
  isTeacher: {
    type: Boolean,
    default: false,
  },

  date: {
    type: String,
    default: new Date().toLocaleDateString().toString(), //today date
  },
  meetings: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("User", UserSchema);
