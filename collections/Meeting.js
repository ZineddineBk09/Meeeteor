const mongoose = require("mongoose");

//define the collection(table) fields and theire data types
const MeetingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must provide a name for the User"],
    trim: true, //remove uneccessary spaces
    maxlength: [20, "name cannot surpasse 20 caracters"],
  },
  date: {
    type: String,
    default: new Date().toLocaleDateString().toString(), //today date
  },
});

module.exports = mongoose.model("Meeting", MeetingSchema);
